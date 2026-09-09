import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { parseContent, renderLatex } from "@/lib/resume";

const unauthorized = () => NextResponse.json({ error: "sign in required" }, { status: 401 });
const missing = () => NextResponse.json({ error: "not found" }, { status: 404 });

// All mutations scoped to the owner's rows: touching another user's id 404s.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const r = await db.resume.findFirst({ where: { id, userId } });
  if (!r) return missing();
  return NextResponse.json(r);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    roleTag?: string;
    content?: unknown;
    latexSource?: string;
    useGenerated?: boolean;
  };
  const prev = await db.resume.findFirst({ where: { id, userId } });
  if (!prev) return missing();

  const data: {
    title?: string;
    roleTag?: string;
    content?: object;
    latexSource?: string;
    customLatex?: boolean;
  } = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.roleTag !== undefined) data.roleTag = body.roleTag;
  if (body.content !== undefined) {
    const content = parseContent(body.content);
    data.content = JSON.parse(JSON.stringify(content)) as object;
    data.latexSource = renderLatex(content);
    data.customLatex = false;
  } else if (body.latexSource !== undefined) {
    data.latexSource = body.latexSource;
    data.customLatex = true;
  } else if (body.useGenerated && prev.content != null) {
    data.latexSource = renderLatex(parseContent(prev.content));
    data.customLatex = false;
  }
  const r = await db.resume.update({ where: { id }, data });
  return NextResponse.json(r);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const prev = await db.resume.findFirst({ where: { id, userId } });
  if (!prev) return missing();
  await db.resume.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
