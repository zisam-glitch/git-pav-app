// backend/src/lib/patient-email-content.ts
// What the appointment emails say. No imports, so it is easy to test. The email
// names the date, time and place only, never the treatment (CS-54).

export type AppointmentEmailKind = "booked" | "cancelled" | "rescheduled";

export interface AppointmentEmailDetails {
  kind: AppointmentEmailKind;
  startTimeUtc: Date;
  channel: string;
  placeLine: string | null;
  /** Pence refunded, for a cancellation. */
  refundPence?: number;
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function whenLine(start: Date): string {
  const date = start.toLocaleDateString("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = start.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time} (UK time)`;
}

/** The subject and body of the email, as plain text and HTML. Pure, so it can be tested. */
export function buildAppointmentEmail(d: AppointmentEmailDetails): { subject: string; text: string; html: string } {
  const when = whenLine(d.startTimeUtc);
  const where =
    d.channel === "video"
      ? "This is a video consultation. You will join it from the Pav Dental app."
      : d.channel === "van"
      ? "Our dental van will come to the address you gave us."
      : d.placeLine
      ? `Where: ${d.placeLine}`
      : null;

  let subject: string;
  const lines: string[] = [];
  if (d.kind === "booked") {
    subject = "Your Pav Dental appointment is confirmed";
    lines.push(`Your appointment is confirmed for ${when}.`);
    if (where) lines.push(where);
    lines.push("You can see, move or cancel it in the app. Cancelling 48 hours or more ahead refunds your deposit in full.");
  } else if (d.kind === "rescheduled") {
    subject = "Your Pav Dental appointment has moved";
    lines.push(`Your appointment is now on ${when}.`);
    if (where) lines.push(where);
  } else {
    subject = "Your Pav Dental appointment is cancelled";
    lines.push(`Your appointment on ${when} has been cancelled.`);
    lines.push(
      d.refundPence && d.refundPence > 0
        ? `£${(d.refundPence / 100).toFixed(2)} is being refunded to your card. Banks usually take 5 to 10 working days to show it.`
        : "No deposit is being refunded for this cancellation, in line with our cancellation terms."
    );
  }
  lines.push("If you did not expect this email, please call the practice.");

  const text = ["Pav Dental", "", ...lines].join("\n");
  const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h2 style="color: #0D9488;">Pav Dental</h2>
${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("\n")}
</div>`;
  return { subject, text, html };
}


/**
 * The push for a booking change. Names the date and time, never the treatment
 * (lock-screen privacy, CS-54). A video consultation says so, because it has
 * no clinic to go to.
 */
export function buildAppointmentPush(d: {
  kind: AppointmentEmailKind;
  startTimeUtc: Date;
  channel: string;
}): { title: string; body: string } {
  const when = whenLine(d.startTimeUtc);
  const noun = d.channel === "video" ? "video consultation" : "appointment";
  if (d.kind === "booked") {
    return { title: "Booking confirmed", body: `Your ${noun} is confirmed for ${when}.` };
  }
  if (d.kind === "rescheduled") {
    return { title: "Booking moved", body: `Your ${noun} is now on ${when}.` };
  }
  return { title: "Booking cancelled", body: `Your ${noun} on ${when} has been cancelled.` };
}
