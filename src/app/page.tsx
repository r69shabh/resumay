"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NeedKeys, { useAuthConfigured } from "@/components/NeedKeys";
import { neonAuthClient } from "@/lib/neon-auth-client";
import { toast } from "@/components/Toaster";
import {
  Btn,
  Card,
  Badge,
  Input,
  type BadgeVariant,
} from "@/components/ui";
import {
  FileText,
  Plus,
  Link2,
  Copy,
  Trash2,
  Clock,
  ArrowRight,
  Sparkles,
  LogOut,
  FilePlus,
} from "lucide-react";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

type Resume = {
  id: string;
  slug: string;
  title: string;
  roleTag: string;
  updatedAt: string;
};

const ROLE_COLORS: Record<string, BadgeVariant> = {
  SWE: "indigo",
  Backend: "violet",
  Frontend: "sky",
  Fullstack: "emerald",
  "AI/ML": "amber",
};

function getRoleBadgeVariant(tag: string): BadgeVariant {
  return ROLE_COLORS[tag] ?? "secondary";
}

function ResumeList({ onDuplicate }: { onDuplicate: (id: string) => void }) {
  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const load = async () => {
    setError("");
    try {
      const r = await fetch("/api/resumes");
      if (!r.ok) throw new Error(`failed (HTTP ${r.status})`);
      setResumes((await r.json()) as Resume[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    toast("Resume deleted");
    void load();
  };

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl(slug));
      toast("Public link copied to clipboard");
    } catch {
      toast("Copy failed in this browser");
    }
  };

  const shareUrl = (slug: string) => `${window.location.origin}/r/${slug}`;

  if (error) {
    return (
      <Card className="mt-8 border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          Couldn&apos;t load resumes: {error}
        </p>
        <Btn onClick={() => void load()} variant="outline" size="sm" className="mt-3">
          Try again
        </Btn>
      </Card>
    );
  }

  if (resumes === null) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs">Loading resumes…</p>
      </div>
    );
  }

  const tags = [...new Set(resumes.map((r) => r.roleTag).filter(Boolean))];
  const shown = filter ? resumes.filter((r) => r.roleTag === filter) : resumes;

  return (
    <div className="mt-8 flex flex-col gap-5">
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("")}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
              !filter
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All <span className="opacity-70">({resumes.length})</span>
          </button>
          {tags.map((t) => {
            const count = resumes.filter((r) => r.roleTag === t).length;
            return (
              <button
                key={t}
                onClick={() => setFilter(filter === t ? "" : t)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  filter === t
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {shown.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <FilePlus className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-foreground">No resumes found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {filter
              ? `No resumes tagged with "${filter}". Try selecting another tag or view All.`
              : "Create your first resume using the toolbar above — it only takes a minute."}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {shown.map((r) => (
          <Card
            key={r.id}
            className="group relative flex flex-col gap-3 p-4 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50/70 text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-400">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/edit/${r.id}`}
                    className="truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {r.title}
                  </Link>
                  {r.roleTag && (
                    <Badge variant={getRoleBadgeVariant(r.roleTag)}>
                      {r.roleTag}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(r.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-mono text-[11px] opacity-60">r/{r.slug}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <Btn
                variant="outline"
                size="sm"
                onClick={() => void copyLink(r.slug)}
                title="Copy public link"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Link</span>
              </Btn>

              <Btn
                variant="outline"
                size="sm"
                onClick={() => onDuplicate(r.id)}
                title="Duplicate resume"
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Duplicate</span>
              </Btn>

              <Link href={`/edit/${r.id}`}>
                <Btn variant="secondary" size="sm" className="font-medium">
                  <span>Edit</span>
                  <ArrowRight className="h-3 w-3" />
                </Btn>
              </Link>

              <Btn
                variant="ghost"
                size="sm"
                onClick={() => void remove(r.id)}
                title="Delete resume"
                className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const authConfigured = useAuthConfigured();
  if (authConfigured === false) return <NeedKeys />;
  if (authConfigured === null)
    return (
      <main className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </main>
    );
  return <HomeInner />;
}

function About() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <Btn variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        About
      </Btn>
      {open && (
        <Card className="absolute right-0 top-full z-20 mt-2 w-64 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">resumay</p>
              <p className="text-[11px] text-muted-foreground">built by r69shabh</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Fast, ATS-friendly LaTeX resume generator with live browser preview and zero LaTeX hassle.
          </p>
          <div className="mt-3.5 flex items-center gap-4 border-t border-border pt-3">
            <a
              href="https://github.com/r69shabh"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://x.com/r69shabh"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="h-3 w-3" />
              <span>@r69shabh</span>
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}

function HomeInner() {
  const router = useRouter();
  const { data: session } = neonAuthClient.useSession();
  const user = session?.user;
  const [title, setTitle] = useState("");
  const [roleTag, setRoleTag] = useState("");
  const [creating, setCreating] = useState(false);

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
          title: title.trim() || undefined,
          roleTag: roleTag.trim() || undefined,
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

  const SUGGESTIONS = ["SWE", "Backend", "Frontend", "Fullstack", "AI/ML"];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                resumay
              </h1>
              <Badge variant="indigo" className="text-[10px] px-2 py-0">
                PRO
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ATS-safe LaTeX typesetting, zero LaTeX code needed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <About />
          {user ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 pl-3 text-xs shadow-xs">
              <span className="hidden max-w-[160px] truncate text-muted-foreground sm:inline font-medium">
                {user.email}
              </span>
              <Btn
                variant="ghost"
                size="xs"
                onClick={() => void signOut()}
                className="text-muted-foreground hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign out</span>
              </Btn>
            </div>
          ) : (
            <Btn variant="primary" size="sm" onClick={signInGoogle}>
              Sign in with Google
            </Btn>
          )}
        </div>
      </div>

      {/* Logged Out Hero */}
      {!user && (
        <Card className="mt-12 overflow-hidden border-indigo-100/60 p-8 text-center shadow-md dark:border-indigo-900/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Build your high-converting, ATS-proof resume
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            Fill in clean form sections, view real-time compiled PDF preview, and generate a shareable web link. Stored securely and privately.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Badge variant="indigo">✓ Jake&apos;s ATS Template</Badge>
            <Badge variant="emerald">✓ Sub-second Tectonic Compile</Badge>
            <Badge variant="violet">✓ Instant Public Share URL</Badge>
          </div>

          <div className="mt-6">
            <Btn
              variant="primary"
              size="lg"
              onClick={signInGoogle}
              className="gap-2 shadow-md shadow-indigo-500/20"
            >
              <span>Get Started with Google</span>
              <ArrowRight className="h-4 w-4" />
            </Btn>
          </div>
        </Card>
      )}

      {/* Logged In Dashboard */}
      {user && (
        <>
          {/* Quick Create Card */}
          <Card className="mt-8 p-4 shadow-xs">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Resume title (e.g. Staff SWE Resume)"
                  className="pl-3"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void create();
                  }}
                />
              </div>

              <div className="relative w-full sm:w-36">
                <Input
                  value={roleTag}
                  onChange={(e) => setRoleTag(e.target.value)}
                  placeholder="Tag e.g. SWE"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void create();
                  }}
                />
              </div>

              <Btn
                variant="primary"
                size="default"
                disabled={creating}
                onClick={() => void create()}
                className="gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>{creating ? "Creating…" : "New Resume"}</span>
              </Btn>
            </div>

            {/* Quick role tag pills */}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-[11px] font-medium">Suggestions:</span>
              <div className="flex flex-wrap gap-1">
                {SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setRoleTag(tag)}
                    className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Resumes List */}
          <ResumeList onDuplicate={(id) => void create(id)} />

          <footer className="mt-14 pb-8 text-center text-xs text-muted-foreground/70">
            <p>resumay — engineered with care by r69shabh</p>
          </footer>
        </>
      )}
    </main>
  );
}
