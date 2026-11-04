import { NextResponse } from "next/server";

import { query } from "@/lib/db/client";
import { rateLimit } from "@/lib/rate-limit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface BookingBody {
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  service_type: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
}

export async function POST(request: Request) {
  const limited = await rateLimit(request, "publicForm");
  if (limited) return limited;

  try {
    const body = (await request.json()) as Partial<BookingBody>;

    const { patient_name, patient_email, service_type } = body;

    if (!patient_name?.trim() || !patient_email?.trim() || !service_type?.trim()) {
      return NextResponse.json(
        { error: "patient_name, patient_email, and service_type are required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const [row] = await query<{ id: string }>(
      `INSERT INTO bookings
        (patient_name, patient_email, patient_phone, service_type, preferred_date, preferred_time, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        patient_name.trim(),
        patient_email.trim(),
        body.patient_phone?.trim() ?? null,
        service_type.trim(),
        body.preferred_date ?? null,
        body.preferred_time ?? null,
        body.message ?? null,
      ],
    );

    return NextResponse.json({ success: true, id: row.id }, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/bookings]", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
