import { parseContent, renderPlainText, shareJsonLd } from "@/lib/resume";
import { compileLatex, extractPdfText } from "@/lib/compile";

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
