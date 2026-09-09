"use client";

import { useEffect, useRef, useState } from "react";
import PdfPages from "./PdfPages";

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
          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
            Recompiling…
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-100 p-6 text-center dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
        {!pdfUrl && !failed ? "Compiling…" : "Compilation failed"}
      </p>
      {failed && log && (
        <pre className="max-h-96 w-full overflow-auto rounded bg-black p-3 text-left font-mono text-xs text-red-200">
          {log}
        </pre>
      )}
      {!failed && (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
      )}
    </div>
  );
}
