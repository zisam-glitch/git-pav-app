import { toLabel } from "../../lib/text";

type AppointmentLike = {
  status: string;
  startTimeUtc: string;
  endTimeUtc?: string | null;
};

/**
 * The visit to show as "next": the soonest one still to come. Never a cancelled
 * or past visit, whatever order the list arrives in (it can come from the cache).
 */
export function nextVisit<T extends AppointmentLike>(
  appointments: T[] | null | undefined,
  now: number = Date.now()
): T | null {
  if (!Array.isArray(appointments)) return null;
  const upcoming = appointments
    .filter(
      (a) =>
        a.status === "in_progress" ||
        (a.status === "confirmed" && new Date(a.startTimeUtc).getTime() >= now)
    )
    .sort((a, b) => +new Date(a.startTimeUtc) - +new Date(b.startTimeUtc));
  return upcoming[0] ?? null;
}

/**
 * The badge for an appointment. "Completed" only when the server says so: a
 * visit whose time has passed may have been missed, so it's just "Past".
 */
export function appointmentBadge(
  appointment: AppointmentLike,
  now: number = Date.now()
): { label: string; variant: "success" | "danger" | "default" } {
  switch (appointment.status) {
    case "cancelled":
      return { label: "Cancelled", variant: "danger" };
    case "completed":
      return { label: "Completed", variant: "default" };
    case "no_show":
      return { label: "Missed", variant: "default" };
    case "in_progress":
      return { label: "In progress", variant: "success" };
  }
  const end = new Date(appointment.endTimeUtc ?? appointment.startTimeUtc).getTime();
  if (end < now) return { label: "Past", variant: "default" };
  return { label: toLabel(appointment.status), variant: "success" };
}

/** What the patient actually paid, not the service's list deposit. */
export function depositPaidLabel(depositPaidPence: number | null | undefined): string {
  return depositPaidPence ? `£${(depositPaidPence / 100).toFixed(2)}` : "—";
}
