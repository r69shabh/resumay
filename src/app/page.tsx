"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NeedKeys, { useAuthConfigured } from "@/components/NeedKeys";
import { neonAuthClient } from "@/lib/neon-auth-client";
import { toast } from "@/components/Toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  Plus,
  Link2,
  Copy,
  Trash2,
  Clock,
  ArrowRight,
  Search,
  X,
  Tag,
  ExternalLink,
  MoreVertical,
  Check,
  Sparkles,
  Layout,
  MessageSquare,
} from "lucide-react";
import {
  RESUME_TEMPLATES,
  type ResumeTemplate,
  type TemplateCategory,
} from "@/lib/templates-data";
import { SuggestionBox } from "@/components/SuggestionBox";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { ResumayLogo } from "@/components/ResumayLogo";
import { AuthLoadingScreen, LoginScreen } from "@/components/LoginScreen";
import ProfileMenu from "@/components/ProfileMenu";

type Resume = {
  id: string;
  slug: string;
  title: string;
  roleTag: string;
  updatedAt: string;
  content?: unknown;
};

// ─── Template Paper Preview ───────────────────────────────────────────────────

function ResumeTemplateSheet({ tmpl }: { tmpl: ResumeTemplate }) {
  const isCentered = tmpl.layoutInfo.headerStyle === "Centered Classic";
  const isSplit = tmpl.layoutInfo.headerStyle === "Split Compact";
  const isSans = tmpl.layoutInfo.typography === "Modern Sans-Serif";
  const isBlank = tmpl.id === "blank";

  if (isBlank) {
    return (
      <div className="relative aspect-[8.5/11] w-full rounded-md border border-dashed border-border/80 bg-background/50 p-4 flex flex-col items-center justify-center text-muted-foreground/40 group-hover:border-foreground/30 group-hover:text-muted-foreground transition-all shadow-xs">
        <Plus className="h-6 w-6 stroke-[1.5]" />
        <span className="mt-2 text-[10px] font-medium tracking-wide">Blank Slate</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[8.5/11] w-full rounded-md border bg-background p-3 flex flex-col justify-start overflow-hidden shadow-xs group-hover:border-foreground/30 transition-all select-none">
      {/* Header */}
      <div className="border-b border-border/60 pb-1.5 shrink-0">
        {isCentered ? (
          <div className="flex flex-col items-center text-center">
            <span
              className={`text-[8px] font-bold text-foreground tracking-tight ${
                isSans ? "font-sans" : "font-serif uppercase tracking-wider"
              }`}
            >
              {tmpl.content.name || "Alex Morgan"}
            </span>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[5px] text-muted-foreground/70">
              <span>{tmpl.content.location || "San Francisco, CA"}</span>
              <span>•</span>
              <span>{tmpl.content.email || "alex@example.com"}</span>
              <span>•</span>
              <span>{tmpl.id === "finance" ? "linkedin.com" : "github.com"}</span>
            </div>
          </div>
        ) : isSplit ? (
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[8px] font-bold font-sans text-foreground tracking-tight">
                {tmpl.content.name || "David Kim"}
              </div>
              <div className="text-[5px] text-muted-foreground font-medium">
                Systems Engineer
              </div>
            </div>
            <div className="text-right text-[5px] text-muted-foreground/70 leading-tight">
              <div>(555) 789-0123</div>
              <div>david@example.com</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[8px] font-bold font-sans text-foreground tracking-tight">
                {tmpl.content.name || "Taylor Reed"}
              </span>
              {tmpl.id === "pm" && (
                <span className="text-[5px] text-muted-foreground font-medium">
                  Product Manager
                </span>
              )}
              {tmpl.id === "consulting" && (
                <span className="text-[5px] text-muted-foreground font-medium">
                  Strategy Consultant
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[5px] text-muted-foreground/70">
              <span>{tmpl.content.location || "Austin, TX"}</span>
              <span>•</span>
              <span>{tmpl.content.email || "email@example.com"}</span>
              <span>•</span>
              <span>linkedin.com</span>
            </div>
          </div>
        )}
      </div>

      {/* Sections rendered in their actual template order */}
      <div className="mt-1.5 space-y-1.5 flex-1 overflow-hidden">
        {tmpl.layoutInfo.sequence.slice(0, 4).map((sec, idx) => (
          <div key={idx} className="space-y-0.5">
            {/* Section Heading with divider */}
            <div className="flex items-center gap-1">
              <span
                className={`text-[5.5px] font-bold uppercase tracking-wider text-foreground/80 ${
                  isSans ? "font-sans" : "font-serif"
                }`}
              >
                {sec.replace(/ & .*/, "")}
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* Simulated Content lines */}
            <div className="space-y-0.5 pl-0.5">
              <div className="flex justify-between items-center text-[5px] text-muted-foreground/80 font-medium">
                <div className="h-1 w-1/2 rounded-full bg-foreground/20" />
                <div className="h-1 w-1/5 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <div className="h-0.5 w-full rounded-full bg-muted-foreground/15" />
                <div className="h-0.5 w-4/5 rounded-full bg-muted-foreground/15" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hover action overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px] opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center gap-1 rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-sm">
          <span>Use Template</span>
          <ArrowRight className="h-2.5 w-2.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Theme Toggle Switch ──────────────────────────────────────────────────────

// ─── Live PDF Canvas Thumbnail ────────────────────────────────────────────────

function ResumePaperPreview({ resume }: { resume: Resume }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);

  // Only compile when the card scrolls near the viewport: the server compiles
  // 2 resumes at a time, so firing all thumbnails at once starves some into
  // timeouts ("Preview unavailable").
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Browser-cached bytes keyed by updatedAt: repeat visits never recompile.
  // Stale renders are orphaned by the key change and pruned on each miss.
  async function loadPdfBytes(): Promise<Uint8Array> {
    const pdfUrl = `/api/resumes/${resume.id}/pdf`;
    const cacheKey = `${pdfUrl}?updatedAt=${encodeURIComponent(resume.updatedAt)}`;
    try {
      if ("caches" in window) {
        const hit = await (await caches.open("resume-thumbs")).match(cacheKey);
        if (hit) return new Uint8Array(await hit.arrayBuffer());
      }
    } catch {
      // cache unavailable: fetch live below
    }
    const res = await fetch(pdfUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    try {
      if ("caches" in window) {
        const cache = await caches.open("resume-thumbs");
        await cache.put(
          cacheKey,
          new Response(buf.slice(0), { headers: { "Content-Type": "application/pdf" } }),
        );
        const keys = await cache.keys();
        for (const k of keys) {
          if (k.url.includes(`${pdfUrl}?`) && !k.url.endsWith(cacheKey)) {
            await cache.delete(k);
          }
        }
      }
    } catch {
      // caching is best-effort only
    }
    return new Uint8Array(buf);
  }

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
          const loadingTask = pdfjs.getDocument({ data: await loadPdfBytes() });
          const pdf = await loadingTask.promise;
          if (cancelled) return;
          const page = await pdf.getPage(1);
          if (cancelled) return;

          const canvas = canvasRef.current;
          if (!canvas) return;

          // Render at sharp scale for thumbnail
          const viewport = page.getViewport({ scale: 1.2 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          await (page as any).render({ canvasContext: ctx, viewport, canvas }).promise;
          if (!cancelled) setLoaded(true);
          return;
        } catch (e) {
          if (cancelled) return;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 1500));
          } else {
            setError(true);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume.id, resume.updatedAt, visible]);

  return (
    <div ref={boxRef} className="relative aspect-[8.5/11] w-full overflow-hidden rounded-lg border bg-white dark:bg-card shadow-xs transition-all duration-200 group-hover:border-foreground/40 group-hover:shadow-md select-none">
      {/* Live PDF Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Elegant Fallback / Skeleton while PDF compiles */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-card text-[6px] text-muted-foreground/60">
          <div>
            <div className="border-b border-border/80 pb-2 text-center">
              <div className="mx-auto h-2 w-20 rounded bg-foreground/70 animate-pulse" />
              <div className="mx-auto mt-1 h-1 w-28 rounded bg-muted-foreground/30 animate-pulse" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-14 rounded bg-foreground/50 animate-pulse" />
              <div className="space-y-1">
                <div className="h-1 w-full rounded bg-muted-foreground/20 animate-pulse" />
                <div className="h-1 w-4/5 rounded bg-muted-foreground/20 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-12 rounded bg-foreground/50 animate-pulse" />
              <div className="space-y-1">
                <div className="h-1 w-full rounded bg-muted-foreground/20 animate-pulse" />
                <div className="h-1 w-3/4 rounded bg-muted-foreground/20 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="text-center font-mono text-[6px] text-muted-foreground/40">
            {error ? "Preview unavailable" : "Rendering PDF…"}
          </div>
        </div>
      )}

      {/* Hover action overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
          <span>Edit</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const authConfigured = useAuthConfigured();
  if (authConfigured === false) return <NeedKeys />;
  if (authConfigured === null) return null;
  return <HomeInner />;
}

function HomeInner() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = neonAuthClient.useSession();
  const user = session?.user;

  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModalResume, setDeleteModalResume] = useState<Resume | null>(null);
  const [shareModalResume, setShareModalResume] = useState<Resume | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>("all");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setError("");
    try {
      const r = await fetch("/api/resumes");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setResumes((await r.json()) as Resume[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    if (user) {
      void load();
    }
  }, [user]);

  const signInGoogle = () =>
    void neonAuthClient.signIn.social({ provider: "google", callbackURL: "/" });

  const signOut = async () => {
    await neonAuthClient.signOut();
    router.refresh();
  };

  const create = async (forkFrom?: string) => {
    setCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled resume",
          forkFrom,
        }),
      });
      const r: Resume = await res.json();
      router.push(`/edit/${r.id}`);
    } catch {
      toast("Failed to create resume");
      setCreating(false);
    }
  };

  const createFromTemplate = async (template: ResumeTemplate) => {
    setCreating(true);
    setTemplateModalOpen(false);
    try {
      const cleanTitle =
        template.id === "blank"
          ? "Untitled resume"
          : `${template.name.replace(/\s*\(.*?\)/, "")} Resume`;
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          roleTag: template.roleTag,
          content: template.content,
        }),
      });
      const r: Resume = await res.json();
      router.push(`/edit/${r.id}`);
    } catch {
      toast("Failed to create resume from template");
      setCreating(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      toast("Resume deleted");
      setDeleteModalResume(null);
      void load();
    } catch {
      toast("Delete failed");
    }
  };

  const copyModalLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed");
    }
  };

  // Unified search: filters both by resume title or role tag
  const filteredResumes = (resumes ?? []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchTitle = (r.title || "").toLowerCase().includes(q);
    const matchTag = (r.roleTag || "").toLowerCase().includes(q);
    return matchTitle || matchTag;
  });

  // While the session cookie is being verified, show loading — never the
  // login screen, so a logged-in user never sees a logged-out flash.
  if (sessionPending) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <LoginScreen signInGoogle={signInGoogle} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex h-16 w-full items-center justify-between px-6 sm:px-8 border-b border-border/40">
        {/* Left Corner: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-base hover:opacity-80 transition-opacity shrink-0 group"
        >
          <ResumayLogo size={26} />
          <span>resumay</span>
        </Link>

        {/* Center: Single Unified Search Bar */}
        <div className="relative mx-6 w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes by name or tag..."
            className="h-9 w-full rounded-lg bg-muted/40 pl-9 pr-8 text-xs hover:bg-muted/60 focus:bg-background transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right Corner: Suggestions + Profile Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSuggestionsOpen(true)}
            className="h-9 gap-1.5 text-xs rounded-full px-3 text-muted-foreground hover:text-foreground"
            title="View user suggestions"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Suggestions</span>
          </Button>

          <ProfileMenu
            user={user}
            onSignOut={() => void signOut()}
            menuExtras={(close) => (
              <button
                type="button"
                onClick={() => {
                  close();
                  setSuggestionsOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>View suggestions</span>
              </button>
            )}
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-6xl px-6 sm:px-8 py-8 flex-1">
        {/* Logged in Resume Gallery Grid */}
        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Failed to load resumes: {error}
              </p>
              <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void load()}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {resumes === null && (
              <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
                Loading resumes…
              </div>
            )}

            {resumes !== null && (
              <div>
                {/* Search result indicator if searching */}
                {searchQuery && (
                  <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Found {filteredResumes.length}{" "}
                      {filteredResumes.length === 1 ? "resume" : "resumes"} matching &ldquo;{searchQuery}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-foreground underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {/* Grid of Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
                  {/* Card 1: New Resume Card (Same size box with plus icon) */}
                  <div
                    onClick={() => !creating && setTemplateModalOpen(true)}
                    className={`group flex flex-col cursor-pointer ${creating ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <div className="flex aspect-[8.5/11] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 bg-muted/20 hover:border-foreground/40 hover:bg-muted/40 transition-all p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border bg-background shadow-xs group-hover:scale-105 transition-transform">
                        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                      </div>
                      <span className="mt-3 text-xs font-semibold text-foreground">
                        {creating ? "Creating…" : "New Resume"}
                      </span>
                      <span className="mt-0.5 text-[11px] text-muted-foreground">
                        Choose template or blank
                      </span>
                    </div>
                    <div className="mt-2.5 px-0.5">
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        + Choose template
                      </p>
                    </div>
                  </div>

                  {/* Existing Resumes as Cards */}
                  {filteredResumes.map((r) => (
                    <div key={r.id} className="group flex flex-col">
                      {/* Document Preview Area */}
                      <Link href={`/edit/${r.id}`} className="block">
                        <ResumePaperPreview resume={r} />
                      </Link>

                      {/* Card Meta & Three-Dot Menu Below Preview */}
                      <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
                        <div className="min-w-0 flex-1">
                          {/* Larger title */}
                          <Link
                            href={`/edit/${r.id}`}
                            className="block truncate text-sm font-semibold text-foreground hover:underline"
                            title={r.title || "Untitled resume"}
                          >
                            {r.title || "Untitled resume"}
                          </Link>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {/* Role Tags aligned with inside editor style */}
                            {r.roleTag
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .map((t, i) => (
                                <div
                                  key={`${t}-${i}`}
                                  className="inline-flex items-center gap-1 rounded-md border border-dashed px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                >
                                  <Tag className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate max-w-[80px]">{t}</span>
                                </div>
                              ))}

                            {/* Date */}
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(r.updatedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Three-Dot Menu */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === r.id ? null : r.id);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === r.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              />
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-44 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg z-40 animate-in fade-in zoom-in-95"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setShareModalResume(r);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
                                >
                                  <Link2 className="h-3.5 w-3.5" />
                                  <span>Copy link / Share</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    void create(r.id);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Duplicate</span>
                                </button>

                                <div className="my-1 h-px bg-border" />

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setDeleteModalResume(r);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredResumes.length === 0 && searchQuery && (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    No resumes match &ldquo;{searchQuery}&rdquo;. Try another term.
                  </div>
                )}
              </div>
            )}
      </main>

      {/* ─── Author Attribution Footer ─── */}
      <footer className="mt-auto border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-8">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse text-sm">❤️</span>
            <span>by</span>
            <a
              href="https://x.com/r69shabh"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:underline transition-colors"
            >
              r69shabh
            </a>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden text-muted-foreground/80 sm:inline">Follow me on</span>
            <a
              href="https://x.com/r69shabh"
              target="_blank"
              rel="noopener noreferrer"
              title="X (@r69shabh)"
              className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              <svg className="h-4 w-4 fill-current sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="hidden sm:inline">X (@r69shabh)</span>
            </a>
            <span className="hidden text-border sm:inline">•</span>
            <a
              href="https://github.com/r69shabh"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              <svg className="h-4 w-4 fill-current sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <span className="hidden text-border sm:inline">•</span>
            <a
              href="https://buymeacoffee.com/r69shabh"
              target="_blank"
              rel="noopener noreferrer"
              title="Buy me a coffee"
              className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 hover:underline transition-colors"
            >
              <span className="text-base leading-none sm:text-xs">☕</span>
              <span className="hidden sm:inline">Buy me a coffee</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Give Suggestion Box */}
      <SuggestionBox />

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteModalResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeleteModalResume(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Delete resume</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteModalResume.title || "Untitled resume"}&rdquo;
              </span>
              ?
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalResume(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void confirmDelete(deleteModalResume.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Share / Copy Modal ─── */}
      {shareModalResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShareModalResume(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Link2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Share resume</h3>
                  <p className="text-xs text-muted-foreground">
                    Public link for &ldquo;{shareModalResume.title || "Untitled resume"}&rdquo;
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareModalResume(null)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/r/${shareModalResume.slug}`}
                onFocus={(e) => e.target.select()}
                className="h-9 font-mono text-xs"
              />
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  void copyModalLink(
                    `${typeof window !== "undefined" ? window.location.origin : ""}/r/${shareModalResume.slug}`
                  )
                }
                className="h-9 shrink-0 gap-1.5"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            <div className="mt-5 flex items-center justify-between border-t pt-4">
              <Link
                href={`/r/${shareModalResume.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open public page</span>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareModalResume(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Templates Modal ─── */}
      {templateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in"
          onClick={() => setTemplateModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-xl border bg-card p-5 sm:p-6 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
                  Choose a Template
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select a layout to get started or start with a blank document.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTemplateModalOpen(false)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto py-2.5 border-b shrink-0 text-xs">
              <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "engineering", label: "Engineering" },
                    { id: "product", label: "Product" },
                    { id: "business", label: "Business" },
                    { id: "design", label: "Design" },
                    { id: "research", label: "Research" },
                    { id: "student", label: "Student" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTemplateCategory(cat.id)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                      templateCategory === cat.id
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Template Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 overflow-y-auto py-3.5 pr-1 max-h-[64vh]">
              {RESUME_TEMPLATES.filter(
                (t) => templateCategory === "all" || t.category === templateCategory
              ).map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => !creating && void createFromTemplate(tmpl)}
                  className="group relative flex flex-col rounded-xl border border-border bg-card p-2.5 hover:border-foreground/40 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Paper Sheet Preview */}
                  <ResumeTemplateSheet tmpl={tmpl} />

                  {/* Metadata below preview */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 px-0.5">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-foreground truncate group-hover:underline">
                        {tmpl.name}
                      </h4>
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
                        {tmpl.layoutInfo.typography.split(" ")[0]} · {tmpl.layoutInfo.priority}
                      </p>
                    </div>

                    {tmpl.roleTag && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shrink-0">
                        {tmpl.roleTag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions viewer modal */}
      <SuggestionsModal
        isOpen={suggestionsOpen}
        onClose={() => setSuggestionsOpen(false)}
      />
    </div>
  );
}
