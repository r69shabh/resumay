"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PdfPages from "@/components/PdfPages";
import { Btn, Seg } from "@/components/ui";

// Public share view: PDF is compiled server-side (no login needed).
// The object URL is minted in an effect so SSR never emits Node's meaningless
// blob:nodedata: URLs (which hydration then refuses to patch — blank viewer).
export default function ShareViewer({
  title,
  slug,
  latexSource,
  pdfB64,
  plainText,
  jsonLd,
}: {
  title: string;
  slug: string;
  latexSource: string;
  pdfB64: string | null;
  plainText: string | null;
  jsonLd: object | null;
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [view, setView] = useState<"pdf" | "text">("pdf");

  // Object URLs are external resources: must be created client-side (SSR has
  // no usable blob URLs) with cleanup.
  useEffect(() => {
    if (!pdfB64) return;
    const bin = atob(pdfB64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    // setState-in-effect is the subscribe shape effects are for (external resource).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfB64]);

  const downloadTex = () => {
    const url = URL.createObjectURL(new Blob([latexSource], { type: "application/x-tex" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.tex`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-2 dark:border-zinc-800">
        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h1>
        <Seg
          options={[
            { value: "pdf", label: "PDF" },
            { value: "text", label: "Text" },
          ]}
          value={view}
          onChange={setView}
        />
        {pdfUrl && (
          <a href={pdfUrl} download={`${slug}.pdf`}>
            <Btn variant="primary">Download PDF</Btn>
          </a>
        )}
        <Btn variant="outline" onClick={downloadTex}>
          .tex
        </Btn>
        <Link href="/" className="hidden text-xs text-zinc-500 hover:underline sm:block">
          resumay
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        {jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        )}
        {view === "text" ? (
          <div className="h-full overflow-auto bg-zinc-50 p-4 dark:bg-zinc-950">
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex-1">Plain-text version — copy-paste or fetch-friendly for parsers.</span>
              <a
                href={`/r/${slug}/text`}
                target="_blank"
                rel="noreferrer"
                className="rounded border px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Open raw text
              </a>
            </div>
            <pre className="mx-auto min-h-0 max-w-3xl flex-1 overflow-auto whitespace-pre-wrap rounded border bg-white p-4 font-mono text-xs dark:bg-black">
              {plainText ?? "Text version unavailable."}
            </pre>
          </div>
        ) : !pdfB64 ? (
          <p className="p-8 text-sm text-red-600">
            This resume failed to compile. The owner needs to fix it in the editor.
          </p>
        ) : !pdfUrl ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
          </div>
        ) : (
          <PdfPages key={pdfUrl} url={pdfUrl} />
        )}
      </div>
    </main>
  );
}
