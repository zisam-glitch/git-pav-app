import { NextResponse } from "next/server";

import { query } from "@/lib/db/client";
import { rateLimit } from "@/lib/rate-limit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface PetitionBody {
  name: string;
  email: string;
  message?: string;
}

export async function POST(request: Request) {
  const limited = await rateLimit(request, "publicForm");
  if (limited) return limited;

  try {
    const body = (await request.json()) as Partial<PetitionBody>;

    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400, headers: CORS_HEADERS });
    }

    const [row] = await query<{ id: string }>(
      `INSERT INTO form_submissions (form_type, data)
       VALUES ('petition', $1)
       RETURNING id`,
      [
        JSON.stringify({
          name: body.name.trim(),
          email: body.email.trim(),
          message: body.message?.trim() ?? null,
        }),
      ],
    );

    return NextResponse.json({ success: true, id: row.id }, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/forms/petition]", error);
    return NextResponse.json({ error: "Failed to submit petition" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
