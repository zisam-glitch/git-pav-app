import { NextResponse } from "next/server";

import { query } from "@/lib/db/client";
import { rateLimit } from "@/lib/rate-limit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function POST(request: Request) {
  const limited = await rateLimit(request, "publicForm");
  if (limited) return limited;

  try {
    const body = (await request.json()) as Partial<ContactBody>;

    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: "name, email, and message are required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const [row] = await query<{ id: string }>(
      `INSERT INTO form_submissions (form_type, data)
       VALUES ('contact', $1)
       RETURNING id`,
      [
        JSON.stringify({
          name: body.name.trim(),
          email: body.email.trim(),
          phone: body.phone?.trim() ?? null,
          subject: body.subject?.trim() ?? null,
          message: body.message.trim(),
        }),
      ],
    );

    return NextResponse.json({ success: true, id: row.id }, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/forms/contact]", error);
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
