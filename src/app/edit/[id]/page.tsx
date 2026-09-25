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
  renderPlainText,
  getResolvedTemplateConfig,
  sectionHasContent,
  DEFAULT_TEMPLATE_CONFIGS,
  type ResumeContent,
  type ResumeLink,
  type ResumeSectionId,
} from "@/lib/resume";
import { lintResume, type LintIssue, type LintReport } from "@/lib/resume-lint";
import { RESUME_TEMPLATES } from "@/lib/templates-data";
import { downloadFileName } from "@/lib/utils";
import JdMatchModal from "@/components/JdMatchModal";
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
  FileJson,
  AlertCircle,
  SlidersHorizontal,
  Sparkles,
  Target,
  ListChecks,
  Settings2,
  GripVertical,
  Info,
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

// ─── Pane settings: the LaTeX editor is opt-in ────────────────────────────────

function PaneSettings({
  showLatex,
  open,
  setOpen,
  onToggleLatex,
}: {
  showLatex: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  onToggleLatex: (v: boolean) => void;
}) {
  return (
    <div className="relative">
      <div className="flex h-9 items-center rounded-full bg-muted p-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-background hover:text-foreground hover:shadow-sm"
          title="Editor settings"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-60 animate-in fade-in zoom-in-95 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg">
            <div className="px-2.5 py-2">
              <p className="text-xs font-semibold">Editor</p>
              <p className="text-[11px] text-muted-foreground">Fine-tune how you work here</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showLatex}
              onClick={() => onToggleLatex(!showLatex)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent"
            >
              <Code2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium">LaTeX editor</span>
                <span className="block text-[11px] text-muted-foreground">Edit the raw .tex behind the form</span>
              </span>
              <span
                className={`flex h-4 w-7 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                  showLatex ? "justify-end bg-foreground" : "justify-start bg-muted"
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-background shadow-xs" />
              </span>
            </button>
          </div>
        </>
      )}
    </div>
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

// ─── Links editor (LinkedIn / GitHub / coding profile) ────────────────────────

const LINK_PRESETS = ["LinkedIn", "GitHub", "LeetCode", "Codeforces", "Portfolio"];

function LinksEditor({
  links,
  onChange,
}: {
  links: ResumeLink[];
  onChange: (l: ResumeLink[]) => void;
}) {
  return (
    <div>
      <span className={labelCls}>Links</span>
      <div className="space-y-2">
        {links.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={l.label}
              onChange={(e) =>
                onChange(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
              }
              placeholder="LinkedIn"
              className="w-28 shrink-0"
            />
            <Input
              value={l.url}
              onChange={(e) =>
                onChange(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
              }
              placeholder="https://linkedin.com/in/you"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(links.filter((_, j) => j !== i))}
              className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {LINK_PRESETS.filter((p) => !links.some((l) => l.label.trim() === p)).map((p) => (
            <Button
              key={p}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange([...links, { label: p, url: "" }])}
              className="h-7 gap-1 rounded-full border-dashed text-xs"
            >
              <Plus className="h-3 w-3" />
              {p}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Bullets with placement-rule counter ───────────────────────────────────────

function BulletList({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const bullets = value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const unquantified = bullets.filter((b) => !/\d/.test(b)).length;
  return (
    <div>
      <Area label={label} value={value} onChange={onChange} rows={rows} placeholder={placeholder} />
      <div className="-mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-b-lg border border-t-0 bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ListChecks className="h-3 w-3" />
          <span className={bullets.length > 4 ? "font-medium text-amber-600 dark:text-amber-400" : ""}>
            {bullets.length}/4 bullets
          </span>
        </span>
        {unquantified > 0 && (
          <span className="text-amber-600/90 dark:text-amber-400/90">{unquantified} need a number</span>
        )}
        <span className="ml-auto hidden sm:inline">**bold** key phrases</span>
      </div>
    </div>
  );
}

const SECTION_LABELS: Record<ResumeSectionId, string> = {
  summary: "Professional summary",
  education: "Education",
  experience: "Work Experience",
  projects: "Projects",
  skills: "Skills",
  achievements: "Achievements",
  certificates: "Certificates",
  extra: "Extra-curricular",
};

// ─── Resume checks (campus placement checklist) ───────────────────────────────

function ResumeChecks({ report }: { report: LintReport }) {
  const tone =
    report.score >= 85
      ? { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", ring: "border-emerald-500/40" }
      : report.score >= 60
        ? { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", ring: "border-amber-500/40" }
        : { text: "text-destructive", bg: "bg-destructive", ring: "border-destructive/40" };
  const dot: Record<LintIssue["severity"], string> = {
    error: "bg-destructive",
    warn: "bg-amber-500",
    info: "bg-muted-foreground/40",
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-background ${tone.ring} ${tone.text}`}>
          <span className="text-sm font-semibold tabular-nums">{report.score}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground">
            {report.issues.length === 0
              ? "All checks passed"
              : `${report.passed} of ${report.total} checks passed`}
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${tone.bg}`} style={{ width: `${report.score}%` }} />
          </div>
        </div>
      </div>

      {report.issues.length > 0 && (
        <ul className="space-y-px overflow-hidden rounded-lg border">
          {report.issues.map((issue) => (
            <li key={issue.id} className="flex gap-2.5 bg-card px-3 py-2.5 text-xs">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot[issue.severity]}`} />
              <div className="min-w-0">
                <p className="font-medium text-foreground">{issue.title}</p>
                <p className="mt-0.5 leading-relaxed text-muted-foreground">{issue.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
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
  dragHandle,
  onDragOver,
  onDrop,
  dropActive,
}: {
  title: string;
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
  open?: boolean;
  onSave?: () => void;
  saving?: boolean;
  dragHandle?: ReactNode;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  dropActive?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`shrink-0 rounded-xl border bg-card shadow-xs transition-colors ${
        dropActive ? "border-foreground/40 ring-1 ring-foreground/15" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-6 text-base font-medium select-none hover:bg-accent transition-colors text-left rounded-lg"
      >
        {dragHandle}
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
        <div className="flex flex-col gap-3 border-t border-border/40 px-5 py-4">
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
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const itemTitle = titleFn ? titleFn(item, i) : `Entry #${i + 1}`;
        return (
          <div
            key={i}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOver !== i) setDragOver(i);
            }}
            onDragLeave={() => setDragOver((v) => (v === i ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              move(dragFrom.current ?? i, i);
              dragFrom.current = null;
              setDragOver(null);
            }}
            className={`space-y-3 rounded-lg transition-colors ${i > 0 ? "border-t pt-4" : ""} ${
              dragOver === i && dragFrom.current !== i ? "bg-accent/40 ring-1 ring-foreground/15" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground">
                <span
                  draggable
                  onDragStart={(e) => {
                    dragFrom.current = i;
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(i));
                  }}
                  onDragEnd={() => {
                    dragFrom.current = null;
                    setDragOver(null);
                  }}
                  className="cursor-grab touch-none text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">{itemTitle}</span>
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
  resumeText,
}: {
  promise: Promise<AtsResult>;
  onRefresh: () => void;
  stale: boolean;
  resumeText: string;
}) {
  const result = use(promise);
  const [copied, setCopied] = useState(false);
  const [jdOpen, setJdOpen] = useState(false);

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
          <Button variant="outline" size="sm" onClick={() => setJdOpen(true)}>
            <Target className="h-3 w-3" />
            JD match
          </Button>
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

      {jdOpen && (
        <JdMatchModal resumeText={resumeText} onClose={() => setJdOpen(false)} />
      )}
    </div>
  );
}

function AtsPanel({ id, stale, resumeText }: { id: string; stale: boolean; resumeText: string }) {
  const [promise, setPromise] = useState<Promise<AtsResult>>(() => loadText(id));
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          Extracting text…
        </div>
      }
    >
      <AtsBody promise={promise} onRefresh={() => setPromise(loadText(id))} stale={stale} resumeText={resumeText} />
    </Suspense>
  );
}

// ─── Share Dialog ──────────────────────────────────────────────────────────────

function ShareDialog({
  slug,
  title,
  content,
  shareHref,
  pdfUrl,
  onDownloadTex,
  onClose,
}: {
  slug: string;
  title: string;
  content: ResumeContent;
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob(
                  [
                    JSON.stringify(
                      {
                        app: "resumay",
                        exportedAt: new Date().toISOString(),
                        title,
                        slug,
                        content,
                      },
                      null,
                      2,
                    ),
                  ],
                  { type: "application/json" },
                ),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = downloadFileName(title, slug, "json");
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 5000);
            }}
          >
            <FileJson className="h-3.5 w-3.5" />
            Download .json
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

// ─── Template switcher (icon circle matching the tab-switcher pills) ───────────

function TemplateSwitcher({
  templateId,
  align,
  onPick,
}: {
  templateId: string;
  align: "left" | "right";
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current =
    RESUME_TEMPLATES.find((t) => t.id === templateId)?.name || "Template";
  return (
    <div className="relative">
      <div className="flex h-9 items-center rounded-full bg-muted p-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-background hover:text-foreground hover:shadow-sm"
          title={`Change template (current: ${current})`}
        >
          <Layout className="h-3.5 w-3.5" />
        </button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute top-full z-50 mt-1 w-56 animate-in fade-in zoom-in-95 rounded-lg border bg-popover p-1 shadow-lg ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Switch Template
            </div>
            {RESUME_TEMPLATES.map((tmpl) => {
              const isActive = templateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    onPick(tmpl.id);
                    setOpen(false);
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
  );
}

// ─── Mobile Form / LaTeX / Preview toggle (desktop uses the split instead) ────

type MobileView = "form" | "latex" | "preview";

function MobileViewToggle({
  value,
  onChange,
  showLatex,
}: {
  value: MobileView;
  onChange: (v: MobileView) => void;
  showLatex: boolean;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as MobileView)}
      className="md:hidden"
    >
      <TabsList className="h-9 rounded-full p-1 bg-muted">
        <TabsTrigger value="form" className="h-7 rounded-full px-3 text-xs gap-1.5">
          <SlidersHorizontal className="h-3 w-3" />
          <span>Form</span>
        </TabsTrigger>
        {showLatex && (
          <TabsTrigger value="latex" className="h-7 rounded-full px-3 text-xs gap-1.5">
            <Code2 className="h-3 w-3" />
            <span>LaTeX</span>
          </TabsTrigger>
        )}
        <TabsTrigger value="preview" className="h-7 rounded-full px-3 text-xs gap-1.5">
          <Eye className="h-3 w-3" />
          <span>Preview</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

// ─── One-page fit assistant: badge + tighten + cut hint ─────────────────────────

function FitAssistant({
  pages,
  busy,
  failed,
  density,
  content,
  onTighten,
}: {
  pages: number | null;
  busy: boolean;
  failed: boolean;
  density: "comfortable" | "compact";
  content: ResumeContent;
  onTighten: () => void;
}) {
  if (pages == null || failed) return null;
  const over = pages > 1;
  const countBullets = (s: string) =>
    s
      .split("\n")
      .map((l) => l.trim().replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean).length;
  const exp = content.experience.reduce((n, e) => n + countBullets(e.bullets), 0);
  const proj = content.projects.reduce((n, p) => n + countBullets(p.bullets), 0);
  const target = exp >= proj ? { name: "experience", n: exp } : { name: "projects", n: proj };
  return (
    <span className="hidden items-center gap-1.5 sm:flex">
      <span
        className={`text-[11px] ${
          over ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground"
        }`}
      >
        {pages === 1 ? "1 page" : `${pages} pages`}
      </span>
      {over && !busy && density === "comfortable" && (
        <button
          type="button"
          onClick={onTighten}
          className="rounded-full border px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
        >
          Tighten to fit
        </button>
      )}
      {over && !busy && density === "compact" && target.n > 0 && (
        <span
          className="max-w-[220px] truncate text-[11px] text-muted-foreground"
          title="Spacing is already tight — remove your lowest-value bullets"
        >
          Trim {target.name} ({target.n} bullets)
        </span>
      )}
    </span>
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
  const [showLatex, setShowLatex] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dragSection, setDragSection] = useState<ResumeSectionId | null>(null);
  const [dropSection, setDropSection] = useState<ResumeSectionId | null>(null);
  const [revealed, setRevealed] = useState<ResumeSectionId[]>([]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<PreviewInfo | null>(null);
  const revision = useRef(0);
  const saveInFlight = useRef(false);
  const onInfo = useCallback((i: PreviewInfo) => setInfo(i), []);

  const resolvedConfig = useMemo(() => getResolvedTemplateConfig(content), [content]);
  const lintReport = useMemo(
    () => lintResume(content, info?.pages ?? null),
    [content, info?.pages],
  );

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
        if (r.content == null || r.customLatex) {
          // A resume already stored as hand-edited LaTeX stays reachable,
          // otherwise the form would silently overwrite it.
          setShowLatex(true);
          setTab("latex");
        }
      })
      .catch(() => {
        if (active) setSaveMsg("Unable to load resume. Please reload.");
      });
    return () => { active = false; };
  }, [id, user?.id]);

  useEffect(() => {
    try {
      if (localStorage.getItem("resumay:latex") === "on") setShowLatex(true);
    } catch {}
  }, []);

  const sectionOrder = resolvedConfig.sectionOrder;
  const visibleSections = sectionOrder.filter(
    (id) => sectionHasContent(content, id) || revealed.includes(id),
  );
  const hiddenSections = sectionOrder.filter(
    (id) => !sectionHasContent(content, id) && !revealed.includes(id),
  );

  const moveSection = (from: ResumeSectionId, to: ResumeSectionId) => {
    if (from === to) return;
    const next = [...sectionOrder];
    const fi = next.indexOf(from);
    const ti = next.indexOf(to);
    if (fi < 0 || ti < 0) return;
    next.splice(fi, 1);
    next.splice(ti, 0, from);
    touch({
      ...content,
      templateConfig: { ...content.templateConfig, sectionOrder: next },
    });
  };

  const resetSectionOrder = () => {
    const def = DEFAULT_TEMPLATE_CONFIGS[resolvedConfig.templateId];
    if (!def) return;
    touch({
      ...content,
      templateConfig: { ...content.templateConfig, sectionOrder: def.sectionOrder },
    });
    setRevealed([]);
  };

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

  const pickTemplate = (id: string) => {
    touch({
      ...content,
      template: id,
      templateConfig: {
        ...content.templateConfig,
        templateId: id,
      },
    });
  };

  const mobileValue: MobileView = mobileView === "preview" ? "preview" : tab;
  const changeMobileView = (v: MobileView) => {
    if (v === "preview") {
      setMobileView("preview");
    } else {
      setMobileView("form");
      setTab(v);
    }
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

  // Phones get PDF only: pin the preview pane so a desktop ATS state never
  // leaks through a resize/rotation.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      if (!mq.matches) setRightPane("pdf");
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
              className="h-9 w-9 shrink-0 gap-1.5 rounded-full p-0 text-xs shadow-xs sm:w-auto sm:px-4"
              title="Save"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{saving ? "Saving…" : "Save"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShareOpen(true)}
              className="h-9 w-9 shrink-0 gap-1.5 rounded-full p-0 text-xs shadow-xs sm:w-auto sm:px-4"
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
          content={content}
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
              <TemplateSwitcher
                templateId={content.template || "swe"}
                align="left"
                onPick={pickTemplate}
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">LaTeX source</span>
            )}
            <div className="flex items-center gap-2">
              {/* Mobile: Form / (LaTeX) / Preview — LaTeX only when enabled */}
              <MobileViewToggle value={mobileValue} onChange={changeMobileView} showLatex={showLatex} />
              {/* Desktop: the split is always visible, so only Form / LaTeX */}
              {showLatex && (
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
              )}
              <PaneSettings
                showLatex={showLatex}
                open={settingsOpen}
                setOpen={setSettingsOpen}
                onToggleLatex={(v) => {
                  setShowLatex(v);
                  try {
                    localStorage.setItem("resumay:latex", v ? "on" : "off");
                  } catch {}
                  if (!v) {
                    setTab("form");
                    setMobileView("form");
                  }
                  setSettingsOpen(false);
                }}
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {tab === "form" ? (
            <div className="space-y-3 pb-12">
              {resume.customLatex && (
                <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Custom LaTeX active. Form edits will overwrite raw edits.
                  </span>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="shrink-0 rounded-full border border-destructive/30 px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-destructive/10"
                  >
                    Editor settings
                  </button>
                </div>
              )}

              <Section title="Personal details" icon={<User className="h-3.5 w-3.5" />} onSave={() => void save()} saving={saving}>
                <Field label="Full name" value={content.name} onChange={(v) => touch({ ...content, name: v })} placeholder="Jane Doe" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone" value={content.phone} onChange={(v) => touch({ ...content, phone: v })} placeholder="+1 555 000-0000" />
                  <Field label="Email" value={content.email} onChange={(v) => touch({ ...content, email: v })} placeholder="jane@example.com" />
                </div>
                <Field label="Location" value={content.location} onChange={(v) => touch({ ...content, location: v })} placeholder="San Francisco, CA" />
                <LinksEditor links={content.links ?? []} onChange={(links) => touch({ ...content, links })} />
              </Section>

              {/* Dynamic sections ordered by active template configuration */}
              {visibleSections.map((secId) => {
                const dragProps = {
                  dragHandle: (
                    <span
                      draggable
                      onDragStart={(e) => {
                        setDragSection(secId);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", secId);
                      }}
                      onDragEnd={() => {
                        setDragSection(null);
                        setDropSection(null);
                      }}
                      className={`cursor-grab touch-none transition-colors ${
                        dragSection === secId
                          ? "text-foreground"
                          : "text-muted-foreground/50 hover:text-foreground"
                      }`}
                      title="Drag to reorder section"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                  ),
                  dropActive: dropSection === secId && dragSection !== secId,
                  onDragOver: (e: React.DragEvent) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dropSection !== secId) setDropSection(secId);
                  },
                  onDrop: (e: React.DragEvent) => {
                    e.preventDefault();
                    if (dragSection) moveSection(dragSection, secId);
                    setDragSection(null);
                    setDropSection(null);
                  },
                };

                if (secId === "summary") {
                  return (
                    <Section key="summary" title="Professional summary" icon={<Sparkles className="h-3.5 w-3.5" />} onSave={() => void save()} saving={saving} {...dragProps}>
                      <Area label="Summary" rows={4} value={content.summary} onChange={(v) => touch({ ...content, summary: v })} placeholder="Results-driven engineer…" />
                    </Section>
                  );
                }
                if (secId === "experience") {
                  return (
                    <Section key="experience" title="Work Experience" icon={<Briefcase className="h-3.5 w-3.5" />} count={content.experience.length} onSave={() => void save()} saving={saving} {...dragProps}>
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
                            <BulletList label="Bullets (one per line)" rows={3} value={e.bullets} onChange={(v) => set({ ...e, bullets: v })} placeholder="Reduced latency by **40%**…" />
                          </>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "projects") {
                  return (
                    <Section key="projects" title="Projects" icon={<FolderGit2 className="h-3.5 w-3.5" />} count={content.projects.length} onSave={() => void save()} saving={saving} {...dragProps}>
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
                            <BulletList label="Impact bullets (one per line)" rows={2} value={p.bullets} onChange={(v) => set({ ...p, bullets: v })} placeholder="Serving **12,000+** monthly requests…" />
                          </>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "skills") {
                  return (
                    <Section key="skills" title="Skills" icon={<Wrench className="h-3.5 w-3.5" />} count={content.skills.length} onSave={() => void save()} saving={saving} {...dragProps}>
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
                    <Section key="education" title="Education" icon={<GraduationCap className="h-3.5 w-3.5" />} count={content.education.length} onSave={() => void save()} saving={saving} {...dragProps}>
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
                              <Field label="GPA / %" value={e.grade} onChange={(v) => set({ ...e, grade: v })} placeholder="9.12 CGPA or 94.2%" />
                            </div>
                          </>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "achievements") {
                  return (
                    <Section key="achievements" title="Achievements" icon={<Star className="h-3.5 w-3.5" />} count={(content.achievements ?? []).length} onSave={() => void save()} saving={saving} {...dragProps}>
                      <p className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                        <Info className="mt-0.5 h-3 w-3 shrink-0" />
                        Awards, open source, publications, speaking or competition results. Add scale where you can — e.g. “Selected from 1,200+ entries”.
                      </p>
                      <Entries
                        items={content.achievements ?? []}
                        onChange={(achievements) => touch({ ...content, achievements })}
                        blank={{ title: "", detail: "" }}
                        addLabel="Add achievement"
                        titleFn={(a) => a.title || "Achievement"}
                        render={(a, set) => (
                          <div className="grid grid-cols-[11rem_1fr] gap-3">
                            <Field label="Title" value={a.title} onChange={(v) => set({ ...a, title: v })} placeholder="Codeforces" />
                            <Field label="Detail" value={a.detail} onChange={(v) => set({ ...a, detail: v })} placeholder="**1847** rating, top **4%** globally" />
                          </div>
                        )}
                      />
                    </Section>
                  );
                }
                if (secId === "certificates") {
                  return (
                    <Section key="certificates" title="Certificates" icon={<Award className="h-3.5 w-3.5" />} count={content.certificates.length} onSave={() => void save()} saving={saving} {...dragProps}>
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
                    <Section key="extra" title="Extra-curricular" icon={<Star className="h-3.5 w-3.5" />} count={content.extra.length} onSave={() => void save()} saving={saving} {...dragProps}>
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

              {sectionOrder.join() !== DEFAULT_TEMPLATE_CONFIGS[resolvedConfig.templateId]?.sectionOrder.join() && (
                <button
                  type="button"
                  onClick={resetSectionOrder}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset section order
                </button>
              )}

              {hiddenSections.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAddMenuOpen((o) => !o)}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed py-2.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add a section
                    <span className="text-[10px] text-muted-foreground/70">
                      {hiddenSections.length} empty
                    </span>
                  </button>
                  {addMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setAddMenuOpen(false)} />
                      <div className="absolute bottom-full left-0 z-50 mb-1.5 w-full animate-in fade-in zoom-in-95 rounded-lg border bg-popover p-1 shadow-lg">
                        {hiddenSections.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setRevealed((r) => [...r, id]);
                              setAddMenuOpen(false);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <Plus className="h-3 w-3" />
                            {SECTION_LABELS[id]}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <Section
                title="Resume checks"
                icon={<ListChecks className="h-3.5 w-3.5" />}
                count={lintReport.issues.length}
              >
                <ResumeChecks report={lintReport} />
              </Section>
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
            {/* Mobile mirrors the form side so the toggle is never stranded */}
            <div className="contents md:hidden">
              {tab === "form" ? (
                <TemplateSwitcher
                  templateId={content.template || "swe"}
                  align="right"
                  onPick={pickTemplate}
                />
              ) : (
                <span className="text-xs font-medium text-muted-foreground">LaTeX source</span>
              )}
              <MobileViewToggle value={mobileValue} onChange={changeMobileView} showLatex={showLatex} />
            </div>
            <span className="hidden text-xs font-medium text-muted-foreground md:block">Preview</span>
            <FitAssistant
              pages={info?.pages ?? null}
              busy={info?.busy ?? false}
              failed={info?.failed ?? false}
              density={resolvedConfig.density}
              content={content}
              onTighten={() => {
                touch({
                  ...content,
                  templateConfig: {
                    ...content.templateConfig,
                    templateId: resolvedConfig.templateId,
                    density: "compact",
                  },
                });
                toast("Tightened spacing — recompiling");
              }}
            />
            {/* Desktop only: no ATS view on phones */}
            <Tabs value={rightPane} onValueChange={(v) => setRightPane(v as "pdf" | "ats")} className="hidden md:flex">
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
              <AtsPanel key={atsKey} id={id} stale={dirty} resumeText={renderPlainText(content)} />
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
