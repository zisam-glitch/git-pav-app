import { ukDate, ukDayLabel, upcomingUkDates } from "@/features/booking/uk-time";

/** How many days the dentist's "next days" view covers, today included. */
export const WEEK_DAYS = 7;

export interface DayGroup<T> {
  /** UK calendar date, YYYY-MM-DD. */
  date: string;
  /** "Today", "Tomorrow", or "Mon 16 Nov". */
  label: string;
  items: T[];
}

/**
 * The dentist's next WEEK_DAYS days, one group per UK calendar day, earliest visit first.
 * Every day in the window gets a group, empty or not, so a quiet day reads as quiet rather than missing.
 * Visits outside the window are left out. `channel` limits it to one kind of visit ("video").
 */
export function groupByUkDay<T extends { startTimeUtc: string; channel?: string }>(
  appointments: readonly T[],
  options: { now?: Date; channel?: string } = {},
): DayGroup<T>[] {
  const now = options.now ?? new Date();
  const dates = upcomingUkDates(WEEK_DAYS, now);
  const groups = new Map<string, DayGroup<T>>(
    dates.map((date, i) => [date, { date, label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : ukDayLabel(date), items: [] }]),
  );
  const sorted = [...appointments].sort((a, b) => Date.parse(a.startTimeUtc) - Date.parse(b.startTimeUtc));
  for (const a of sorted) {
    if (options.channel && a.channel !== options.channel) continue;
    const start = new Date(a.startTimeUtc);
    if (Number.isNaN(start.getTime())) continue;
    groups.get(ukDate(start))?.items.push(a);
  }
  return dates.map((d) => groups.get(d) as DayGroup<T>);
}
