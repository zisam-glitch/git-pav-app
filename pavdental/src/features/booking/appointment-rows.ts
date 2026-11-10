/**
 * The rows of the Bookings list as one flat array, so the list can be
 * virtualised: only the rows on screen are drawn, however long the history.
 */

export type AppointmentListRow<T> =
  | { kind: "heading"; key: string; title: string }
  | { kind: "no-upcoming"; key: string }
  | { kind: "booking"; key: string; booking: T; past: boolean };

export function buildAppointmentRows<T extends { id: string }>(upcoming: T[], past: T[]): AppointmentListRow<T>[] {
  const rows: AppointmentListRow<T>[] = [{ kind: "heading", key: "heading-upcoming", title: "Upcoming" }];
  if (upcoming.length === 0) rows.push({ kind: "no-upcoming", key: "no-upcoming" });
  for (const booking of upcoming) rows.push({ kind: "booking", key: booking.id, booking, past: false });
  if (past.length > 0) {
    rows.push({ kind: "heading", key: "heading-past", title: "Past" });
    for (const booking of past) rows.push({ kind: "booking", key: booking.id, booking, past: true });
  }
  return rows;
}
