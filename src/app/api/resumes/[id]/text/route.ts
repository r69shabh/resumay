import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { CompileError, compileLatex, extractPdfText } from "@/lib/compile";

// Vercel Hobby caps functions at 60s; first compiles are slower (cold cache).
export const maxDuration = 60;

// GET /api/resumes/:id/text -> {text} — what a parser/ATS sees in the PDF.
// Compiles the SAVED source (save first for fresh results).
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const { id } = await params;
  const resume = await db.resume.findFirst({ where: { id, userId } });
  if (!resume) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const text = await extractPdfText(await compileLatex(resume.latexSource));
    return NextResponse.json({ text });
  } catch (e) {
    // Never a bare "could not extract text": CompileError carries the TeX log,
    // anything else carries its own message.
    const log =
      e instanceof CompileError
        ? e.log
        : `extraction failed: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`;
    return NextResponse.json({ error: "compile failed", log }, { status: 422 });
  }
}
