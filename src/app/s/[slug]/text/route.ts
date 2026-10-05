import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getShareText, snapshotAsShareResume } from "@/lib/share";

export const dynamic = "force-dynamic";

// Plain-text view of a frozen sent copy, for ATS ingestion. Reads the
// snapshot's stored content, so it also never drifts from what was sent.
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snap = await db.snapshot.findUnique({ where: { slug } });
  if (!snap) return NextResponse.json({ error: "not found" }, { status: 404 });
  const text = await getShareText(snapshotAsShareResume(snap));
  if (text == null) return NextResponse.json({ error: "unavailable" }, { status: 422 });
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `inline; filename="${snap.slug}.txt"`,
    },
  });
}
