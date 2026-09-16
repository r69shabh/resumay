"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PdfPages from "@/components/PdfPages";
import { Button } from "@/components/ui/button";
import { ResumayLogo } from "@/components/ResumayLogo";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sun,
  Moon,
} from "lucide-react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </Button>
  );
}

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
      toast("ATS text copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed");
    }
  };

  const words = plainText ? plainText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <main className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-accent transition-colors group">
            <ResumayLogo size={20} />
            <span className="hidden sm:inline">resumay</span>
          </Link>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-sm font-medium">{title}</h1>
            <Badge variant="secondary" className="hidden shrink-0 text-xs md:flex">
              Public
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Tabs value={view} onValueChange={(v) => setView(v as "pdf" | "text")}>
            <TabsList>
              <TabsTrigger value="pdf" className="text-xs gap-1">
                <Eye className="h-3 w-3" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs gap-1">
                <FileText className="h-3 w-3" />
                ATS Text
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${slug}.pdf`}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>
          )}

          <Button variant="outline" size="sm" onClick={downloadTex} className="gap-1" title="Download .tex">
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">.tex</span>
          </Button>

          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div className="min-h-0 flex-1">
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
          />
        )}

        {view === "text" ? (
          <div className="h-full overflow-auto bg-muted/30 p-4 sm:p-6">
            <div className="mx-auto max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">ATS Text</Badge>
                  <span>{words} words</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => void copyText()} disabled={!plainText} className="gap-1">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <a href={`/r/${slug}/text`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                      Raw text
                      <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
              </div>
              <pre className="w-full overflow-auto rounded-lg border bg-card p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {plainText ?? "Text version unavailable."}
              </pre>
            </div>
          </div>
        ) : !pdfB64 ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-sm text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-medium">Compilation Issue</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                This resume could not be compiled to PDF. The owner may need to review recent changes.
              </p>
            </div>
          </div>
        ) : !pdfUrl ? (
          <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            Loading PDF…
          </div>
        ) : (
          <div className="h-full w-full bg-muted/20">
            <PdfPages key={pdfUrl} url={pdfUrl} />
          </div>
        )}
      </div>
    </main>
  );
}
