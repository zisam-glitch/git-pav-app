import { NextResponse } from "next/server";

import { query } from "@/lib/db/client";
import { sendEnquiryAlert } from "@/lib/enquiry-alert";
import { rateLimit } from "@/lib/rate-limit";
import { validateRegistration } from "@/lib/registration-submission";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// New patient registration from the website. It holds health information, so:
// the answers are stored in the dashboard database only, the alert email names
// the patient and how to reach them but carries no answers, and nothing from
// the body is ever logged (errors log the error's name, not its message).
export async function POST(request: Request) {
  const limited = await rateLimit(request, "publicForm");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The registration was not understood." }, { status: 400, headers: CORS_HEADERS });
  }

  const checked = validateRegistration(body);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: 400, headers: CORS_HEADERS });
  }
  const registration = checked.value;

  try {
    const [row] = await query<{ id: string }>(
      `INSERT INTO form_submissions (form_type, data)
       VALUES ('registration', $1)
       RETURNING id`,
      [
        JSON.stringify({
          name: registration.fullName,
          email: registration.email,
          phone: registration.mobilePhone,
          date_of_birth: registration.dateOfBirth,
          summary: "New patient registration",
          consent: { given: true, version: registration.consentVersion, at: new Date().toISOString() },
          sections: registration.sections,
        }),
      ],
    );

    await sendEnquiryAlert({
      kind: "registration",
      name: registration.fullName,
      email: registration.email,
      phone: registration.mobilePhone,
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/forms/registration]", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Failed to submit the registration" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
