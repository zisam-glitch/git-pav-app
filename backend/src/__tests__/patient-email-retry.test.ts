import { appointmentEmailRecord } from "../lib/patient-email";
import { EMAIL_RETRY_WINDOW_MS, pickEmailsToRetry, type EmailHistoryRow } from "../lib/patient-email-retry";

const now = new Date("2026-11-15T12:00:00Z");
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);
const row = (status: string, at: Date, extra: Record<string, unknown> = {}, kind = "booked", appointmentId = "a1"): EmailHistoryRow => ({
  userId: "u1",
  status,
  sentAt: at,
  data: { type: `appointment_${kind}`, appointmentId, ...extra },
});

describe("Which failed appointment emails are tried again (D1)", () => {
  it("retries an email that failed and waited long enough", () => {
    expect(pickEmailsToRetry([row("failed", minutesAgo(3))], now)).toEqual([
      { userId: "u1", appointmentId: "a1", kind: "booked", refundPence: undefined },
    ]);
  });

  it("leaves a fresh failure alone until the wait is over", () => {
    expect(pickEmailsToRetry([row("failed", minutesAgo(1))], now)).toEqual([]);
  });

  it("waits longer after each failure: 2, then 10, then 30 minutes", () => {
    const twice = [row("failed", minutesAgo(30)), row("failed", minutesAgo(5))];
    expect(pickEmailsToRetry(twice, now)).toEqual([]);
    const twiceLater = [row("failed", minutesAgo(40)), row("failed", minutesAgo(11))];
    expect(pickEmailsToRetry(twiceLater, now)).toHaveLength(1);
    const thrice = [row("failed", minutesAgo(90)), row("failed", minutesAgo(60)), row("failed", minutesAgo(29))];
    expect(pickEmailsToRetry(thrice, now)).toEqual([]);
  });

  it("stops after four attempts", () => {
    const four = [90, 80, 60, 40].map((m) => row("failed", minutesAgo(m)));
    expect(pickEmailsToRetry(four, now)).toEqual([]);
  });

  it("does not retry once the email was sent or skipped", () => {
    expect(pickEmailsToRetry([row("failed", minutesAgo(10)), row("sent", minutesAgo(5))], now)).toEqual([]);
    expect(pickEmailsToRetry([row("failed", minutesAgo(10)), row("skipped", minutesAgo(5))], now)).toEqual([]);
  });

  it("gives up on an email older than the window", () => {
    const old = new Date(now.getTime() - EMAIL_RETRY_WINDOW_MS - 60 * 1000);
    expect(pickEmailsToRetry([row("failed", old)], now)).toEqual([]);
  });

  it("keeps each kind of email for a visit apart, and carries the refund", () => {
    const rows = [
      row("failed", minutesAgo(10), {}, "booked"),
      row("sent", minutesAgo(9), {}, "booked"),
      row("failed", minutesAgo(10), { refundPence: 2500 }, "cancelled"),
    ];
    expect(pickEmailsToRetry(rows, now)).toEqual([
      { userId: "u1", appointmentId: "a1", kind: "cancelled", refundPence: 2500 },
    ]);
  });

  it("ignores history rows that are not appointment emails", () => {
    expect(pickEmailsToRetry([{ userId: "u1", status: "failed", sentAt: minutesAgo(10), data: { type: "message_reply" } }], now)).toEqual([]);
    expect(pickEmailsToRetry([{ userId: "u1", status: "failed", sentAt: minutesAgo(10), data: null }], now)).toEqual([]);
  });
});

describe("The record kept of an appointment email, for retries", () => {
  const base = { userId: "u1", appointmentId: "a1", kind: "cancelled" as const, subject: "Cancelled", delivered: false };

  it("keeps the refund so a retry can still say it", () => {
    expect(appointmentEmailRecord({ ...base, refundPence: 2500 }).data).toEqual({
      type: "appointment_cancelled",
      appointmentId: "a1",
      refundPence: 2500,
    });
  });

  it("marks an email no longer wanted as skipped", () => {
    expect(appointmentEmailRecord({ ...base, skipped: true }).status).toBe("skipped");
  });
});
