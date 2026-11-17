// Emails the practice when someone sends the website's contact, booking or
// job form, so a request is not left unread in the dashboard. The live site's
// forms email the practice; this keeps that working once the website moves
// here (decisions log, 18 Nov 2026).
//
// The email says which form came in, who sent it and how to reach them, and
// links to the dashboard. What they wrote stays in the dashboard: messages and
// booking requests can describe symptoms, and emails sent through Postmark
// carry administrative details only (docs/compliance/dpa-tracker.md).

export type EnquiryKind = "contact" | "booking" | "vacancy";

export interface EnquiryAlert {
  kind: EnquiryKind;
  name: string;
  email: string;
  phone?: string | null;
  /** Job applications only: the role applied for. */
  position?: string | null;
}

export interface AlertConfig {
  token: string;
  from: string;
  to: string;
  dashboardUrl: string | null;
}

type Env = Record<string, string | undefined>;

const KINDS: Record<EnquiryKind, { subject: string; what: string; page: string; pageName: string }> = {
  contact: {
    subject: "New website enquiry",
    what: "A contact form enquiry",
    page: "/dashboard/submissions",
    pageName: "Submissions",
  },
  booking: {
    subject: "New booking request from the website",
    what: "A booking request",
    page: "/dashboard/bookings",
    pageName: "Bookings",
  },
  vacancy: {
    subject: "New job application from the website",
    what: "A job application",
    page: "/dashboard/submissions",
    pageName: "Submissions",
  },
};

/** The settings to send with, or null when email is not set up (local development, CI, a placeholder token). */
export function enquiryAlertConfig(env: Env = process.env): AlertConfig | null {
  const token = env.POSTMARK_SERVER_TOKEN?.trim() ?? "";
  const to = env.CLINIC_NOTIFICATION_EMAIL?.trim() ?? "";
  if (!token || !to || /replace_me|^mock/i.test(token)) return null;
  return {
    token,
    to,
    from: env.FROM_EMAIL?.trim() || "noreply@pavdental.com",
    dashboardUrl: env.DASHBOARD_URL?.trim().replace(/\/+$/, "") || null,
  };
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);

/** The email for one alert, as a subject, plain text and HTML. */
export function enquiryAlertEmail(alert: EnquiryAlert, dashboardUrl: string | null, now: Date) {
  const kind = KINDS[alert.kind];
  const when = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(now);
  const details: Array<[string, string]> = [
    ["Name", alert.name],
    ["Email", alert.email],
  ];
  if (alert.phone) details.push(["Phone", alert.phone]);
  if (alert.position) details.push(["Role", alert.position]);
  const link = dashboardUrl ? `${dashboardUrl}${kind.page}` : null;
  const intro = `${kind.what} came in through the website on ${when}.`;
  const note = "What they wrote stays in the dashboard, so health details never travel by email.";

  const text = [
    intro,
    "",
    ...details.map(([label, value]) => `${label}: ${value}`),
    "",
    link ? `Read it in the dashboard: ${link}` : `Read it on the dashboard's ${kind.pageName} page.`,
    "",
    note,
  ].join("\n");

  const html = [
    `<p>${escapeHtml(intro)}</p>`,
    `<p>${details.map(([label, value]) => `${label}: ${escapeHtml(value)}`).join("<br>")}</p>`,
    link
      ? `<p><a href="${escapeHtml(link)}">Read it in the dashboard</a></p>`
      : `<p>Read it on the dashboard's ${kind.pageName} page.</p>`,
    `<p>${escapeHtml(note)}</p>`,
  ].join("\n");

  return { subject: kind.subject, text, html };
}

interface SendOptions {
  env?: Env;
  fetchImpl?: typeof fetch;
  now?: Date;
}

/**
 * Sends the alert and says what happened. Never throws: the form has already
 * been saved, so a failed email must not fail it. Logs carry no names or
 * addresses.
 */
export async function sendEnquiryAlert(
  alert: EnquiryAlert,
  { env = process.env, fetchImpl = fetch, now = new Date() }: SendOptions = {},
): Promise<"sent" | "skipped" | "failed"> {
  const config = enquiryAlertConfig(env);
  if (!config) return "skipped";
  const email = enquiryAlertEmail(alert, config.dashboardUrl, now);
  try {
    const response = await fetchImpl("https://api.postmarkapp.com/email", {
      method: "POST",
      signal: AbortSignal.timeout(5000),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": config.token,
      },
      body: JSON.stringify({
        From: config.from,
        To: config.to,
        Subject: email.subject,
        TextBody: email.text,
        HtmlBody: email.html,
        MessageStream: "outbound",
      }),
    });
    if (response.ok) return "sent";
    const data = (await response.json().catch(() => ({}))) as { ErrorCode?: number };
    console.error("[enquiry-alert] Postmark refused the email", { status: response.status, errorCode: data.ErrorCode });
    return "failed";
  } catch (error) {
    console.error("[enquiry-alert] email not sent", { reason: error instanceof Error ? error.name : "unknown" });
    return "failed";
  }
}
