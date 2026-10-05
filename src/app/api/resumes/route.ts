import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { JAKES_TEMPLATE } from "@/lib/template";
import { defaultContent, parseContent, renderLatex } from "@/lib/resume";
import { newSlug } from "@/lib/share";

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

// POST /api/resumes {title?, roleTag?, latexSource?, content?, forkFrom?, roleVersion?}
// `roleVersion` names the new copy after its parent ("Backend Engineer — Stripe
// SWE") so a fork reads as a version of something rather than a nameless clone.
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    roleTag?: string;
    latexSource?: string;
    content?: unknown;
    forkFrom?: string;
    roleVersion?: string;
  };
  let latexSource = body.latexSource;
  let content = body.content !== undefined ? parseContent(body.content) : defaultContent();
  let customLatex = false;
  let title = body.title?.trim() || "Untitled resume";
  let roleTag = body.roleTag?.trim() || "";
  if (body.forkFrom) {
    const src = await db.resume.findFirst({ where: { id: body.forkFrom, userId } });
    if (src) {
      latexSource = src.latexSource;
      content = parseContent(src.content);
      customLatex = src.customLatex || src.content == null;
      const label = body.roleVersion?.trim();
      if (label) {
        const parent = src.title?.trim() || "Untitled resume";
        title = `${parent} — ${label}`;
      }
      // A role version is an application to a specific role, so carry the
      // parent's tags over unless the caller set its own.
      if (!roleTag) roleTag = src.roleTag;
    }
  }
  if (!latexSource) latexSource = customLatex ? JAKES_TEMPLATE : renderLatex(content);
  // ponytail: round-trip through JSON so Prisma's Json field types accept it
  const contentJson = JSON.parse(JSON.stringify(content)) as object;
  const r = await db.resume.create({
    data: {
      slug: newSlug(),
      title,
      roleTag,
      latexSource,
      content: customLatex ? undefined : contentJson,
      customLatex,
      // Private until the owner publishes. A fresh resume has no public URL.
      isPublic: false,
      userId,
    },
  });
  return NextResponse.json(r, { status: 201 });
}
