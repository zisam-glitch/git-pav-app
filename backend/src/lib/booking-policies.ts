// The booking rules the app shows to patients, in one place (checklist A1).
// The app asks for these instead of keeping its own copy of the numbers, so what it says is what the server does.
// Every number here is the one the server enforces: change it here and both follow.

import { FULL_REFUND_HOURS, HALF_REFUND_HOURS } from "./cancellation-policy";
import { RESCHEDULE_MIN_NOTICE_HOURS } from "./reschedule-policy";
import { WAITING_ROOM_OPENS_MINUTES } from "./video-triage";

/** Check-in opens this long before a visit and closes this long after it ends. */
export const CHECK_IN_OPENS_HOURS = 48;
export const CHECK_IN_CLOSES_HOURS = 2;

export interface BookingPolicies {
  cancellation: {
    fullRefundHours: number;
    halfRefundHours: number;
    /** What the patient is told when they are about to cancel. */
    message: string;
  };
  rescheduleMinNoticeHours: number;
  checkInOpensHours: number;
  checkInClosesHours: number;
  waitingRoomOpensMinutes: number;
}

export function cancellationMessage(fullHours: number = FULL_REFUND_HOURS, halfHours: number = HALF_REFUND_HOURS): string {
  return (
    "Your slot will be released immediately. " +
    `Cancelling ${fullHours} hours or more ahead refunds your deposit in full, ` +
    `${halfHours} to ${fullHours} hours ahead refunds half, and under ${halfHours} hours the deposit is kept.`
  );
}

export function bookingPolicies(): BookingPolicies {
  return {
    cancellation: {
      fullRefundHours: FULL_REFUND_HOURS,
      halfRefundHours: HALF_REFUND_HOURS,
      message: cancellationMessage(),
    },
    rescheduleMinNoticeHours: RESCHEDULE_MIN_NOTICE_HOURS,
    checkInOpensHours: CHECK_IN_OPENS_HOURS,
    checkInClosesHours: CHECK_IN_CLOSES_HOURS,
    waitingRoomOpensMinutes: WAITING_ROOM_OPENS_MINUTES,
  };
}
