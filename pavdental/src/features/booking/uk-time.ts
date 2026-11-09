// Appointment times are shown in UK time whatever the phone's own time zone,
// because that is when the clinic is open (CS-30).
export const PRACTICE_TIME_ZONE = "Europe/London";

/** The UK calendar date (YYYY-MM-DD) an instant falls on. */
export function ukDate(instant: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: PRACTICE_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(instant);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** "14:30" in UK time. */
export function ukTime(instant: Date): string {
  return instant.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: PRACTICE_TIME_ZONE });
}

/** A date in UK time, in the given format ("Mon 9 Nov" and so on). */
export function ukDateLabel(instant: Date, format: Intl.DateTimeFormatOptions): string {
  return instant.toLocaleDateString("en-GB", { ...format, timeZone: PRACTICE_TIME_ZONE });
}

/** The UK hour (0 to 23) an instant falls in. */
export function ukHour(instant: Date): number {
  return Number(ukTime(instant).slice(0, 2));
}

/** "Mon 26 Oct" for a UK calendar date. */
export function ukDayLabel(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

/**
 * "04/03/2015" for a calendar date such as a date of birth ("2015-03-04" or
 * "2015-03-04T00:00:00.000Z"). It is a date, not an instant, so no time zone
 * can move it to the day before.
 */
export function calendarDateLabel(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** The next `count` UK calendar dates, starting today. */
export function upcomingUkDates(count: number, now = new Date()): string[] {
  const today = ukDate(now);
  return Array.from({ length: count }, (_, i) => new Date(Date.parse(`${today}T12:00:00Z`) + i * 86400000).toISOString().slice(0, 10));
}

export interface OpeningHoursRow {
  weekday: number; // 0 = Sunday
  opensMinute: number;
  closesMinute: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const clock = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * "Mon–Fri 09:00–17:30 · Sat 09:00–13:00": days in Monday-first order, with
 * runs of days on the same hours joined. Days with no row are closed.
 */
export function formatOpeningHours(rows: OpeningHoursRow[]): string {
  if (rows.length === 0) return "Opening hours not set";
  const order = [1, 2, 3, 4, 5, 6, 0];
  const hoursFor = new Map(rows.map((r) => [r.weekday, `${clock(r.opensMinute)}–${clock(r.closesMinute)}`]));
  const groups: { first: number; last: number; hours: string }[] = [];
  for (const day of order) {
    const hours = hoursFor.get(day);
    if (!hours) continue;
    const previous = groups[groups.length - 1];
    if (previous && previous.hours === hours && order.indexOf(previous.last) === order.indexOf(day) - 1) previous.last = day;
    else groups.push({ first: day, last: day, hours });
  }
  return groups
    .map((g) => `${g.first === g.last ? DAY_NAMES[g.first] : `${DAY_NAMES[g.first]}–${DAY_NAMES[g.last]}`} ${g.hours}`)
    .join(" · ");
}

/**
 * Resolves opening hours text dynamically from clinic API response (MF-10, AUD-18).
 * Prioritizes structured UK opening hours table, falls back to operatingHours summary,
 * and defaults to standard practice hours when clinics have not loaded.
 */
export function resolvePracticeHours(
  clinics?: Array<{ openingHours?: OpeningHoursRow[]; operatingHours?: string }>,
  defaultHours = "Mon–Fri 09:00–17:30 · Sat 09:00–13:00"
): string {
  if (!clinics || clinics.length === 0) return defaultHours;
  const clinicWithHours = clinics.find((c) => Array.isArray(c.openingHours) && c.openingHours.length > 0);
  if (clinicWithHours?.openingHours) {
    return formatOpeningHours(clinicWithHours.openingHours);
  }
  const firstWithText = clinics.find((c) => typeof c.operatingHours === "string" && c.operatingHours.trim().length > 0);
  if (firstWithText?.operatingHours) {
    return firstWithText.operatingHours.trim();
  }
  return defaultHours;
}
