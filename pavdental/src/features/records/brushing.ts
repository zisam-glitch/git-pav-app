import { ukHour } from "../booking/uk-time";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

/**
 * The brushing session to log right now: today's weekday and morning or
 * evening, both in UK time (the server files the entry under that day).
 */
export function currentBrushingSlot(now = new Date()): { day: Weekday; session: "am" | "pm" } {
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Europe/London" }).format(now) as Weekday;
  return { day, session: ukHour(now) < 12 ? "am" : "pm" };
}
