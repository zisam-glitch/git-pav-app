import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { parseRecipients } from "@/lib/email-alert-settings";
import { loadEmailAlertSettings } from "@/lib/email-alert-settings.server";
import { sendTestAlert } from "@/lib/enquiry-alert";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** Sends a test email to the addresses on the page (or the saved ones), so staff know the setting works. */
export async function POST(request: Request) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const body = (await request.json().catch(() => ({}))) as { recipients?: unknown };
    let recipients: string[] = [];
    if (body.recipients !== undefined) {
      const parsed = parseRecipients(body.recipients);
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400, headers: CORS_HEADERS });
      recipients = parsed.recipients;
    }
    if (recipients.length === 0) recipients = (await loadEmailAlertSettings())?.recipients ?? [];
    if (recipients.length === 0 && process.env.CLINIC_NOTIFICATION_EMAIL?.trim()) {
      recipients = [process.env.CLINIC_NOTIFICATION_EMAIL.trim()];
    }
    if (recipients.length === 0) {
      return NextResponse.json({ error: "Add an email address first." }, { status: 400, headers: CORS_HEADERS });
    }

    const result = await sendTestAlert(recipients);
    if (result === "skipped") {
      return NextResponse.json(
        { error: "This server cannot send email yet: its Postmark token is not set." },
        { status: 409, headers: CORS_HEADERS },
      );
    }
    if (result === "failed") {
      return NextResponse.json(
        { error: "The email service refused the message. Check the sender address and token." },
        { status: 502, headers: CORS_HEADERS },
      );
    }
    return NextResponse.json({ success: true, sentTo: recipients }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/admin/settings/email-alerts/test]", error);
    return NextResponse.json({ error: "Failed to send the test email" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
