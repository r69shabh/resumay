"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import NeedKeys, { useAuthConfigured } from "@/components/NeedKeys";
import { Btn, Badge, Seg, Input, Textarea, labelCls } from "@/components/ui";
import { toast } from "@/components/Toaster";
import { neonAuthClient } from "@/lib/neon-auth-client";
import LatexPreview, { type PreviewInfo } from "@/components/LatexPreview";
import {
  defaultContent,
  parseContent,
  renderLatex,
  type ResumeContent,
} from "@/lib/resume";
import {
  ArrowLeft,
  Save,
  Share2,
  SlidersHorizontal,
  Code2,
  Eye,
  FileCheck,
  Check,
  Copy,
  ExternalLink,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  X,
  ChevronDown,
  User,
  Sparkles,
  Globe,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  Wrench,
  Star,
  FileText,
  AlertCircle,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Resume = {
  id: string;
  slug: string;
  title: string;
  roleTag: string;
  latexSource: string;
  content: unknown;
  customLatex: boolean;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Section({
  title,
  icon,
  count,
  children,
  open = false,
}: {
  title: string;
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="group rounded-2xl border border-border bg-card shadow-xs transition-all overflow-hidden"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3.5 text-sm font-semibold select-none hover:bg-secondary/40 transition-colors [&::-webkit-details-marker]:hidden">
        {icon && (
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
        <span className="flex-1 text-foreground">{title}</span>
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="px-2 py-0 text-[11px]">
            {count}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-4 border-t border-border/50 p-4 pt-3">{children}</div>
    </details>
  );
}

// Generic add/remove list for entry rows.
function Entries<T>({
  items,
  onChange,
  render,
  blank,
  addLabel,
  titleFn,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, set: (v: T) => void) => ReactNode;
  blank: T;
  addLabel: string;
  titleFn?: (item: T, index: number) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const itemTitle = titleFn ? titleFn(item, i) : `Entry #${i + 1}`;
        return (
          <div
            key={i}
            className="flex flex-col gap-3.5 rounded-xl border border-border/80 bg-secondary/25 p-3.5 transition-all hover:border-border"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-semibold text-muted-foreground truncate max-w-[240px]">
                {itemTitle}
              </span>
              <Btn
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                title="Remove entry"
              >
                <Trash2 className="h-3 w-3" />
              </Btn>
            </div>
            {render(item, (v) => onChange(items.map((it, j) => (j === i ? v : it))))}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...items, blank])}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-primary dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>{addLabel}</span>
      </button>
    </div>
  );
}

// What an ATS/parser extracts from the saved PDF.
type AtsResult = { text?: string; error?: string; log?: string; status: number };

async function loadText(id: string): Promise<AtsResult> {
  try {
    const r = await fetch(`/api/resumes/${id}/text`);
    const d = (await r.json().catch(() => ({}))) as {
      text?: string;
      error?: string;
      log?: string;
    };
    return { ...d, status: r.status };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e), status: 0 };
  }
}

function AtsBody({
  promise,
  onRefresh,
  stale,
}: {
  promise: Promise<AtsResult>;
  onRefresh: () => void;
  stale: boolean;
}) {
  const result = use(promise);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!result.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      toast("ATS text copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed");
    }
  };

  const words = result.text ? result.text.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = result.text ? result.text.length : 0;

  return (
    <div className="flex h-full flex-col gap-3 bg-secondary/30 p-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="emerald">ATS Parsed</Badge>
          <span className="text-muted-foreground">
            {words} words • {chars} characters
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {stale && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              ● Unsaved edits
            </span>
          )}
          <Btn variant="outline" size="xs" onClick={() => void copy()} disabled={!result.text}>
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy text"}</span>
          </Btn>
          <Btn variant="outline" size="xs" onClick={onRefresh}>
            Refresh
          </Btn>
        </div>
      </div>

      {result.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <p className="font-semibold">Text extraction failed</p>
          <p className="mt-1">{result.error}</p>
        </div>
      )}

      {result.text && (
        <pre className="flex-1 overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed text-foreground shadow-2xs whitespace-pre-wrap">
          {result.text}
        </pre>
      )}
    </div>
  );
}

function AtsPanel({ id, stale }: { id: string; stale: boolean }) {
  const [promise, setPromise] = useState<Promise<AtsResult>>(() => loadText(id));
  const refresh = () => setPromise(loadText(id));

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          Extracting text from PDF…
        </div>
      }
    >
      <AtsBody promise={promise} onRefresh={refresh} stale={stale} />
    </Suspense>
  );
}

