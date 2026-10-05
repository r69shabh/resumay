import { parseContent, renderPlainText, shareJsonLd } from "@/lib/resume";
import { compileLatex, extractPdfText } from "@/lib/compile";

// Public share links. Long enough that guessing one is not practical.
export const newSlug = () =>
  Math.random().toString(36).slice(2, 10).padEnd(8, "x") +
  Math.random().toString(36).slice(2, 10);

type ShareResume = {
  slug: string;
  title: string;
  updatedAt: Date;
  latexSource: string;
  content: unknown;
};

// Machine-readable text for a shared resume. Structured content renders
// directly (no compile); legacy raw-LaTeX rows fall back to PDF extraction.
export async function getShareText(r: ShareResume): Promise<string | null> {
  if (r.content != null) return renderPlainText(parseContent(r.content));
  try {
    return await extractPdfText(await compileLatex(r.latexSource));
  } catch {
    return null;
  }
}

export function getShareJsonLd(r: Pick<ShareResume, "content">): object | null {
  if (r.content == null) return null;
  return shareJsonLd(parseContent(r.content));
}

// A frozen snapshot is shaped like a share resume, so it can be compiled and
// rendered through exactly the same path.
export type SnapshotRow = {
  slug: string;
  title: string;
  latexSource: string;
  content: unknown;
  company: string;
  role: string;
  createdAt: Date;
};

export function snapshotAsShareResume(s: SnapshotRow): ShareResume {
  return {
    slug: s.slug,
    title: s.title,
    updatedAt: s.createdAt,
    latexSource: s.latexSource,
    content: s.content,
  };
}
