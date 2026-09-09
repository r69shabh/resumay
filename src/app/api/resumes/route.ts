import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { JAKES_TEMPLATE } from "@/lib/template";
import { defaultContent, parseContent, renderLatex } from "@/lib/resume";

const slug = () =>
  Math.random().toString(36).slice(2, 10).padEnd(8, "x");

const unauthorized = () => NextResponse.json({ error: "sign in required" }, { status: 401 });

// All resume data is per-user. Public sharing stays on /r/[slug] (direct DB, no auth).
export async function GET(req: Request) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const { searchParams } = new URL(req.url);
  const s = searchParams.get("slug");
  if (s) {
    const r = await db.resume.findFirst({ where: { slug: s, userId } });
    if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(r);
  }
  const resumes = await db.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(resumes);
}

// POST /api/resumes {title?, roleTag?, latexSource?, content?, forkFrom?}
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    roleTag?: string;
    latexSource?: string;
    content?: unknown;
    forkFrom?: string;
  };
  let latexSource = body.latexSource;
  let content = body.content !== undefined ? parseContent(body.content) : defaultContent();
  let customLatex = false;
  if (body.forkFrom) {
    const src = await db.resume.findFirst({ where: { id: body.forkFrom, userId } });
    if (src) {
      latexSource = src.latexSource;
      content = parseContent(src.content);
      customLatex = src.customLatex || src.content == null;
    }
  }
  if (!latexSource) latexSource = customLatex ? JAKES_TEMPLATE : renderLatex(content);
  // ponytail: round-trip through JSON so Prisma's Json field types accept it
  const contentJson = JSON.parse(JSON.stringify(content)) as object;
  const r = await db.resume.create({
    data: {
      slug: slug(),
      title: body.title?.trim() || "Untitled resume",
      roleTag: body.roleTag?.trim() || "",
      latexSource,
      content: customLatex ? undefined : contentJson,
      customLatex,
      userId,
    },
  });
  return NextResponse.json(r, { status: 201 });
}
