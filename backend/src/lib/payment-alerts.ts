import { env } from "../config/env";
import { communicationService } from "./communication-service";

// A card dispute (chargeback) has a deadline: if nobody sends Stripe evidence
// in time, the practice loses the dispute and the money automatically. So when
// one opens, or closes, staff are emailed at OPS_ALERT_EMAIL straight away.
//
// The email carries ids, the amount, the reason and the deadline only: no
// patient name, email, appointment time or treatment (health data stays out of
// email and logs). Staff open the dispute in Stripe, where the details are.

export type DisputeAlertKind = "opened" | "closed";

export interface DisputeAlert {
  kind: DisputeAlertKind;
  disputeId: string;
  paymentIntentId: string | null;
  amountPence: number;
  currency: string;
  reason: string;
  status: string;
  /** Unix seconds: the last moment evidence can be submitted (opened disputes). */
  evidenceDueBy: number | null;
  appointmentId: string | null;
  vanRequestId: string | null;
  livemode: boolean;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function disputeDashboardUrl(disputeId: string, livemode: boolean): string {
  return `https://dashboard.stripe.com/${livemode ? "" : "test/"}disputes/${encodeURIComponent(disputeId)}`;
}

function money(pence: number, currency: string | null | undefined): string {
  const code = (currency || "gbp").toUpperCase();
  const amount = ((pence || 0) / 100).toFixed(2);
  return code === "GBP" ? `£${amount}` : `${amount} ${code}`;
}

function deadline(evidenceDueBy: number | null): string | null {
  if (!evidenceDueBy) return null;
  return new Date(evidenceDueBy * 1000).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "full",
    timeStyle: "short",
  });
}

export function buildDisputeAlert(input: DisputeAlert): { subject: string; html: string; text: string } {
  // A staff alert must never fail because Stripe left a field out.
  const alert = { ...input, reason: input.reason || "unknown", status: input.status || "unknown" };
  const amount = money(alert.amountPence, alert.currency);
  const due = deadline(alert.evidenceDueBy);
  const url = disputeDashboardUrl(alert.disputeId, alert.livemode);
  const mode = alert.livemode ? "" : " [TEST MODE]";

  const subject =
    alert.kind === "opened"
      ? `[ACTION NEEDED] Card dispute opened: ${amount}${due ? `, evidence due ${due}` : ""}${mode}`
      : `Card dispute ${alert.status === "won" ? "won" : alert.status === "lost" ? "lost" : "closed"}: ${amount}${mode}`;

  const lines: Array<[string, string]> = [
    ["Dispute", alert.disputeId],
    ["Amount", amount],
    ["Reason", alert.reason.replace(/_/g, " ")],
    ["Status", alert.status.replace(/_/g, " ")],
  ];
  if (due) lines.push(["Evidence due by", due]);
  if (alert.appointmentId) lines.push(["Appointment", alert.appointmentId]);
  if (alert.vanRequestId) lines.push(["Van request", alert.vanRequestId]);
  if (alert.paymentIntentId) lines.push(["Payment", alert.paymentIntentId]);

  const intro =
    alert.kind === "opened"
      ? "A patient's bank has disputed a payment. Submit evidence in Stripe before the deadline, or the practice loses the dispute and the money."
      : alert.status === "won"
        ? "The dispute was decided in the practice's favour and the funds are returned."
        : alert.status === "lost"
          ? "The dispute was lost: the amount has been taken back by Stripe."
          : "The dispute has closed.";

  const rows = lines
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#64748B;">${escapeHtml(k)}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`)
    .join("");
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: ${alert.kind === "opened" ? "#B91C1C" : "#0D9488"};">${escapeHtml(subject)}</h2>
      <p>${escapeHtml(intro)}</p>
      <table>${rows}</table>
      <p style="margin: 24px 0;"><a href="${escapeHtml(url)}" style="background-color:#0D9488;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Open the dispute in Stripe</a></p>
      <p style="color:#64748B;font-size:12px;">This message has no patient details on purpose. Open the dispute in Stripe, or the appointment in the dashboard, to see them.</p>
    </div>`;
  const text = `${subject}\n\n${intro}\n\n${lines.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nOpen the dispute in Stripe: ${url}`;

  return { subject, html, text };
}

/**
 * Emails staff about a dispute. Returns false when the email could not be sent,
 * so the webhook can fail and let Stripe retry: a dispute nobody hears about is
 * a dispute lost by default.
 */
export async function alertStaffOfDispute(alert: DisputeAlert): Promise<boolean> {
  const { subject, html, text } = buildDisputeAlert(alert);
  try {
    const result = await communicationService.sendEmail({ to: env.opsAlertEmail, subject, html, text });
    if (!result.success) console.error("[Dispute alert] Email to staff was not sent for", alert.disputeId);
    return result.success;
  } catch {
    console.error("[Dispute alert] Email to staff failed for", alert.disputeId);
    return false;
  }
}
