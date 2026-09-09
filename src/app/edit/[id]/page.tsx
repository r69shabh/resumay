"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import NeedKeys, { useAuthConfigured } from "@/components/NeedKeys";
import { Btn, Seg, inputCls, labelCls } from "@/components/ui";
import { toast } from "@/components/Toaster";
import { neonAuthClient } from "@/lib/neon-auth-client";
import LatexPreview, { type PreviewInfo } from "@/components/LatexPreview";
import {
  defaultContent,
  parseContent,
  renderLatex,
  type ResumeContent,
} from "@/lib/resume";

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
      <input
        className={inputCls}
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
      <textarea
        className={inputCls}
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
  count,
  children,
  open,
}: {
  title: string;
  count?: number;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="group rounded-xl bg-zinc-100/70 px-4 dark:bg-zinc-900"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span className="text-zinc-400 transition-transform group-open:rotate-90">›</span>
        <span className="flex-1">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {count}
          </span>
        )}
      </summary>
      <div className="flex flex-col gap-4 pb-4">{children}</div>
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
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, set: (v: T) => void) => ReactNode;
  blank: T;
  addLabel: string;
}) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 border-t border-zinc-200 py-4 first:border-t-0 first:pt-0 last:pb-1 dark:border-zinc-800"
        >
          {render(item, (v) => onChange(items.map((it, j) => (j === i ? v : it))))}
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="self-end text-xs text-zinc-400 hover:text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, blank])}
        className="mt-1 rounded-md border border-dashed px-3 py-2 text-xs text-zinc-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
      >
        + {addLabel}
      </button>
    </div>
  );
}

// What an ATS/parser extracts from the saved PDF. Remounted (via key) after
// each save. Fetches via Suspense so no state-setting effects are needed.
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
  return (
    <div className="flex h-full flex-col gap-2 bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="flex-1">
          {stale
            ? "You have unsaved changes — save to refresh this view."
            : "Extracted from the last saved PDF — this is what a parser sees."}
        </span>
        <button
          onClick={onRefresh}
          className="rounded border px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Refresh
        </button>
      </div>
      {result.status !== 200 || result.error ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <p className="text-sm text-red-600">{result.error ?? `failed (HTTP ${result.status})`}</p>
          {result.log && (
            <pre className="mt-2 max-h-96 overflow-auto rounded bg-black p-3 font-mono text-xs text-red-200">
              {result.log}
            </pre>
          )}
        </div>
      ) : (
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded border bg-white p-3 font-mono text-xs dark:bg-black">
          {result.text || "(empty — add content and save)"}
        </pre>
      )}
    </div>
  );
}

