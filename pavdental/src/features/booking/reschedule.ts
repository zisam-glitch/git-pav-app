// Moving a booking to another time (owner decision, 5 Nov): free with 48 hours'
// notice or more, and the deposit stays with the booking. Inside 48 hours the
// patient cancels and books again. The server enforces this and has the last
// word; this only decides what to offer, so nobody is sent down a path that
// ends in a refusal. Keep the number in step with backend/src/lib/reschedule-policy.ts.
import { ukDateLabel, ukTime } from "./uk-time";

export const RESCHEDULE_MIN_NOTICE_HOURS = 48;
/** How many days ahead the new-time picker offers. */
export const RESCHEDULE_DAYS = 14;

export interface Reschedulable {
  status: string;
  channel: string;
  startTimeUtc: string;
}

/**
 * allowed: can be moved. too_late: a paid clinic or video visit that is now
 * inside the notice window. not_movable: a van visit, an unpaid hold, or a
 * booking that is cancelled or over.
 */
export type RescheduleState = "allowed" | "too_late" | "not_movable";

export function rescheduleState(booking: Reschedulable, now: Date = new Date()): RescheduleState {
  if (booking.channel === "van" || booking.status !== "confirmed") return "not_movable";
  const hours = (new Date(booking.startTimeUtc).getTime() - now.getTime()) / 3_600_000;
  if (hours <= 0) return "not_movable";
  return hours >= RESCHEDULE_MIN_NOTICE_HOURS ? "allowed" : "too_late";
}

export const TOO_LATE_MESSAGE =
  `A booking can be moved up to ${RESCHEDULE_MIN_NOTICE_HOURS} hours before the visit. This one is sooner, ` +
  "so to change it you'll need to cancel and book again, and the usual cancellation terms apply.";

/** What the patient confirms before the move. Says the deposit stays, so they know nothing more is charged. */
export function rescheduleQuestion(newStartIso: string): string {
  const start = new Date(newStartIso);
  const day = ukDateLabel(start, { weekday: "long", day: "numeric", month: "long" });
  return `Move your booking to ${day} at ${ukTime(start)} UK time? Your deposit stays with the booking, so there is nothing more to pay.`;
}

/** Only free times in the future, soonest first. The server checks again. */
export function offerableSlots<T extends { isAvailable: boolean; startTimeUtc?: string }>(slots: T[], now: Date = new Date()): T[] {
  return slots
    .filter((slot) => slot.isAvailable && !!slot.startTimeUtc && new Date(slot.startTimeUtc).getTime() > now.getTime())
    .sort((a, b) => new Date(a.startTimeUtc as string).getTime() - new Date(b.startTimeUtc as string).getTime());
}
