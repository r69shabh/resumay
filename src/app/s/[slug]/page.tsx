import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCachedPdf } from "@/lib/compile";
import { getShareJsonLd, getShareText, snapshotAsShareResume } from "@/lib/share";
import ShareViewer from "@/app/r/[slug]/ShareViewer";

// Public page for a frozen "sent" copy. Unlike /r/[slug], this never changes:
// it renders the snapshot's own stored LaTeX and content, so editing the parent
// resume cannot alter what a recruiter is looking at.
export const dynamic = "force-dynamic";

const label = (s: { company: string; role: string; title: string }) =>
  s.company || s.role ? `${s.company}${s.company && s.role ? " — " : ""}${s.role}` : s.title;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const snap = await db.snapshot.findUnique({ where: { slug } });
  if (!snap) return { title: "Not found — resumay" };
  const name = label(snap);
  const desc = `Resume sent to ${name}. A frozen copy that stays exactly as it was submitted.`;
  return {
    title: `${snap.title} — ${name} — resumay`,
    description: desc,
    openGraph: { title: `${snap.title} — ${name}`, description: desc, type: "profile" },
    twitter: {
      card: "summary_large_image",
      title: `${snap.title} — ${name}`,
      description: desc,
    },
  };
}

export default async function SnapshotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snap = await db.snapshot.findUnique({ where: { slug } });
  if (!snap) notFound();
  const asShare = snapshotAsShareResume(snap);
  const [pdfB64, plainText] = await Promise.all([
    getCachedPdf(snap.slug, snap.createdAt, snap.latexSource),
    getShareText(asShare),
  ]);
  return (
    <ShareViewer
      title={snap.title}
      slug={snap.slug}
      latexSource={snap.latexSource}
      pdfB64={pdfB64}
      plainText={plainText}
      jsonLd={getShareJsonLd(asShare)}
      sentTo={label(snap)}
      sentAt={snap.createdAt.toISOString()}
    />
  );
}