function ShareDialog({
  slug,
  shareHref,
  pdfUrl,
  onDownloadTex,
  onClose,
}: {
  slug: string;
  shareHref: string;
  pdfUrl: string | null;
  onDownloadTex: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareHref);
      setCopied(true);
      toast("Public link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed in this browser");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-primary dark:bg-indigo-950/50">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Share resume</h2>
              <p className="text-[11px] text-muted-foreground">Publicly accessible via direct link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            readOnly
            value={shareHref}
            onFocus={(e) => e.target.select()}
            className="font-mono text-xs"
          />
          <Btn variant="primary" size="default" onClick={() => void copy()} className="shrink-0">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Btn>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
          <Link href={`/r/${slug}`} target="_blank">
            <Btn variant="outline" size="sm" className="w-full justify-center">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open web page</span>
            </Btn>
          </Link>

          {pdfUrl && (
            <a href={pdfUrl} download={`${slug}.pdf`}>
              <Btn variant="outline" size="sm" className="w-full justify-center">
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </Btn>
            </a>
          )}

          <Btn variant="outline" size="sm" onClick={onDownloadTex} className="w-full justify-center">
            <Code2 className="h-3.5 w-3.5" />
            <span>Download .tex</span>
          </Btn>

          <Link href={`/r/${slug}/text`} target="_blank">
            <Btn variant="ghost" size="sm" className="w-full justify-center">
              <FileText className="h-3.5 w-3.5" />
              <span>Raw text</span>
            </Btn>
          </Link>
        </div>
      </div>
    </div>
  );
}

function EditInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = neonAuthClient.useSession();
  const user = session?.user;
  const [resume, setResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent>(defaultContent());
  const [raw, setRaw] = useState("");
  const [tab, setTab] = useState<"form" | "latex">("form");
  const [rightPane, setRightPane] = useState<"pdf" | "ats">("pdf");
  const [atsKey, setAtsKey] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<PreviewInfo | null>(null);
  const onInfo = useCallback((i: PreviewInfo) => setInfo(i), []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/resumes/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((r: Resume | null) => {
        if (!r) return setSaveMsg("Resume not found.");
        setResume(r);
        setRaw(r.latexSource);
        if (r.content != null) setContent(parseContent(r.content));
        if (r.content == null || r.customLatex) setTab("latex");
      });
  }, [id, user]);

  const touch = (c: ResumeContent) => {
    setContent(c);
    setDirty(true);
  };

  const previewSource = useMemo(
    () => (tab === "form" && resume && !resume.customLatex ? renderLatex(content) : raw),
    [tab, content, raw, resume],
  );

  const save = useCallback(async () => {
    if (!resume) return;
    setSaving(true);
    setSaveMsg("Saving…");
    const body =
      tab === "form"
        ? { title: resume.title, roleTag: resume.roleTag, content }
        : { title: resume.title, roleTag: resume.roleTag, latexSource: raw };
    const res = await fetch(`/api/resumes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      const r: Resume = await res.json();
      setResume(r);
      setRaw(r.latexSource);
      setDirty(false);
      setAtsKey((k) => k + 1);
      setSaveMsg(`Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      toast("Resume saved");
    } else {
      setSaveMsg("Save failed");
      toast("Save failed");
    }
  }, [id, resume, content, raw, tab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const resetGenerated = async () => {
    if (!confirm("Discard raw LaTeX edits and re-render from form?")) return;
    const res = await fetch(`/api/resumes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ useGenerated: true }),
    });
    if (res.ok) {
      const r: Resume = await res.json();
      setResume(r);
      setRaw(r.latexSource);
      setDirty(false);
      setSaveMsg("Re-rendered from form");
      toast("Re-rendered from form");
    }
  };

  const downloadTex = () => {
    const url = URL.createObjectURL(new Blob([previewSource], { type: "application/x-tex" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume?.slug ?? "resume"}.tex`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  if (!user)
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary dark:bg-indigo-950/50">
          <User className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-foreground">Sign in to edit this resume</h2>
        <p className="mt-1 text-xs text-muted-foreground">Your drafts stay private to your Google account.</p>
        <Btn
          variant="primary"
          size="default"
          onClick={() =>
            void neonAuthClient.signIn.social({
              provider: "google",
              callbackURL: `/edit/${id}`,
            })
          }
          className="mt-5"
        >
          Sign in with Google
        </Btn>
      </main>
    );

  if (!resume)
    return (
      <main className="flex h-screen items-center justify-center text-xs text-muted-foreground">
        {saveMsg || "Loading resume editor…"}
      </main>
    );

  const sharePath = `/r/${resume.slug}`;

  return (
    <main className="flex h-screen flex-col bg-background">
      {/* Top Header Bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <input
            value={resume.title}
            onChange={(e) => {
              setResume({ ...resume, title: e.target.value });
              setDirty(true);
            }}
            placeholder="Untitled resume"
            className="min-w-0 flex-1 max-w-xs rounded-lg px-2 py-1 text-sm font-bold text-foreground hover:bg-secondary/50 focus:bg-card focus:ring-1 focus:ring-primary outline-none transition-all"
          />

          <input
            value={resume.roleTag}
            onChange={(e) => {
              setResume({ ...resume, roleTag: e.target.value });
              setDirty(true);
            }}
            placeholder="Role Tag"
            className="hidden w-24 rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-center text-xs font-medium text-foreground outline-none focus:border-primary sm:block"
          />
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mode Switcher */}
          <Seg
            options={[
              { value: "form", label: "Form", icon: <SlidersHorizontal className="h-3 w-3" /> },
              { value: "latex", label: "LaTeX", icon: <Code2 className="h-3 w-3" /> },
            ]}
            value={tab}
            onChange={setTab}
          />

          {/* Save status pill */}
          <div className="hidden items-center gap-1.5 px-2 text-xs md:flex">
            {dirty ? (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {saveMsg || "Saved"}
              </span>
            )}
          </div>

          <Btn
            variant={dirty ? "primary" : "secondary"}
            size="sm"
            disabled={saving}
            onClick={() => void save()}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Saving…" : "Save"}</span>
          </Btn>

          <Btn variant="outline" size="sm" onClick={() => setShareOpen(true)} className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </Btn>
        </div>
      </header>

      {shareOpen && (
        <ShareDialog
          slug={resume.slug}
          shareHref={`${typeof window !== "undefined" ? window.location.origin : ""}${sharePath}`}
          pdfUrl={info?.pdfUrl ?? null}
          onDownloadTex={downloadTex}
          onClose={() => setShareOpen(false)}
        />
      )}

      {/* Main Two-Pane Layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto md:grid-cols-2 md:overflow-hidden">
        {/* Left Pane: Form Editor or Monaco LaTeX */}
        <div className="flex min-h-0 flex-col gap-3.5 overflow-y-auto p-4 sm:p-5 md:border-r border-border bg-background">
          {tab === "form" ? (
            <>
              {resume.customLatex && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="flex-1">
                    This resume has custom LaTeX code. Editing the form will re-generate and overwrite raw edits.
                  </span>
                </div>
              )}

              <Section title="Personal details" icon={<User className="h-3.5 w-3.5" />} open>
                <Field
                  label="Full name"
                  value={content.name}
                  onChange={(v) => touch({ ...content, name: v })}
                  placeholder="Jane Doe"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field
                    label="Phone"
                    value={content.phone}
                    onChange={(v) => touch({ ...content, phone: v })}
                    placeholder="+1 (555) 000-0000"
                  />
                  <Field
                    label="Email"
                    value={content.email}
                    onChange={(v) => touch({ ...content, email: v })}
                    placeholder="jane@example.com"
                  />
                </div>
                <Field
                  label="Location"
                  value={content.location}
                  onChange={(v) => touch({ ...content, location: v })}
                  placeholder="San Francisco, CA"
                />
              </Section>

              <Section title="Professional summary" icon={<Sparkles className="h-3.5 w-3.5" />}>
                <Area
                  label="Summary (2–4 punchy lines)"
                  rows={4}
                  value={content.summary}
                  onChange={(v) => touch({ ...content, summary: v })}
                  placeholder="Results-driven Software Engineer with 4+ years building high-throughput services..."
                />
              </Section>

              <Section title="Social links" icon={<Globe className="h-3.5 w-3.5" />} count={content.links.length}>
                <Entries
                  items={content.links}
                  onChange={(links) => touch({ ...content, links })}
                  blank={{ label: "", url: "" }}
                  addLabel="Add social link"
                  titleFn={(l) => l.label || l.url || "New Link"}
                  render={(l, set) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field
                        label="Platform / Label"
                        value={l.label}
                        onChange={(v) => set({ ...l, label: v })}
                        placeholder="GitHub / LinkedIn"
                      />
                      <Field
                        label="Profile URL"
                        value={l.url}
                        onChange={(v) => set({ ...l, url: v })}
                        placeholder="https://…"
                      />
                    </div>
                  )}
                />
              </Section>

              <Section title="Education" icon={<GraduationCap className="h-3.5 w-3.5" />} count={content.education.length} open>
                <Entries
                  items={content.education}
                  onChange={(education) => touch({ ...content, education })}
                  blank={{ school: "", degree: "", location: "", start: "", end: "", grade: "" }}
                  addLabel="Add education"
                  titleFn={(e) => (e.school ? `${e.school}${e.degree ? ` • ${e.degree}` : ""}` : "New School")}
                  render={(e, set) => (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="School / University" value={e.school} onChange={(v) => set({ ...e, school: v })} placeholder="Stanford University" />
                        <Field label="Location" value={e.location} onChange={(v) => set({ ...e, location: v })} placeholder="Stanford, CA" />
                      </div>
                      <Field label="Degree / Major" value={e.degree} onChange={(v) => set({ ...e, degree: v })} placeholder="B.S. in Computer Science" />
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Start" value={e.start} onChange={(v) => set({ ...e, start: v })} placeholder="2021" />
                        <Field label="End" value={e.end} onChange={(v) => set({ ...e, end: v })} placeholder="2025" />
                        <Field label="GPA / Grade" value={e.grade} onChange={(v) => set({ ...e, grade: v })} placeholder="3.9/4.0" />
                      </div>
                    </>
                  )}
                />
              </Section>

              <Section title="Work Experience" icon={<Briefcase className="h-3.5 w-3.5" />} count={content.experience.length} open>
                <Entries
                  items={content.experience}
                  onChange={(experience) => touch({ ...content, experience })}
                  blank={{ title: "", company: "", location: "", start: "", end: "", bullets: "" }}
                  addLabel="Add work experience"
                  titleFn={(exp) => (exp.company ? `${exp.title || "Role"} @ ${exp.company}` : "New Experience")}
                  render={(e, set) => (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Job Title" value={e.title} onChange={(v) => set({ ...e, title: v })} placeholder="Senior Software Engineer" />
                        <Field label="Company" value={e.company} onChange={(v) => set({ ...e, company: v })} placeholder="Stripe" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Location" value={e.location} onChange={(v) => set({ ...e, location: v })} placeholder="San Francisco, CA" />
                        <Field label="Start Date" value={e.start} onChange={(v) => set({ ...e, start: v })} placeholder="Jan 2023" />
                        <Field label="End Date" value={e.end} onChange={(v) => set({ ...e, end: v })} placeholder="Present" />
                      </div>
                      <Area
                        label="Key Achievements (one bullet per line)"
                        rows={3}
                        value={e.bullets}
                        onChange={(v) => set({ ...e, bullets: v })}
                        placeholder="Architected payment retry engine reducing failure rate by 14%&#10;Mentored 4 engineers and improved team test coverage to 92%"
                      />
                    </>
                  )}
                />
              </Section>

              <Section title="Projects" icon={<FolderGit2 className="h-3.5 w-3.5" />} count={content.projects.length}>
                <Entries
                  items={content.projects}
                  onChange={(projects) => touch({ ...content, projects })}
                  blank={{ name: "", tech: "", date: "", url: "", bullets: "" }}
                  addLabel="Add project"
                  titleFn={(p) => p.name || "New Project"}
                  render={(p, set) => (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Project Name" value={p.name} onChange={(v) => set({ ...p, name: v })} placeholder="Distributed Key-Value Store" />
                        <Field label="Technologies Used" value={p.tech} onChange={(v) => set({ ...p, tech: v })} placeholder="Go, Raft, gRPC" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Date / Timeline" value={p.date} onChange={(v) => set({ ...p, date: v })} placeholder="Fall 2024" />
                        <Field label="Repository / Demo URL" value={p.url} onChange={(v) => set({ ...p, url: v })} placeholder="https://github.com/…" />
                      </div>
                      <Area
                        label="Impact Bullets (one per line)"
                        rows={2}
                        value={p.bullets}
                        onChange={(v) => set({ ...p, bullets: v })}
                        placeholder="Achieved linearizable reads with leader leasing&#10;Handled 50k requests/sec benchmarked with k6"
                      />
                    </>
                  )}
                />
              </Section>

              <Section title="Technical Skills" icon={<Wrench className="h-3.5 w-3.5" />} count={content.skills.length}>
                <Entries
                  items={content.skills}
                  onChange={(skills) => touch({ ...content, skills })}
                  blank={{ label: "", items: "" }}
                  addLabel="Add skill category"
                  titleFn={(s) => s.label || "Skill Category"}
                  render={(s, set) => (
                    <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-3">
                      <Field label="Category" value={s.label} onChange={(v) => set({ ...s, label: v })} placeholder="Languages" />
                      <Field label="Skills (comma separated)" value={s.items} onChange={(v) => set({ ...s, items: v })} placeholder="TypeScript, Python, Go, Rust" />
                    </div>
                  )}
                />
              </Section>

              <Section title="Certificates" icon={<Award className="h-3.5 w-3.5" />} count={content.certificates.length}>
                <Entries
                  items={content.certificates}
                  onChange={(certificates) => touch({ ...content, certificates })}
                  blank={{ name: "", issuer: "", date: "" }}
                  addLabel="Add certificate"
                  titleFn={(c) => c.name || "Certificate"}
                  render={(c, set) => (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Certificate" value={c.name} onChange={(v) => set({ ...c, name: v })} placeholder="AWS Solutions Architect" />
                      <Field label="Issuer" value={c.issuer} onChange={(v) => set({ ...c, issuer: v })} placeholder="Amazon Web Services" />
                      <Field label="Date" value={c.date} onChange={(v) => set({ ...c, date: v })} placeholder="2024" />
                    </div>
                  )}
                />
              </Section>

              <Section title="Extra curricular" icon={<Star className="h-3.5 w-3.5" />} count={content.extra.length}>
                <Entries
                  items={content.extra}
                  onChange={(extra) => touch({ ...content, extra })}
                  blank={{ title: "", detail: "" }}
                  addLabel="Add extra-curricular entry"
                  titleFn={(x) => x.title || "Extra Activity"}
                  render={(x, set) => (
                    <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-3">
                      <Field label="Title / Role" value={x.title} onChange={(v) => set({ ...x, title: v })} placeholder="Hackathon Lead" />
                      <Field label="Description" value={x.detail} onChange={(v) => set({ ...x, detail: v })} placeholder="Organized 24h event with 400+ attendees" />
                    </div>
                  )}
                />
              </Section>
            </>
          ) : (
            <div className="flex min-h-[30rem] flex-1 flex-col gap-2.5 md:min-h-0">
              {resume.customLatex && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <span>Custom LaTeX mode active. Edits in this editor drive the output.</span>
                  <Btn variant="outline" size="xs" onClick={() => void resetGenerated()} className="gap-1 bg-white dark:bg-zinc-900">
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset to form</span>
                  </Btn>
                </div>
              )}
              {!resume.customLatex && (
                <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                  <span>LaTeX compiled from form. Edits here will fork this resume into custom mode.</span>
                </div>
              )}
              <div className="min-h-64 flex-1 overflow-hidden rounded-2xl border border-border shadow-xs md:min-h-0">
                <MonacoEditor
                  language="latex"
                  theme="vs-dark"
                  value={raw}
                  onChange={(v) => {
                    setRaw(v ?? "");
                    setDirty(true);
                  }}
                  options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: "on", scrollBeyondLastLine: false }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Live PDF Preview / ATS text */}
        <div className="relative flex min-h-[36rem] flex-col bg-zinc-100/75 dark:bg-zinc-950 md:min-h-0">
          <div className="absolute right-4 top-4 z-10">
            <Seg
              options={[
                { value: "pdf", label: "Live PDF", icon: <Eye className="h-3 w-3" /> },
                { value: "ats", label: "ATS Scanner", icon: <FileCheck className="h-3 w-3" /> },
              ]}
              value={rightPane}
              onChange={setRightPane}
            />
          </div>

          <div className="h-full min-h-0 flex-1">
            {rightPane === "pdf" ? (
              <LatexPreview source={previewSource} onInfo={onInfo} />
            ) : (
              <AtsPanel key={atsKey} id={id} stale={dirty} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const authConfigured = useAuthConfigured();
  if (authConfigured === false) return <NeedKeys />;
  return <EditInner params={params} />;
}
