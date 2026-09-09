"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NeedKeys, { useAuthConfigured } from "@/components/NeedKeys";
import { neonAuthClient } from "@/lib/neon-auth-client";
import { toast } from "@/components/Toaster";
import { Btn, Card, inputCls } from "@/components/ui";

type Resume = {
  id: string;
  slug: string;
  title: string;
  roleTag: string;
  updatedAt: string;
};

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

  // Fetch-on-mount for session-gated client data. (The Suspense/use() variant
  // suspended forever here, so this stays deliberately boring.)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    toast("Resume deleted");
    void load();
  };

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl(slug));
      toast("Link copied to clipboard");
    } catch {
      toast("Copy failed in this browser");
    }
  };

  const shareUrl = (slug: string) => `${window.location.origin}/r/${slug}`;

  if (error) {
    return (
      <div className="mt-6 rounded-lg border p-4 text-sm">
        <p className="text-red-600">Couldn&apos;t load resumes: {error}</p>
        <button onClick={() => void load()} className="mt-2 rounded border px-3 py-1.5 text-xs">
          Retry
        </button>
      </div>
    );
  }

  if (resumes === null) return <p className="mt-6 text-sm text-zinc-500">Loading…</p>;

  const tags = [...new Set(resumes.map((r) => r.roleTag).filter(Boolean))];
  const shown = filter ? resumes.filter((r) => r.roleTag === filter) : resumes;

  return (
    <>
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("")}
            className={`rounded-full px-3 py-1 text-xs ${!filter ? "bg-indigo-600 text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(filter === t ? "" : t)}
              className={`rounded-full px-3 py-1 text-xs ${filter === t ? "bg-indigo-600 text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {shown.length === 0 && (
          <div className="rounded-xl bg-zinc-100/70 px-4 py-10 text-center dark:bg-zinc-900">
            <p className="text-sm font-medium">No resumes yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Create your first resume above — it takes a minute.
            </p>
          </div>
        )}
        {shown.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-2 rounded-xl border border-transparent px-4 py-3 hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/edit/${r.id}`}
                className="truncate font-medium hover:text-indigo-600 hover:underline dark:hover:text-indigo-400"
              >
                {r.title}
              </Link>
              <p className="mt-0.5 text-xs text-zinc-500">
                {r.roleTag && <span className="mr-2 rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{r.roleTag}</span>}
                Updated {new Date(r.updatedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => void copyLink(r.slug)}
              title="Copy public share link"
              className="shrink-0 rounded-md px-2.5 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              Copy link
            </button>
            <button
              onClick={() => onDuplicate(r.id)}
              title="Duplicate as starting point for a new role"
              className="shrink-0 rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              ⧉
            </button>
            <button
              onClick={() => void remove(r.id)}
              title="Delete"
              className="shrink-0 rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Home() {
  const authConfigured = useAuthConfigured();
  if (authConfigured === false) return <NeedKeys />;
  if (authConfigured === null) return <main className="p-8 text-sm">Loading…</main>;
  return <HomeInner />;
}

function GithubIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function About() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <Btn variant="outline" onClick={() => setOpen((o) => !o)}>
        About
      </Btn>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-60 rounded-lg border bg-white p-4 text-left shadow-lg dark:bg-zinc-900">
          <p className="text-sm font-bold">resumay</p>
          <p className="mt-1 text-xs text-zinc-500">built with ♥ by r69shabh</p>
          <div className="mt-3 flex items-center gap-4 text-zinc-600 dark:text-zinc-300">
            <a
              href="https://github.com/r69shabh"
              target="_blank"
              rel="noreferrer"
              title="r69shabh on GitHub"
              className="hover:text-black dark:hover:text-white"
            >
              <GithubIcon />
            </a>
            <a
              href="https://x.com/r69shabh"
              target="_blank"
              rel="noreferrer"
              title="@r69shabh on X"
              className="hover:text-black dark:hover:text-white"
            >
              <XIcon />
            </a>
          </div>
        </div>
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

  const signInGoogle = () =>
    void neonAuthClient.signIn.social({ provider: "google", callbackURL: "/" });

  const signOut = async () => {
    await neonAuthClient.signOut();
    router.refresh();
  };

  const create = async (forkFrom?: string) => {
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || undefined, roleTag: roleTag || undefined, forkFrom }),
    });
    const r: Resume = await res.json();
    router.push(`/edit/${r.id}`);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Fill in sections, get a polished ATS-friendly PDF with a shareable link.
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <About />
          {user ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden text-zinc-500 sm:inline">{user.email}</span>
              <Btn variant="outline" onClick={() => void signOut()}>
                Sign out
              </Btn>
            </div>
          ) : (
            <Btn variant="primary" onClick={signInGoogle} className="px-4 py-2 text-sm">
              Sign in with Google
            </Btn>
          )}
        </div>
      </div>

      {!user && (
        <Card className="mt-12 p-8 text-center">
          <p className="font-medium">Sign in to create and manage your resumes.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Your resumes stay private — only links you share are public.
          </p>
          <Btn variant="primary" onClick={signInGoogle} className="mt-4 px-4 py-2 text-sm">
            Sign in with Google
          </Btn>
        </Card>
      )}

      {user && (
        <>
          <Card className="mt-6 flex flex-col gap-2 p-4 sm:flex-row">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title e.g. SWE resume"
              className={`${inputCls} flex-1`}
            />
            <input
              value={roleTag}
              onChange={(e) => setRoleTag(e.target.value)}
              placeholder="Role tag e.g. SWE"
              className={`${inputCls} w-full sm:w-40`}
            />
            <Btn variant="primary" onClick={() => void create()} className="px-4 py-2 text-sm">
              New resume
            </Btn>
          </Card>

          <ResumeList onDuplicate={(id) => void create(id)} />
          <p className="mt-10 text-center text-xs text-zinc-400">
            resumay — built with ♥ by r69shabh
          </p>
        </>
      )}
    </main>
  );
}
