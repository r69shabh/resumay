"use client";

import { useEffect, useRef, useState } from "react";

type PdfPage = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: {
    canvasContext: CanvasRenderingContext2D;
    viewport: unknown;
  }) => { promise: Promise<void>; cancel: () => void };
};
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<PdfPage> };

// Minimal PDF previewer: renders each page to a canvas. No browser PDF
// chrome — no toolbar, sidebar, zoom controls, or blob-filename title.
// Remount per url (parents pass key={url}) so state starts fresh each time.
export default function PdfPages({ url }: { url: string }) {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState("");
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const pdfRef = useRef<PdfDoc | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
        const pdf = await pdfjs.getDocument({ url }).promise;
        if (cancelled) return;
        pdfRef.current = pdf as unknown as PdfDoc;
        setNumPages(pdf.numPages);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || numPages === 0) return;
    let cancelled = false;
    const tasks: { cancel: () => void }[] = [];
    (async () => {
      for (let n = 1; n <= numPages; n++) {
        if (cancelled) break;
        const canvas = canvasRefs.current[n - 1];
        if (!canvas) continue;
        try {
          const page = await pdf.getPage(n);
          if (cancelled) break;
          const viewport = page.getViewport({ scale: 2 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const task = page.render({
            canvasContext: canvas.getContext("2d")!,
            viewport,
          });
          tasks.push(task);
          await task.promise;
        } catch {
          // cancelled mid-render; next url will repaint
        }
      }
    })();
    return () => {
      cancelled = true;
      tasks.forEach((t) => {
        try {
          t.cancel();
        } catch {
          /* already finished */
        }
      });
    };
  }, [numPages, url]);

  if (error) return <p className="p-8 text-sm text-red-600">Couldn&apos;t render PDF: {error}</p>;
  if (numPages === 0)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
      </div>
    );
  return (
    <div className="flex h-full flex-col items-center gap-6 overflow-auto bg-muted/30 p-6">
      {Array.from({ length: numPages }, (_, i) => (
        <div
          key={`${url}-${i}`}
          className="w-full max-w-3xl overflow-hidden rounded-lg border bg-white shadow-md transition-shadow"
        >
          <canvas
            ref={(el) => {
              canvasRefs.current[i] = el;
            }}
            className="w-full block"
          />
        </div>
      ))}
    </div>
  );
}
