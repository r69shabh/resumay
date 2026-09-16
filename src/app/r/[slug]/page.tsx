import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCachedPdf } from "@/lib/compile";
import { getShareJsonLd, getShareText } from "@/lib/share";
import ShareViewer from "./ShareViewer";

// Public, no-login share page: PDF compiled server-side (cached per update),
// plus machine-readable text + structured data for ATS capture.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resume = await db.resume.findUnique({ where: { slug } });
  if (!resume) return { title: "Not found — resumay" };
  const desc = `Resume: ${resume.title}${resume.roleTag ? ` (${resume.roleTag})` : ""}. Typeset with real LaTeX — view, download PDF, or fetch clean ATS text.`;
  return {
    title: `${resume.title} — resumay`,
    description: desc,
    openGraph: {
      title: `${resume.title} — resumay`,
      description: desc,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${resume.title} — resumay`,
      description: desc,
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resume = await db.resume.findUnique({ where: { slug } });
  if (!resume) notFound();
  const [pdfB64, plainText] = await Promise.all([
    getCachedPdf(resume.slug, resume.updatedAt, resume.latexSource),
    getShareText(resume),
  ]);
  return (
    <ShareViewer
      title={resume.title}
      slug={resume.slug}
      latexSource={resume.latexSource}
      pdfB64={pdfB64}
      plainText={plainText}
      jsonLd={getShareJsonLd(resume)}
    />
  );
}
