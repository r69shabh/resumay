"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PdfPages from "@/components/PdfPages";
import { Btn, Badge, Seg, Card } from "@/components/ui";
import { toast } from "@/components/Toaster";
import {
  FileText,
  Eye,
  Download,
  Code2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pdfB64) return;
    const bin = atob(pdfB64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
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

  const copyText = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      toast("ATS text copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed");
    }
  };

  const words = plainText ? plainText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <main className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground font-bold tracking-tight hover:opacity-80 transition-opacity"
            title="resumay homepage"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xs">
              <FileText className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline text-sm">resumay</span>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
            <Badge variant="indigo" className="hidden md:inline-flex text-[10px]">
              Public Resume
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Seg
            options={[
              { value: "pdf", label: "PDF", icon: <Eye className="h-3 w-3" /> },
              { value: "text", label: "ATS Text", icon: <FileText className="h-3 w-3" /> },
            ]}
            value={view}
            onChange={setView}
          />

          {pdfUrl && (
            <a href={pdfUrl} download={`${slug}.pdf`}>
              <Btn variant="primary" size="sm" className="gap-1.5 shadow-xs">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
              </Btn>
            </a>
          )}

          <Btn variant="outline" size="sm" onClick={downloadTex} className="gap-1.5" title="Download .tex source">
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">.tex</span>
          </Btn>
        </div>
      </header>

      {/* Main View Area */}
      <div className="min-h-0 flex-1">
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        {view === "text" ? (
          <div className="h-full overflow-auto bg-secondary/30 p-4 sm:p-6">
            <div className="mx-auto max-w-3xl space-y-3">
              {/* ATS info card */}
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald">Clean ATS Extracted Text</Badge>
                    <span className="text-xs text-muted-foreground">• {words} words</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Directly machine-parsed from the compiled PDF stream. Safe for ATS upload filters.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Btn variant="outline" size="sm" onClick={() => void copyText()} disabled={!plainText}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy text"}</span>
                  </Btn>
                  <a
                    href={`/r/${slug}/text`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground shadow-2xs transition-colors"
                  >
                    <span>Raw text</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Text area card */}
              <pre className="min-h-0 w-full overflow-auto rounded-2xl border border-border bg-card p-6 font-mono text-xs leading-relaxed text-foreground shadow-xs whitespace-pre-wrap">
                {plainText ?? "Text version unavailable."}
              </pre>
            </div>
          </div>
        ) : !pdfB64 ? (
          <div className="flex h-full items-center justify-center p-8">
            <Card className="max-w-md border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
              <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">
                Compilation Issue
              </h3>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 leading-relaxed">
                This resume could not be compiled to PDF. The owner may need to review recent changes in the editor.
              </p>
            </Card>
          </div>
        ) : !pdfUrl ? (
          <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading PDF viewer…</span>
          </div>
        ) : (
          <div className="h-full w-full bg-zinc-100/75 dark:bg-zinc-950">
            <PdfPages key={pdfUrl} url={pdfUrl} />
          </div>
        )}
      </div>
    </main>
  );
}
