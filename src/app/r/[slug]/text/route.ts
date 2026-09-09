import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getShareText } from "@/lib/share";

export const dynamic = "force-dynamic";

// Public plain-text resume: what an ATS/parser gets from the share link.
// Rendered from structured data (no compile); legacy rows extract from PDF.
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resume = await db.resume.findUnique({ where: { slug } });
  if (!resume) return NextResponse.json({ error: "not found" }, { status: 404 });
  const text = await getShareText(resume);
  if (text == null) return NextResponse.json({ error: "unavailable" }, { status: 422 });
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `inline; filename="${resume.slug}.txt"`,
    },
  });
}