function AtsPanel({ id, stale }: { id: string; stale: boolean }) {
  const [promise, setPromise] = useState(() => loadText(id));
  return (
    <Suspense fallback={<p className="p-4 text-sm text-zinc-500">Extracting…</p>}>
      <AtsBody promise={promise} onRefresh={() => setPromise(loadText(id))} stale={stale} />
    </Suspense>
  );
}

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const authConfigured = useAuthConfigured();
  if (authConfigured === false) return <NeedKeys />;
  if (authConfigured === null) return <main className="p-8 text-sm">Loading…</main>;
  return <EditInner params={params} />;
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
      toast("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copy failed in this browser");
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Share resume</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Anyone with the link can view — no sign-in needed.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            readOnly
            value={shareHref}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 rounded-md border bg-zinc-50 px-2.5 py-1.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950"
          />
          <Btn variant="primary" onClick={() => void copy()}>
            {copied ? "Copied!" : "Copy link"}
          </Btn>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3 dark:border-zinc-800">
          <Link href={`/r/${slug}`} target="_blank">
            <Btn variant="outline">Open public view</Btn>
          </Link>
          {pdfUrl && (
            <a href={pdfUrl} download={`${slug}.pdf`}>
              <Btn variant="outline">Download .pdf</Btn>
            </a>
          )}
          <Btn variant="outline" onClick={onDownloadTex}>
            Download .tex
          </Btn>
          <Link href={`/r/${slug}/text`} target="_blank">
            <Btn variant="ghost">Raw text</Btn>
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

  // Live preview: form renders from edits instantly; raw tab previews raw source.
  const previewSource = useMemo(
    () => (tab === "form" && resume && !resume.customLatex ? renderLatex(content) : raw),
    [tab, content, raw, resume],
  );

  const save = useCallback(async () => {
    if (!resume) return;
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
    if (res.ok) {
      const r: Resume = await res.json();
      setResume(r);
      setRaw(r.latexSource);
      setDirty(false);
      setAtsKey((k) => k + 1);
      setSaveMsg(`Saved ${new Date().toLocaleTimeString()}`);
      toast("Resume saved");
    } else {
      setSaveMsg("Save failed.");
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
    if (!confirm("Discard raw LaTeX edits and re-render from the form?")) return;
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
      setSaveMsg("Re-rendered from form.");
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
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-medium">Sign in to edit this resume.</p>
        <button
          onClick={() =>
            void neonAuthClient.signIn.social({
              provider: "google",
              callbackURL: `/edit/${id}`,
            })
          }
          className="mt-4 rounded bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Sign in with Google
        </button>
      </main>
    );

  if (!resume) return <main className="p-8 text-sm">{saveMsg || "Loading…"}</main>;

  const sharePath = `/r/${resume.slug}`;

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-2 dark:border-zinc-800">
        <Link
          href="/"
          className="shrink-0 rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ←
        </Link>
        <input
          value={resume.title}
          onChange={(e) => {
            setResume({ ...resume, title: e.target.value });
            setDirty(true);
          }}
          placeholder="Untitled resume"
          className="min-w-0 flex-1 border-0 bg-transparent px-1 py-1 text-sm font-semibold outline-none placeholder:text-zinc-400 focus:ring-0"
        />
        <input
          value={resume.roleTag}
          onChange={(e) => {
            setResume({ ...resume, roleTag: e.target.value });
            setDirty(true);
          }}
          placeholder="Tag"
          className="hidden w-24 rounded-full border px-2.5 py-1 text-center text-xs outline-none focus:border-indigo-500 sm:block dark:border-zinc-700 dark:bg-zinc-900"
        />
        <Seg
          options={[
            { value: "form", label: "Form" },
            { value: "latex", label: "LaTeX" },
          ]}
          value={tab}
          onChange={setTab}
        />
        <span className="hidden w-28 shrink-0 text-right text-xs text-zinc-400 lg:block">
          {dirty ? "● Unsaved" : saveMsg || "All changes saved"}
        </span>
        <Btn variant="primary" onClick={() => void save()}>
          Save
        </Btn>
        <Btn variant="outline" onClick={() => setShareOpen(true)}>
          Share
        </Btn>
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

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto md:grid-cols-2 md:overflow-hidden">
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5 md:border-r dark:border-zinc-800">
          {tab === "form" ? (
            <>
              {resume.customLatex && (
                <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs dark:bg-amber-950">
                  This resume has custom LaTeX edits. Saving the form will overwrite them.
                </p>
              )}
              <Section title="Personal details" open>
                <Field label="Full name" value={content.name} onChange={(v) => touch({ ...content, name: v })} placeholder="Jane Doe" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone" value={content.phone} onChange={(v) => touch({ ...content, phone: v })} placeholder="+1 123-456-7890" />
                  <Field label="Email" value={content.email} onChange={(v) => touch({ ...content, email: v })} placeholder="jane@example.com" />
                </div>
                <Field label="Location" value={content.location} onChange={(v) => touch({ ...content, location: v })} placeholder="City, ST" />
              </Section>

              <Section title="Professional summary">
                <Area label="Summary (2–4 lines)" rows={5} value={content.summary} onChange={(v) => touch({ ...content, summary: v })} />
              </Section>

              <Section title="Social links" count={content.links.length}>
                <Entries
                  items={content.links}
                  onChange={(links) => touch({ ...content, links })}
                  blank={{ label: "", url: "" }}
                  addLabel="Add link"
                  render={(l, set) => (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Label" value={l.label} onChange={(v) => set({ ...l, label: v })} placeholder="GitHub" />
                      <Field label="URL" value={l.url} onChange={(v) => set({ ...l, url: v })} placeholder="https://github.com/…" />
                    </div>
                  )}
                />
              </Section>

              <Section title="Education" count={content.education.length} open>
                <Entries
                  items={content.education}
                  onChange={(education) => touch({ ...content, education })}
                  blank={{ school: "", degree: "", location: "", start: "", end: "", grade: "" }}
                  addLabel="Add education"
                  render={(e, set) => (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="School" value={e.school} onChange={(v) => set({ ...e, school: v })} />
                        <Field label="Location" value={e.location} onChange={(v) => set({ ...e, location: v })} />
                      </div>
                      <Field label="Degree" value={e.degree} onChange={(v) => set({ ...e, degree: v })} placeholder="B.S. in Computer Science" />
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Start" value={e.start} onChange={(v) => set({ ...e, start: v })} placeholder="Aug 2021" />
                        <Field label="End" value={e.end} onChange={(v) => set({ ...e, end: v })} placeholder="May 2025" />
                        <Field label="Grade" value={e.grade} onChange={(v) => set({ ...e, grade: v })} placeholder="3.8/4.0" />
                      </div>
                    </>
                  )}
                />
              </Section>

              <Section title="Work Experience" count={content.experience.length} open>
                <Entries
                  items={content.experience}
                  onChange={(experience) => touch({ ...content, experience })}
                  blank={{ title: "", company: "", location: "", start: "", end: "", bullets: "" }}
                  addLabel="Add experience"
                  render={(e, set) => (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Title" value={e.title} onChange={(v) => set({ ...e, title: v })} />
                        <Field label="Company" value={e.company} onChange={(v) => set({ ...e, company: v })} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Location" value={e.location} onChange={(v) => set({ ...e, location: v })} />
                        <Field label="Start" value={e.start} onChange={(v) => set({ ...e, start: v })} placeholder="May 2024" />
                        <Field label="End" value={e.end} onChange={(v) => set({ ...e, end: v })} placeholder="Aug 2024" />
                      </div>
                      <Area label="Bullets (one per line)" value={e.bullets} onChange={(v) => set({ ...e, bullets: v })} placeholder="Built …&#10;Shipped …" />
                    </>
                  )}
                />
              </Section>

              <Section title="Projects" count={content.projects.length}>
                <Entries
                  items={content.projects}
                  onChange={(projects) => touch({ ...content, projects })}
                  blank={{ name: "", tech: "", date: "", url: "", bullets: "" }}
                  addLabel="Add project"
                  render={(p, set) => (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Name" value={p.name} onChange={(v) => set({ ...p, name: v })} />
                        <Field label="Tech" value={p.tech} onChange={(v) => set({ ...p, tech: v })} placeholder="TypeScript, Next.js" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Date" value={p.date} onChange={(v) => set({ ...p, date: v })} placeholder="2024" />
                        <Field label="Link URL" value={p.url} onChange={(v) => set({ ...p, url: v })} placeholder="https://github.com/…/…" />
                      </div>
                      <Area label="Bullets (one per line)" value={p.bullets} onChange={(v) => set({ ...p, bullets: v })} />
                    </>
                  )}
                />
              </Section>

              <Section title="Certificates" count={content.certificates.length}>
                <Entries
                  items={content.certificates}
                  onChange={(certificates) => touch({ ...content, certificates })}
                  blank={{ name: "", issuer: "", date: "" }}
                  addLabel="Add certificate"
                  render={(c, set) => (
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Name" value={c.name} onChange={(v) => set({ ...c, name: v })} />
                      <Field label="Issuer" value={c.issuer} onChange={(v) => set({ ...c, issuer: v })} />
                      <Field label="Date" value={c.date} onChange={(v) => set({ ...c, date: v })} />
                    </div>
                  )}
                />
              </Section>

              <Section title="Skills" count={content.skills.length}>
                <Entries
                  items={content.skills}
                  onChange={(skills) => touch({ ...content, skills })}
                  blank={{ label: "", items: "" }}
                  addLabel="Add skill group"
                  render={(s, set) => (
                    <div className="grid grid-cols-[10rem_1fr] gap-3">
                      <Field label="Group" value={s.label} onChange={(v) => set({ ...s, label: v })} placeholder="Languages" />
                      <Field label="Items" value={s.items} onChange={(v) => set({ ...s, items: v })} placeholder="TypeScript, Python, Go" />
                    </div>
                  )}
                />
              </Section>

              <Section title="Extra curricular" count={content.extra.length}>
                <Entries
                  items={content.extra}
                  onChange={(extra) => touch({ ...content, extra })}
                  blank={{ title: "", detail: "" }}
                  addLabel="Add entry"
                  render={(x, set) => (
                    <div className="grid grid-cols-[10rem_1fr] gap-3">
                      <Field label="Title" value={x.title} onChange={(v) => set({ ...x, title: v })} />
                      <Field label="Detail" value={x.detail} onChange={(v) => set({ ...x, detail: v })} />
                    </div>
                  )}
                />
              </Section>
            </>
          ) : (
            <div className="flex min-h-64 flex-1 flex-col gap-2 md:min-h-0">
              {resume.customLatex && (
                <div className="flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs dark:bg-amber-950">
                  <span className="flex-1">Custom LaTeX — the form no longer drives this resume.</span>
                  <button onClick={() => void resetGenerated()} className="underline">
                    Re-render from form
                  </button>
                </div>
              )}
              {!resume.customLatex && (
                <p className="px-1 text-xs text-zinc-500">
                  Generated from the form (read-only). Edit here to fork into custom LaTeX.
                </p>
              )}
              <div className="min-h-64 flex-1 md:min-h-0">
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
        <div className="relative min-h-96 bg-zinc-100 md:min-h-0 dark:bg-zinc-950">
          <div className="absolute right-3 top-3 z-10">
            <Seg
              options={[
                { value: "pdf", label: "PDF" },
                { value: "ats", label: "ATS text" },
              ]}
              value={rightPane}
              onChange={setRightPane}
            />
          </div>
          <div className="h-full min-h-0">
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
