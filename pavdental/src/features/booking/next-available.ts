export interface SlotLike {
  isAvailable?: boolean;
  startTimeUtc?: string;
  clinicianId?: string;
  clinicId?: string;
}

export const MAX_WEEKS_AHEAD = 4;

/** True when the day has at least one time that is free and still in the future. */
export function hasBookableTime(
  slots: SlotLike[] | undefined,
  filter: { clinicianId?: string; clinicId?: string } = {},
  now: number = Date.now()
): boolean {
  return (slots ?? []).some((s) => {
    if (s.isAvailable === false) return false;
    if (filter.clinicianId && s.clinicianId && s.clinicianId !== filter.clinicianId) return false;
    if (filter.clinicId && s.clinicId && s.clinicId !== filter.clinicId) return false;
    return !s.startTimeUtc || new Date(s.startTimeUtc).getTime() > now;
  });
}

/** The first day after `afterIso` that has a bookable time, among the days we have answers for. */
export function nextAvailableDay<T extends { iso: string }>(
  days: T[],
  bookable: Record<string, boolean | undefined>,
  afterIso: string
): T | null {
  return days.find((d) => d.iso > afterIso && bookable[d.iso] === true) ?? null;
}
