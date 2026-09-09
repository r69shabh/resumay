import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { CompileError, compileLatex } from "@/lib/compile";

// POST /api/compile {source: string} -> application/pdf | 422 {error, log}
// Auth required: each compile burns real CPU.
export const maxDuration = 60;

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { source?: unknown } | null;
  const source = body?.source;
  if (typeof source !== "string" || source.length === 0 || source.length > 200_000) {
    return NextResponse.json({ error: "bad source" }, { status: 400 });
  }
  try {
    const pdf = await compileLatex(source);
    return new NextResponse(new Uint8Array(pdf), {
      headers: { "Content-Type": "application/pdf" },
    });
  } catch (e) {
    const log = e instanceof CompileError ? e.log : "compilation failed";
    return NextResponse.json({ error: "compile failed", log }, { status: 422 });
  }
}
