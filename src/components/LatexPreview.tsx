"use client";

import { useEffect, useRef, useState } from "react";
import PdfPages from "./PdfPages";
import { AlertCircle, Loader2 } from "lucide-react";

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
  const busyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    onInfo?.({ pdfUrl, log, failed, busy });
  }, [pdfUrl, log, failed, busy, onInfo]);

  useEffect(() => {
    let cancelled = false;
    const run = async (src: string) => {
      busyRef.current = true;
      setBusy(true);
      try {
        const res = await fetch("/api/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: src }),
        });
        if (cancelled) return;
        if (res.ok) {
          const url = URL.createObjectURL(await res.blob());
          setPdfUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          setFailed(false);
          setLog("");
        } else {
          const data = (await res.json().catch(() => ({}))) as { log?: string };
          setLog(data.log ?? `compile failed (HTTP ${res.status})`);
          setFailed(true);
        }
      } catch (e) {
        if (!cancelled) {
          setLog(e instanceof Error ? e.message : String(e));
          setFailed(true);
        }
      } finally {
        busyRef.current = false;
        if (!cancelled) {
          const next = pendingRef.current;
          pendingRef.current = null;
          if (next !== null) void run(next);
          else setBusy(false);
        }
      }
    };
    const t = setTimeout(() => {
      if (busyRef.current) pendingRef.current = source;
      else void run(source);
    }, 1200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [source]);

  if (pdfUrl && !failed) {
    return (
      <div className="relative h-full w-full">
        <PdfPages key={pdfUrl} url={pdfUrl} />
        {busy && (
          <div className="absolute right-4 top-16 z-20 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-medium text-foreground shadow-md backdrop-blur-md animate-in fade-in">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span>Recompiling…</span>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
      {failed ? (
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50/60 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="mx-auto h-7 w-7 text-red-500" />
          <h4 className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">
            Compilation Failed
          </h4>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            Tectonic encountered syntax errors in the LaTeX source.
          </p>
          {log && (
            <pre className="mt-3 max-h-72 w-full overflow-auto rounded-xl bg-zinc-950 p-3.5 text-left font-mono text-[11px] leading-relaxed text-red-300">
              {log}
            </pre>
          )}
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
