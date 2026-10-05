"use client";

import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";

// Renders the real compiled sample PDF (not a mock-up) so the landing page
// shows exactly what a user gets: same engine, same document, first page only.
export default function SampleResumePreview({
  template = "swe",
  className = "",
}: {
  template?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
        const res = await fetch(`/api/sample?template=${template}`);
        if (!res.ok) throw new Error("sample unavailable");
        const bytes = new Uint8Array(await res.arrayBuffer());
        if (cancelled) return;
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;
        const page = await pdf.getPage(1);
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 1.4 * dpr });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.aspectRatio = `${base.width} / ${base.height}`;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await (page as { render: (a: unknown) => { promise: Promise<void> } }).render({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;
        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [template]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-white shadow-sm ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`block h-full w-full transition-opacity duration-500 ${
          state === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />
      {state !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/40 p-6 text-center">
          {state === "error" ? (
            <>
              <FileText className="h-5 w-5 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">
                Sample preview unavailable — it still compiles fine once you sign in.
              </p>
            </>
          ) : (
            <div className="w-full max-w-[220px] space-y-2">
              <div className="mx-auto h-2.5 w-28 animate-pulse rounded bg-foreground/15" />
              <div className="mx-auto h-1.5 w-40 animate-pulse rounded bg-foreground/10" />
              <div className="space-y-1.5 pt-2">
                <div className="h-1 w-16 animate-pulse rounded bg-foreground/15" />
                <div className="h-1 w-full animate-pulse rounded bg-foreground/8" />
                <div className="h-1 w-4/5 animate-pulse rounded bg-foreground/8" />
                <div className="h-1 w-11/12 animate-pulse rounded bg-foreground/8" />
                <div className="h-1 w-2/3 animate-pulse rounded bg-foreground/8" />
              </div>
            </div>
          )}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white">
        Real compiled PDF · sample data
      </div>
    </div>
  );
}
