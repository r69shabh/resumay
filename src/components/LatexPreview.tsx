"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PdfPages from "./PdfPages";
import { AlertCircle, Loader2, RotateCw, X } from "lucide-react";
import { Button } from "./ui/button";

export type PreviewInfo = {
  pdfUrl: string | null;
  log: string;
  failed: boolean;
  busy: boolean;
};

// Server-side compile via /api/compile (tectonic).
// Recompiles `source` ~1.2s after it stops changing; keeps the last good PDF visible.
export default function LatexPreview({
  source,
  onInfo,
}: {
  source: string;
  onInfo?: (info: PreviewInfo) => void;
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [log, setLog] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  const busyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onInfo?.({ pdfUrl, log, failed, busy });
  }, [pdfUrl, log, failed, busy, onInfo]);

  const run = useCallback(async (src: string) => {
    // Abort any prior in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    busyRef.current = true;
    setBusy(true);

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: src }),
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      if (res.ok) {
        const url = URL.createObjectURL(await res.blob());
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setFailed(false);
        setLog("");
      } else {
        const data = (await res.json().catch(() => ({}))) as { log?: string; error?: string };
        const isTimeout = res.status === 504;
        const msg = data.log || (isTimeout ? "Compilation timed out (HTTP 504). Please retry." : `Compile failed (HTTP ${res.status})`);
        setLog(msg);
        setFailed(true);
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        const msg = e instanceof Error ? e.message : String(e);
        setLog(msg.includes("aborted") ? "" : msg);
        if (!msg.includes("aborted")) {
          setFailed(true);
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        busyRef.current = false;
        const next = pendingRef.current;
        pendingRef.current = null;
        if (next !== null) {
          void run(next);
        } else {
          setBusy(false);
        }
      }
    }
  }, []);

  const recompile = useCallback(() => {
    setFailed(false);
    void run(source);
  }, [run, source]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (busyRef.current) pendingRef.current = source;
      else void run(source);
    }, 1200);

    return () => {
      clearTimeout(t);
    };
  }, [source, run]);

  const isTimeout = log.includes("504") || log.toLowerCase().includes("timed out") || log.toLowerCase().includes("timeout");

  // CASE 1: We already have a valid PDF preview
  if (pdfUrl) {
    return (
      <div className="relative h-full w-full">
        <PdfPages key={pdfUrl} url={pdfUrl} />

        {/* Loading Spinner Indicator */}
        {busy && (
          <div className="absolute right-4 top-16 z-20 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-medium text-foreground shadow-md backdrop-blur-md animate-in fade-in">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span>Recompiling…</span>
          </div>
        )}

        {/* Floating Non-Blocking Error Alert Banner */}
        {failed && (
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-card/95 p-3 text-xs text-foreground shadow-lg backdrop-blur animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span className="truncate font-medium">
                {isTimeout
                  ? "Compiler timed out — showing previous preview"
                  : "LaTeX syntax error — showing previous preview"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {log && (
                <button
                  type="button"
                  onClick={() => setShowLogModal(true)}
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  View log
                </button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={recompile}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <RotateCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Detailed Log Modal */}
        {showLogModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowLogModal(false)}
          >
            <div
              className="w-full max-w-xl rounded-lg border bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h3 className="font-semibold text-sm">
                    {isTimeout ? "Compiler Timeout Log" : "LaTeX Compilation Log"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isTimeout ? "The server took too long to compile." : "Inspect errors in your LaTeX source."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <pre className="mt-4 max-h-80 w-full overflow-auto rounded-md bg-muted p-3.5 font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
                {log || "No log details available."}
              </pre>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowLogModal(false)}>
                  Close
                </Button>
                <Button size="sm" onClick={() => { setShowLogModal(false); recompile(); }} className="gap-1.5">
                  <RotateCw className="h-3.5 w-3.5" />
                  Retry Compilation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // CASE 2: No PDF available yet
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
      {failed ? (
        <div className="w-full max-w-lg rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
          <AlertCircle className="mx-auto h-7 w-7" />
          <h4 className="mt-2 text-sm font-semibold">
            {isTimeout ? "Compilation Timed Out" : "Compilation Failed"}
          </h4>
          <p className="mt-1 text-xs opacity-80">
            {isTimeout
              ? "The compiler took longer than expected to generate your preview."
              : "Tectonic encountered syntax errors in the LaTeX source."}
          </p>
          {log && (
            <pre className="mt-3 max-h-72 w-full overflow-auto rounded-md bg-muted p-3.5 text-left font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
              {log}
            </pre>
          )}
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={recompile}
              className="gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Retry Compilation
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs font-medium">Typesetting PDF with Tectonic…</p>
        </div>
      )}
    </div>
  );
}
