import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const item = await db.suggestion.create({
      data: {
        type,
        message,
        contact,
      },
    });

    console.log("[SUGGESTION_RECEIVED]", item);
    return NextResponse.json({ ok: true, id: item.id });
  } catch (e) {
    console.error("Failed to save suggestion:", e);
    return NextResponse.json({ ok: false, error: "Failed to save suggestion" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const suggestions = await db.suggestion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, suggestions });
  } catch (e) {
    console.error("Failed to fetch suggestions:", e);
    return NextResponse.json({ ok: false, error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
