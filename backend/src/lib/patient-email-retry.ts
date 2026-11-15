// backend/src/lib/patient-email-retry.ts
// Which failed appointment emails are tried again (D1). No imports, so it is easy to test.
//
// The history row written for each email is the outbox: a "failed" row is an email still owed,
// and each further failure adds a row, so the number of failed rows is the number of attempts.
// A "sent" or "skipped" row settles the email.

export const EMAIL_RETRY_MAX_ATTEMPTS = 4; // the first try plus three retries
export const EMAIL_RETRY_WINDOW_MS = 6 * 60 * 60 * 1000; // an email older than this is not worth sending
/** Wait after the Nth failed attempt before trying again: 2, 10, then 30 minutes. */
export const EMAIL_RETRY_BACKOFF_MS = [2 * 60 * 1000, 10 * 60 * 1000, 30 * 60 * 1000];

export interface EmailHistoryRow {
  userId: string;
  status: string;
  sentAt: Date;
  data: unknown;
}

export interface EmailToRetry {
  userId: string;
  appointmentId: string;
  kind: "booked" | "cancelled" | "rescheduled";
  refundPence?: number;
}

const KINDS = ["booked", "cancelled", "rescheduled"] as const;

function read(data: unknown): { appointmentId: string; kind: EmailToRetry["kind"]; refundPence?: number } | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const type = typeof d.type === "string" ? d.type : "";
  if (!type.startsWith("appointment_") || typeof d.appointmentId !== "string") return null;
  const kind = type.slice("appointment_".length) as EmailToRetry["kind"];
  if (!KINDS.includes(kind)) return null;
  return {
    appointmentId: d.appointmentId,
    kind,
    refundPence: typeof d.refundPence === "number" ? d.refundPence : undefined,
  };
}

export function pickEmailsToRetry(rows: EmailHistoryRow[], now: Date): EmailToRetry[] {
  const byEmail = new Map<string, { userId: string; info: NonNullable<ReturnType<typeof read>>; failed: Date[]; settled: boolean }>();

  for (const row of rows) {
    const info = read(row.data);
    if (!info) continue;
    const key = `${info.appointmentId}:${info.kind}`;
    const entry = byEmail.get(key) ?? { userId: row.userId, info, failed: [], settled: false };
    if (row.status === "failed") {
      entry.failed.push(row.sentAt);
      // Keep the refund from the first failed row that carries it.
      if (entry.info.refundPence === undefined && info.refundPence !== undefined) entry.info = info;
    } else if (row.status === "sent" || row.status === "skipped") {
      entry.settled = true;
    }
    byEmail.set(key, entry);
  }

  const due: EmailToRetry[] = [];
  for (const entry of byEmail.values()) {
    if (entry.settled || entry.failed.length === 0) continue;
    if (entry.failed.length >= EMAIL_RETRY_MAX_ATTEMPTS) continue;
    const first = Math.min(...entry.failed.map((d) => d.getTime()));
    const last = Math.max(...entry.failed.map((d) => d.getTime()));
    if (now.getTime() - first > EMAIL_RETRY_WINDOW_MS) continue;
    const wait = EMAIL_RETRY_BACKOFF_MS[Math.min(entry.failed.length, EMAIL_RETRY_BACKOFF_MS.length) - 1];
    if (now.getTime() - last < wait) continue;
    due.push({
      userId: entry.userId,
      appointmentId: entry.info.appointmentId,
      kind: entry.info.kind,
      refundPence: entry.info.refundPence,
    });
  }
  return due;
}
