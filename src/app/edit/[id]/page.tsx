"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileMenu from "@/components/ProfileMenu";
import {
  Suspense,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import NeedKeys, { useAuthConfigured } from "@/components/NeedKeys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/Toaster";
import { neonAuthClient } from "@/lib/neon-auth-client";
import LatexPreview, { type PreviewInfo } from "@/components/LatexPreview";
import {
  defaultContent,
  parseContent,
  renderLatex,
  getResolvedTemplateConfig,
  type ResumeContent,
  type ResumeSectionId,
} from "@/lib/resume";
import { RESUME_TEMPLATES } from "@/lib/templates-data";
import { downloadFileName } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Share2,
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
  Globe,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  Wrench,
  Star,
  FileText,
  AlertCircle,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Layout,
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

// ─── Small form helpers ────────────────────────────────────────────────────────

const labelCls = "mb-1 block text-xs font-medium text-muted-foreground";

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

// ─── Multi-tag input: comma or Enter commits a new tag chip ────────────────────

function TagInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const tags = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const [draft, setDraft] = useState("");

  const commit = (text: string) => {
    const parts = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (parts.length) onChange([...tags, ...parts].join(", "));
  };

  return (
    <div className="hidden max-w-[240px] items-center gap-1 overflow-hidden rounded-full border border-dashed px-3 h-9 text-xs text-muted-foreground hover:border-border transition-colors sm:flex">
      <Tag className="h-3 w-3 shrink-0" />
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="inline-flex max-w-[72px] shrink-0 items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-foreground"
        >
          <span className="truncate">{t}</span>
          <button
            type="button"
            onClick={() =>
              onChange(tags.filter((x) => x !== t).join(", "))
            }
            className="text-muted-foreground hover:text-foreground"
            title={`Remove ${t}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (v.includes(",")) {
            commit(v);
            setDraft("");
          } else {
            setDraft(v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            commit(draft);
            setDraft("");
          } else if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1).join(", "));
          }
        }}
        onBlur={() => {
          if (draft.trim()) {
            commit(draft);
            setDraft("");
          }
        }}
        placeholder={tags.length ? "" : "Add tag"}
        className="w-16 min-w-0 flex-1 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

// ─── Accordion Section ─────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  count,
  children,
  open: defaultOpen = false,
  onSave,
  saving,
}: {
  title: string;
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
  open?: boolean;
  onSave?: () => void;
  saving?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card shadow-xs shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-6 text-base font-medium select-none hover:bg-accent transition-colors text-left rounded-lg"
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="flex-1">{title}</span>
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        )}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-border/40 px-5 py-5">
          {children}
          {onSave && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={onSave}
              className="h-8 gap-1.5 self-end text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : `Save ${title}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Generic entry list ────────────────────────────────────────────────────────

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
    <div className="space-y-4">
      {items.map((item, i) => {
        const itemTitle = titleFn ? titleFn(item, i) : `Entry #${i + 1}`;
        return (
          <div key={i} className={`space-y-3 ${i > 0 ? "border-t pt-4" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {itemTitle}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {render(item, (v) => onChange(items.map((it, j) => (j === i ? v : it))))}
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, blank])}
        className="w-full h-8 text-xs gap-1.5 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

// ─── ATS Panel ─────────────────────────────────────────────────────────────────

type AtsResult = { text?: string; error?: string; status: number };

async function loadText(id: string): Promise<AtsResult> {
  try {
    const r = await fetch(`/api/resumes/${id}/text`);
    const d = (await r.json().catch(() => ({}))) as { text?: string; error?: string };
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
      toast("ATS text copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed");
    }
  };

  const words = result.text ? result.text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">ATS Parsed</Badge>
          <span>{words} words</span>
          {stale && <span className="text-yellow-600 dark:text-yellow-400">• Unsaved edits</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => void copy()} disabled={!result.text}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {result.error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <p className="font-medium">Extraction failed</p>
          <p className="mt-1">{result.error}</p>
        </div>
      )}

      {result.text && (
        <pre className="flex-1 overflow-auto rounded-md border bg-card p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {result.text}
        </pre>
      )}
    </div>
  );
}

function AtsPanel({ id, stale }: { id: string; stale: boolean }) {
  const [promise, setPromise] = useState<Promise<AtsResult>>(() => loadText(id));
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          Extracting text…
        </div>
      }
    >
      <AtsBody promise={promise} onRefresh={() => setPromise(loadText(id))} stale={stale} />
    </Suspense>
  );
}

// ─── Share Dialog ──────────────────────────────────────────────────────────────

function ShareDialog({
  slug,
  title,
  shareHref,
  pdfUrl,
  onDownloadTex,
  onClose,
}: {
  slug: string;
  title: string;
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
      toast("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Share resume</h2>
            <p className="text-xs text-muted-foreground">Publicly accessible via link</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex gap-2">
          <Input readOnly value={shareHref} onFocus={(e) => e.target.select()} className="font-mono text-xs" />
          <Button variant="outline" onClick={() => void copy()} className="shrink-0">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
          <Link href={`/r/${slug}`} target="_blank" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border bg-card px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
            Open page
          </Link>
          {pdfUrl && (
            <a href={pdfUrl} download={downloadFileName(title, slug, "pdf")} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border bg-card px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </a>
          )}
          <Button variant="outline" size="sm" onClick={onDownloadTex}>
            <Code2 className="h-3.5 w-3.5" />
            Download .tex
          </Button>
          <Link href={`/r/${slug}/text`} target="_blank" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <FileText className="h-3.5 w-3.5" />
            Raw text
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Editor ───────────────────────────────────────────────────────────────

function EditInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending: sessionPending } = neonAuthClient.useSession();
  const user = session?.user;
  const [signingIn, setSigningIn] = useState(false);
  const signOut = async () => {
    await neonAuthClient.signOut();
    router.refresh();
  };
  const [resume, setResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent>(defaultContent());
  const [raw, setRaw] = useState("");
  const [tab, setTab] = useState<"form" | "latex">("form");
  const [rightPane, setRightPane] = useState<"pdf" | "ats">("pdf");
  // Mobile shows one pane at a time (form first); desktop shows the split.
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [atsKey, setAtsKey] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<PreviewInfo | null>(null);
  const revision = useRef(0);
  const saveInFlight = useRef(false);
  const onInfo = useCallback((i: PreviewInfo) => setInfo(i), []);

  const resolvedConfig = useMemo(() => getResolvedTemplateConfig(content), [content]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    fetch(`/api/resumes/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((r: Resume | null) => {
        if (!active) return;
        if (!r) return setSaveMsg("Resume not found.");
        setResume({ ...r, customLatex: r.customLatex || r.content == null });
        setRaw(r.latexSource);
        if (r.content != null) setContent(parseContent(r.content));
        if (r.content == null || r.customLatex) setTab("latex");
      })
      .catch(() => {
        if (active) setSaveMsg("Unable to load resume. Please reload.");
      });
    return () => { active = false; };
  }, [id, user?.id]);

  const markDirty = () => {
    revision.current += 1;
    setDirty(true);
    setSaveMsg("");
  };

  const touch = (c: ResumeContent) => {
    setContent(c);
    setResume((r) => r && { ...r, customLatex: false });
    markDirty();
  };

  const previewSource = useMemo(
    () => (resume?.customLatex ? raw : renderLatex(content)),
    [content, raw, resume?.customLatex],
  );

  const save = useCallback(async (automatic = false) => {
    if (!resume || saveInFlight.current) return;
    const savedRevision = revision.current;
    const payload = resume.customLatex
      ? { title: resume.title, roleTag: resume.roleTag, latexSource: raw }
      : { title: resume.title, roleTag: resume.roleTag, content };
    saveInFlight.current = true;
    setSaving(true);
    setSaveMsg("Saving…");
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      const r: Resume = await res.json();
      if (revision.current === savedRevision) {
        setResume(r);
        setDirty(false);
        setSaveMsg(`Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
        if (!automatic) toast("Saved");
      } else {
        setSaveMsg("");
      }
      setAtsKey((k) => k + 1);
    } catch {
      setSaveMsg("Save failed — retry with Save");
      if (!automatic) toast("Save failed");
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }, [id, resume, content, raw]);

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

  useEffect(() => {
    if (!dirty || saving || saveMsg.startsWith("Save failed")) return;
    const t = setTimeout(() => void save(true), 2000);
    return () => clearTimeout(t);
  }, [dirty, saving, saveMsg, save]);

  useEffect(() => {
    if (!dirty) return;
    const onUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  const resetGenerated = () => {
    if (!confirm("Discard raw LaTeX edits and re-render from form?")) return;
    touch(content);
  };

  const downloadTex = () => {
    const url = URL.createObjectURL(new Blob([previewSource], { type: "application/x-tex" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFileName(resume?.title ?? "", resume?.slug ?? "resume", "tex");
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  if (sessionPending)
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      </main>
    );

  if (!user)
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <User className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-base font-semibold">Sign in to edit</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your drafts stay private.</p>
          <Button
            className="mt-4"
            disabled={signingIn}
            onClick={() => {
              if (signingIn) return;
              setSigningIn(true);
              void neonAuthClient.signIn.social({
                provider: "google",
                callbackURL: `/edit/${id}`,
              });
            }}
          >
            {signingIn ? "Redirecting to Google…" : "Sign in with Google"}
          </Button>
        </div>
      </main>
    );

  if (!resume)
    return (
      <main className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        {saveMsg || "Loading…"}
      </main>
    );

  const sharePath = `/r/${resume.slug}`;

  return (
    <main className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background px-4 sm:gap-3 sm:px-6">
        {/* Left: Navigation & Document Meta */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href="/"
            title="Back to dashboard"
            onClick={(event) => {
              if (dirty && !confirm("Changes are not saved yet. Leave anyway?")) event.preventDefault();
            }}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <input
            value={resume.title}
            onChange={(e) => {
              setResume({ ...resume, title: e.target.value });
              markDirty();
            }}
            placeholder="Untitled resume"
            className="h-9 min-w-0 max-w-[130px] rounded-lg px-2 text-sm font-semibold outline-none hover:bg-muted/50 focus:bg-muted/50 focus:ring-1 focus:ring-ring transition-colors truncate sm:max-w-[220px]"
          />

          <TagInput
            value={resume.roleTag}
            onChange={(v) => {
              setResume({ ...resume, roleTag: v });
              markDirty();
            }}
          />
        </div>

        {/* Right: Status & Actions */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Save status */}
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                dirty ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span className="text-xs">
              {saving ? "Saving…" : saveMsg || (dirty ? "Unsaved" : "Saved")}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={dirty ? "default" : "outline"}
              disabled={saving}
              onClick={() => void save()}
              className="h-9 w-9 gap-1.5 rounded-full p-0 text-xs shadow-xs sm:w-auto sm:px-4"
              title="Save"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{saving ? "Saving…" : "Save"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShareOpen(true)}
              className="h-9 w-9 gap-1.5 rounded-full p-0 text-xs shadow-xs sm:w-auto sm:px-4"
              title="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            {user && <ProfileMenu user={user} onSignOut={() => void signOut()} />}
          </div>
        </div>
      </header>

      {shareOpen && (
        <ShareDialog
          slug={resume.slug}
          title={resume.title}
          shareHref={`${typeof window !== "undefined" ? window.location.origin : ""}${sharePath}`}
          pdfUrl={info?.pdfUrl ?? null}
          onDownloadTex={downloadTex}
          onClose={() => setShareOpen(false)}
        />
      )}

      {/* Two-pane layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto md:grid-cols-2 md:overflow-hidden">
        {/* Left: Form or LaTeX editor */}
        <div className={`${mobileView === "preview" ? "hidden md:flex" : "flex"} h-full min-h-0 flex-col bg-muted/30`}>
          {/* Pane toolbar: editing controls sit with the content they affect */}
          <div className="flex shrink-0 items-center justify-between gap-2 px-6 py-3">
            {tab === "form" ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTemplateMenuOpen((o) => !o)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 text-xs text-foreground transition-colors cursor-pointer hover:bg-muted/50"
                  title="Change Template Layout"
                >
                  <Layout className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground truncate max-w-[130px]">
                    {RESUME_TEMPLATES.find((t) => t.id === (content.template || "swe"))?.name || "Template"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                </button>
                {templateMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setTemplateMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border bg-popover p-1 shadow-lg z-50 animate-in fade-in zoom-in-95">
                      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Switch Template
                      </div>
                      {RESUME_TEMPLATES.map((tmpl) => {
                        const isActive = (content.template || "swe") === tmpl.id;
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => {
                              touch({
                                ...content,
                                template: tmpl.id,
                                templateConfig: {
                                  templateId: tmpl.id,
                                },
                              });
                              setTemplateMenuOpen(false);
                              toast(`Switched to ${tmpl.name}`);
                            }}
                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer text-left ${
                              isActive
                                ? "bg-accent font-medium text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">{tmpl.name}</div>
                              <div className="text-[10px] text-muted-foreground font-normal truncate">
                                {tmpl.layoutInfo.typography.split(" ")[0]} · {tmpl.layoutInfo.priority}
                              </div>
                            </div>
                            {isActive && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-foreground ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">LaTeX source</span>
            )}
            {/* Mobile: one Form / LaTeX / Preview toggle next to the template switcher */}
            <Tabs
              value={mobileView === "preview" ? "preview" : tab}
              onValueChange={(v) => {
                if (v === "preview") {
                  setMobileView("preview");
                } else {
                  setMobileView("form");
                  setTab(v as "form" | "latex");
                }
              }}
              className="md:hidden"
            >
              <TabsList className="h-9 rounded-full p-1 bg-muted">
                <TabsTrigger value="form" className="h-7 rounded-full px-3 text-xs gap-1.5">
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>Form</span>
                </TabsTrigger>
                <TabsTrigger value="latex" className="h-7 rounded-full px-3 text-xs gap-1.5">
                  <Code2 className="h-3 w-3" />
                  <span>LaTeX</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-7 rounded-full px-3 text-xs gap-1.5">
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {/* Desktop: split is always visible, so only Form / LaTeX */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as "form" | "latex")} className="hidden md:flex">
              <TabsList className="h-9 rounded-full p-1 bg-muted">
                <TabsTrigger value="form" className="h-7 rounded-full px-3 text-xs gap-1.5">
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>Form</span>
                </TabsTrigger>
                <TabsTrigger value="latex" className="h-7 rounded-full px-3 text-xs gap-1.5">
                  <Code2 className="h-3 w-3" />
                  <span>LaTeX</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {tab === "form" ? (
            <div className="space-y-5 pb-12">
              {resume.customLatex && (
                <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Custom LaTeX active. Form edits will overwrite raw edits.
                  </span>
                </div>
              )}

              <Section title="Personal details" icon={<User className="h-3.5 w-3.5" />} onSave={() => void save()} saving={saving}>
                <Field label="Full name" value={content.name} onChange={(v) => touch({ ...content, name: v })} placeholder="Jane Doe" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone" value={content.phone} onChange={(v) => touch({ ...content, phone: v })} placeholder="+1 555 000-0000" />
                  <Field label="Email" value={content.email} onChange={(v) => touch({ ...content, email: v })} placeholder="jane@example.com" />
                </div>
                <Field label="Location" value={content.location} onChange={(v) => touch({ ...content, location: v })} placeholder="San Francisco, CA" />
              </Section>

              {/* Dynamic sections ordered by active template configuration */}
              {resolvedConfig.sectionOrder.map((secId) => {
                if (secId === "summary") {
                  return (
                    <Section key="summary" title="Professional summary" icon={<Sparkles className="h-3.5 w-3.5" />} onSave={() => void save()} saving={saving}>
                      <Area label="Summary" rows={4} value={content.summary} onChange={(v) => touch({ ...content, summary: v })} placeholder="Results-driven engineer…" />
                    </Section>
                  );
                }
                if (secId === "experience") {
                  return (
                    <Section key="experience" title="Work Experience" icon={<Briefcase className="h-3.5 w-3.5" />} count={content.experience.length} onSave={() => void save()} saving={saving}>
                      <Entries
                        items={content.experience}
                        onChange={(experience) => touch({ ...content, experience })}
                        blank={{ title: "", company: "", location: "", start: "", end: "", bullets: "" }}
                        addLabel="Add experience"
                        titleFn={(exp) => (exp.company ? `${exp.title || "Role"} @ ${exp.company}` : "New Experience")}
                        render={(e, set) => (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Job Title" value={e.title} onChange={(v) => set({ ...e, title: v })} placeholder="Senior Software Engineer" />
                              <Field label="Company" value={e.company} onChange={(v) => set({ ...e, company: v })} placeholder="Stripe" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <Field label="Location" value={e.location} onChange={(v) => set({ ...e, location: v })} placeholder="SF, CA" />
                              <Field label="Start" value={e.start} onChange={(v) => set({ ...e, start: v })} placeholder="Jan 2023" />
                              <Field label="End" value={e.end} onChange={(v) => set({ ...e, end: v })} placeholder="Present" />
                            </div>
                            <Area label="Bullets (one per line)" rows={3} value={e.bullets} onChange={(v) => set({ ...e, bullets: v })} placeholder="Reduced latency by 40%…" />
                          </>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "projects") {
                  return (
                    <Section key="projects" title="Projects" icon={<FolderGit2 className="h-3.5 w-3.5" />} count={content.projects.length} onSave={() => void save()} saving={saving}>
                      <Entries
                        items={content.projects}
                        onChange={(projects) => touch({ ...content, projects })}
                        blank={{ name: "", tech: "", date: "", url: "", bullets: "" }}
                        addLabel="Add project"
                        titleFn={(p) => p.name || "New Project"}
                        render={(p, set) => (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Project Name" value={p.name} onChange={(v) => set({ ...p, name: v })} placeholder="Distributed KV Store" />
                              <Field label="Technologies" value={p.tech} onChange={(v) => set({ ...p, tech: v })} placeholder="Go, Raft, gRPC" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Date" value={p.date} onChange={(v) => set({ ...p, date: v })} placeholder="Fall 2024" />
                              <Field label="URL" value={p.url} onChange={(v) => set({ ...p, url: v })} placeholder="https://github.com/…" />
                            </div>
                            <Area label="Impact bullets (one per line)" rows={2} value={p.bullets} onChange={(v) => set({ ...p, bullets: v })} />
                          </>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "skills") {
                  return (
                    <Section key="skills" title="Skills" icon={<Wrench className="h-3.5 w-3.5" />} count={content.skills.length} onSave={() => void save()} saving={saving}>
                      <Entries
                        items={content.skills}
                        onChange={(skills) => touch({ ...content, skills })}
                        blank={{ label: "", items: "" }}
                        addLabel="Add skill category"
                        titleFn={(s) => s.label || "Skill Category"}
                        render={(s, set) => (
                          <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Field label="Category" value={s.label} onChange={(v) => set({ ...s, label: v })} placeholder="Languages" />
                            <Field label="Skills (comma-separated)" value={s.items} onChange={(v) => set({ ...s, items: v })} placeholder="TypeScript, Python, Go" />
                          </div>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "education") {
                  return (
                    <Section key="education" title="Education" icon={<GraduationCap className="h-3.5 w-3.5" />} count={content.education.length} onSave={() => void save()} saving={saving}>
                      <Entries
                        items={content.education}
                        onChange={(education) => touch({ ...content, education })}
                        blank={{ school: "", degree: "", location: "", start: "", end: "", grade: "" }}
                        addLabel="Add education"
                        titleFn={(e) => e.school || "New School"}
                        render={(e, set) => (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="School" value={e.school} onChange={(v) => set({ ...e, school: v })} placeholder="Stanford University" />
                              <Field label="Location" value={e.location} onChange={(v) => set({ ...e, location: v })} placeholder="Stanford, CA" />
                            </div>
                            <Field label="Degree" value={e.degree} onChange={(v) => set({ ...e, degree: v })} placeholder="B.S. Computer Science" />
                            <div className="grid grid-cols-3 gap-3">
                              <Field label="Start" value={e.start} onChange={(v) => set({ ...e, start: v })} placeholder="2021" />
                              <Field label="End" value={e.end} onChange={(v) => set({ ...e, end: v })} placeholder="2025" />
                              <Field label="GPA" value={e.grade} onChange={(v) => set({ ...e, grade: v })} placeholder="3.9/4.0" />
                            </div>
                          </>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "certificates") {
                  return (
                    <Section key="certificates" title="Certificates" icon={<Award className="h-3.5 w-3.5" />} count={content.certificates.length} onSave={() => void save()} saving={saving}>
                      <Entries
                        items={content.certificates}
                        onChange={(certificates) => touch({ ...content, certificates })}
                        blank={{ name: "", issuer: "", date: "" }}
                        addLabel="Add certificate"
                        titleFn={(c) => c.name || "Certificate"}
                        render={(c, set) => (
                          <div className="grid grid-cols-3 gap-3">
                            <Field label="Certificate" value={c.name} onChange={(v) => set({ ...c, name: v })} placeholder="AWS SAA" />
                            <Field label="Issuer" value={c.issuer} onChange={(v) => set({ ...c, issuer: v })} placeholder="Amazon" />
                            <Field label="Date" value={c.date} onChange={(v) => set({ ...c, date: v })} placeholder="2024" />
                          </div>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "extra") {
                  return (
                    <Section key="extra" title="Extra-curricular" icon={<Star className="h-3.5 w-3.5" />} count={content.extra.length} onSave={() => void save()} saving={saving}>
                      <Entries
                        items={content.extra}
                        onChange={(extra) => touch({ ...content, extra })}
                        blank={{ title: "", detail: "" }}
                        addLabel="Add entry"
                        titleFn={(x) => x.title || "Activity"}
                        render={(x, set) => (
                          <div className="grid grid-cols-[9rem_1fr] gap-3">
                            <Field label="Title" value={x.title} onChange={(v) => set({ ...x, title: v })} placeholder="Hackathon Lead" />
                            <Field label="Description" value={x.detail} onChange={(v) => set({ ...x, detail: v })} placeholder="400+ attendees" />
                          </div>
                        )}
                      />
                    </Section>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <div className="flex h-full flex-col gap-2">
              {resume.customLatex && (
                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-xs text-muted-foreground">
                  <span>Custom LaTeX mode — edits here drive the output.</span>
                  <Button variant="outline" size="sm" onClick={() => void resetGenerated()} className="gap-1 h-7 text-xs">
                    <RotateCcw className="h-3 w-3" />
                    Reset to form
                  </Button>
                </div>
              )}
              {!resume.customLatex && (
                <p className="text-xs text-muted-foreground">
                  LaTeX auto-generated from form. Edits here switch to custom mode.
                </p>
              )}
              <div className="min-h-64 flex-1 overflow-hidden rounded-md border md:min-h-0">
                <MonacoEditor
                  language="latex"
                  theme="vs-dark"
                  value={previewSource}
                  onChange={(v) => {
                    if (v === undefined || v === previewSource) return;
                    setRaw(v);
                    setResume({ ...resume, customLatex: true });
                    markDirty();
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Right: PDF or ATS preview */}
        <div className={`${mobileView === "form" ? "hidden md:flex" : "flex"} min-h-[36rem] flex-col bg-muted/30 md:min-h-0`}>
          <div className="flex shrink-0 items-center justify-between gap-2 px-6 py-3">
            <span className="text-xs font-medium text-muted-foreground">Preview</span>
            <Tabs value={rightPane} onValueChange={(v) => setRightPane(v as "pdf" | "ats")}>
              <TabsList className="h-9 rounded-full p-1 bg-muted">
                <TabsTrigger value="pdf" className="h-7 rounded-full px-3 text-xs gap-1.5">
                  <Eye className="h-3 w-3" />
                  PDF
                </TabsTrigger>
                <TabsTrigger value="ats" className="h-7 rounded-full px-3 text-xs gap-1.5">
                  <FileCheck className="h-3 w-3" />
                  ATS
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
  if (authConfigured === null) return null;
  return <EditInner params={params} />;
}
