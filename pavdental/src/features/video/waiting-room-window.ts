/** The waiting room opens this long before the visit starts. */
export const WAITING_ROOM_OPENS_MINUTES = 10;

/**
 * True once the patient can go to the waiting room: from 10 minutes before the
 * start until the slot ends. Earlier than that there is nobody to let them in.
 */
export function waitingRoomOpen(
  booking: { startTimeUtc: string; endTimeUtc?: string | null },
  now: number = Date.now()
): boolean {
  const start = new Date(booking.startTimeUtc).getTime();
  const end = new Date(booking.endTimeUtc ?? booking.startTimeUtc).getTime();
  return now >= start - WAITING_ROOM_OPENS_MINUTES * 60_000 && now < end;
}
