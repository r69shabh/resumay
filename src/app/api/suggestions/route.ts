import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["feature", "template", "bug", "other"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 5000) {
      return NextResponse.json(
        { ok: false, error: "Message must be between 1 and 5000 characters" },
        { status: 400 }
      );
    }

    const type = typeof body.type === "string" && ALLOWED_TYPES.has(body.type) ? body.type : "other";
    const contact =
      typeof body.contact === "string" ? body.contact.trim().slice(0, 250) : "";

    console.log("[SUGGESTION_RECEIVED]", {
      type,
      message,
      contact,
      time: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }
}
