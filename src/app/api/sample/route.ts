import { NextResponse } from "next/server";
import { renderLatex } from "@/lib/resume";
import { compileLatex } from "@/lib/compile";
import { RESUME_TEMPLATES } from "@/lib/templates-data";

// GET /api/sample.pdf[?template=swe] -> the sample resume as a real PDF.
// Public and unauthenticated on purpose: it is the artifact we want visitors to
// judge before they sign up, and it renders our own seed data, so it leaks
// nothing about a user. Cached in-process because the input never changes.
let cache: { key: string; b64: string } | null = null;

export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("template") || "swe";
  const tmpl = RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];
  const key = tmpl.id;

  if (cache?.key === key) {
    return pdfResponse(Buffer.from(cache.b64, "base64"));
  }

  try {
    const pdf = await compileLatex(renderLatex(tmpl.content));
    cache = { key, b64: pdf.toString("base64") };
    return pdfResponse(pdf);
  } catch {
    return NextResponse.json({ error: "sample unavailable" }, { status: 422 });
  }
}

function pdfResponse(pdf: Buffer) {
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // The sample is one fixed document; let it be cached hard.
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
