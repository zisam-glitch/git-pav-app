import { NextResponse } from "next/server";

import { query } from "@/lib/db/client";
import { rateLimit } from "@/lib/rate-limit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SubscribeBody {
  email: string;
  name?: string;
}

export async function POST(request: Request) {
  const limited = await rateLimit(request, "publicForm");
  if (limited) return limited;

  try {
    const body = (await request.json()) as Partial<SubscribeBody>;

    if (!body.email?.trim()) {
      return NextResponse.json({ error: "email is required" }, { status: 400, headers: CORS_HEADERS });
    }

    // Upsert — if already subscribed, re-activate and return success
    await query(
      `INSERT INTO newsletter_subscribers (email, name, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (email)
       DO UPDATE SET is_active = true, name = EXCLUDED.name`,
      [body.email.trim().toLowerCase(), body.name?.trim() ?? null],
    );

    return NextResponse.json({ success: true }, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/newsletter/subscribe]", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
