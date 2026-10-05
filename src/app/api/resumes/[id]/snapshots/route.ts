import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { newSlug } from "@/lib/share";

// Snapshots are frozen sent-copies: an immutable capture of the resume as it
// stood when the owner marked it as sent, plus the company/role/date it went to.
// Editing the parent resume never touches them, so a link already handed to a
// recruiter keeps showing exactly what was sent.

const unauthorized = () => NextResponse.json({ error: "sign in required" }, { status: 401 });
const missing = () => NextResponse.json({ error: "not found" }, { status: 404 });

// GET — every sent copy for one resume, newest first.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const owner = await db.resume.findFirst({ where: { id, userId } });
  if (!owner) return missing();
  const snapshots = await db.snapshot.findMany({
    where: { resumeId: id, userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      company: true,
      role: true,
      createdAt: true,
    },
  });
  return NextResponse.json(snapshots);
}

// POST — freeze the resume's current saved state as a sent copy.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { company?: string; role?: string };
  const src = await db.resume.findFirst({ where: { id, userId } });
  if (!src) return missing();

  const s = await db.snapshot.create({
    data: {
      slug: newSlug(),
      resumeId: id,
      userId,
      title: src.title,
      company: body.company?.trim() || "",
      role: body.role?.trim() || "",
      latexSource: src.latexSource,
      content: src.content ?? undefined,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      company: true,
      role: true,
      createdAt: true,
    },
  });
  return NextResponse.json(s, { status: 201 });
}

// DELETE — revoke a sent copy. Its public link stops resolving immediately.
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const snap = await db.snapshot.findFirst({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!snap || snap.userId !== userId) return missing();
  await db.snapshot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
