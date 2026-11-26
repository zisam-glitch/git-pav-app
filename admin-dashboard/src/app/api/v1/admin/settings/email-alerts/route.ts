import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { describeAlertTarget, parseRecipients } from "@/lib/email-alert-settings";
import { loadEmailAlertSettings, saveEmailAlertSettings } from "@/lib/email-alert-settings.server";
import { enquiryAlertConfig } from "@/lib/enquiry-alert";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** The settings as the page shows them: what is saved, where alerts go now, and whether the server can send mail. */
async function currentSettings() {
  const saved = await loadEmailAlertSettings();
  const environmentRecipient = process.env.CLINIC_NOTIFICATION_EMAIL?.trim() || null;
  const target = describeAlertTarget(saved, environmentRecipient);
  return {
    enabled: saved?.enabled ?? true,
    recipients: saved?.recipients ?? [],
    environmentRecipient,
    // True when the server has a Postmark token; the recipients can still come from the page.
    mailConfigured: enquiryAlertConfig(process.env, { recipients: ["check@example.test"] }) !== null,
    effective: target,
  };
}

export async function GET(request: Request) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    return NextResponse.json(await currentSettings(), { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[GET /api/v1/admin/settings/email-alerts]", error);
    return NextResponse.json({ error: "Failed to load the email alert settings" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PUT(request: Request) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const body = (await request.json().catch(() => null)) as { enabled?: unknown; recipients?: unknown } | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "The settings were not understood." }, { status: 400, headers: CORS_HEADERS });
    }
    const parsed = parseRecipients(body.recipients ?? []);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400, headers: CORS_HEADERS });
    }
    const enabled = body.enabled !== false;
    const environmentRecipient = process.env.CLINIC_NOTIFICATION_EMAIL?.trim();
    if (enabled && parsed.recipients.length === 0 && !environmentRecipient) {
      return NextResponse.json(
        { error: "Add at least one email address, or switch the alerts off." },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    await saveEmailAlertSettings({ enabled, recipients: parsed.recipients });
    return NextResponse.json(await currentSettings(), { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[PUT /api/v1/admin/settings/email-alerts]", error);
    return NextResponse.json({ error: "Failed to save the email alert settings" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
