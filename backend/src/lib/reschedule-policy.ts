// Moving a booking to another time (owner decision, 5 Nov): free with 48 hours'
// notice or more, and the deposit simply stays with the booking. Inside 48
// hours the patient cancels and rebooks, so the cancellation refund tiers in
// cancellation-policy.ts apply, which keeps the two rules from contradicting
// each other.

export const RESCHEDULE_MIN_NOTICE_HOURS = 48;

export type RescheduleCheck =
  | { ok: true; hoursUntilVisit: number }
  | { ok: false; status: 409; error: string; hoursUntilVisit: number };

export function checkReschedulable(
  appointment: { status: string; channel: string; startTimeUtc: Date },
  now: Date = new Date(),
): RescheduleCheck {
  const hoursUntilVisit = (appointment.startTimeUtc.getTime() - now.getTime()) / (1000 * 3600);

  if (appointment.channel === "van") {
    return {
      ok: false,
      status: 409,
      hoursUntilVisit,
      error: "Van visits can't be rescheduled, because the van is timed on the day. Cancel and request again if you need to.",
    };
  }
  if (appointment.status !== "confirmed") {
    return {
      ok: false,
      status: 409,
      hoursUntilVisit,
      error:
        appointment.status === "draft_hold"
          ? "Finish paying the deposit for this booking before moving it."
          : "Only a confirmed booking can be rescheduled.",
    };
  }
  if (hoursUntilVisit < RESCHEDULE_MIN_NOTICE_HOURS) {
    return {
      ok: false,
      status: 409,
      hoursUntilVisit,
      error: `A booking can be moved up to ${RESCHEDULE_MIN_NOTICE_HOURS} hours before the visit. This one is sooner, so you'll need to cancel it and book again, and the usual cancellation terms apply.`,
    };
  }
  return { ok: true, hoursUntilVisit };
}
