import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { compileLatex, getCachedPdf } from "@/lib/compile";
import { parseContent, renderLatex } from "@/lib/resume";

export const maxDuration = 60;

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const resume = await db.resume.findFirst({ where: { id, userId } });
  if (!resume) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    let pdfB64 = await getCachedPdf(resume.slug, resume.updatedAt, resume.latexSource);
    // Self-heal: rows saved before the empty-list fix carry a stored source
    // that no longer compiles. Regenerated sources are byte-identical to what
    // a save would write, so persist the healed source for next time.
    if (!pdfB64 && !resume.customLatex && resume.content != null) {
      try {
        const healed = renderLatex(parseContent(resume.content));
        const pdf = await compileLatex(healed);
        pdfB64 = pdf.toString("base64");
        await db.resume
          .update({ where: { id }, data: { latexSource: healed } })
          .catch(() => {});
      } catch {
        // fall through to the 500 below
      }
    }
    if (!pdfB64) {
      return NextResponse.json({ error: "Compilation failed" }, { status: 500 });
    }
    const buffer = Buffer.from(pdfB64, "base64");
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "compile failed", message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
