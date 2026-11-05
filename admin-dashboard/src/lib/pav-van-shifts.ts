// Shapes and helpers for the van shifts screen. It says whether a van is
// working and when it last reported in. It never shows where the van is or
// who its requests are from; the backend leaves those out.

export const SHIFTS_PAGE_SIZE = 25;
/** A live van that hasn't reported in for this long is worth a phone call. */
export const STALE_AFTER_MINUTES = 10;

export type ShiftStatus = "offline" | "online" | "paused";
export type ShiftState = "" | "live" | "ended";

export interface VanShiftRow {
  id: string;
  vanId: string;
  vanName: string;
  registrationPlate: string;
  operatorName: string;
  status: ShiftStatus;
  live: boolean;
  startedAt: string;
  endedAt: string | null;
  lastSeenAt: string | null;
  openRequests: number;
}

export interface ShiftFilters {
  state: ShiftState;
  vanId: string;
}

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The proxy path for one page of shifts; empty or malformed filters are left out. */
export function shiftsPath(filters: ShiftFilters, page = 1): string {
  const query = new URLSearchParams({
    page: String(Math.max(1, Math.floor(page))),
    limit: String(SHIFTS_PAGE_SIZE),
  });
  if (filters.state === "live" || filters.state === "ended") query.set("state", filters.state);
  if (ID.test(filters.vanId)) query.set("vanId", filters.vanId);
  return `van-shifts?${query}`;
}

export const SHIFT_STATUS_LABEL: Record<ShiftStatus, string> = {
  online: "On shift",
  paused: "Paused",
  offline: "Offline",
};

export type Freshness =
  | { kind: "ended" }
  | { kind: "never" }
  | { kind: "fresh"; minutes: number }
  | { kind: "stale"; minutes: number };

/** How recently a live van reported in. Ended shifts have nothing to chase. */
export function freshness(shift: Pick<VanShiftRow, "live" | "lastSeenAt">, now = new Date()): Freshness {
  if (!shift.live) return { kind: "ended" };
  if (!shift.lastSeenAt) return { kind: "never" };
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(shift.lastSeenAt).getTime()) / 60_000));
  return minutes >= STALE_AFTER_MINUTES ? { kind: "stale", minutes } : { kind: "fresh", minutes };
}

/** "5 min ago", "1 hr 5 min ago" for the last-seen column. */
export function agoLabel(minutes: number): string {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hr = `${hours} hr`;
  if (hours >= 24) return `${Math.floor(hours / 24)} day${hours >= 48 ? "s" : ""} ago`;
  return rest ? `${hr} ${rest} min ago` : `${hr} ago`;
}

export function freshnessLabel(f: Freshness): string {
  switch (f.kind) {
    case "ended":
      return "Shift ended";
    case "never":
      return "No location yet";
    default:
      return agoLabel(f.minutes);
  }
}

/** How long a shift ran, or has run so far. */
export function shiftLength(shift: Pick<VanShiftRow, "startedAt" | "endedAt">, now = new Date()): string {
  const end = shift.endedAt ? new Date(shift.endedAt) : now;
  const minutes = Math.max(0, Math.floor((end.getTime() - new Date(shift.startedAt).getTime()) / 60_000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

/** What staff confirm before ending someone else's shift. Says what happens and what doesn't. */
export function endShiftQuestion(shift: Pick<VanShiftRow, "vanName" | "operatorName" | "openRequests">): string {
  const waiting =
    shift.openRequests > 0
      ? ` ${shift.openRequests} open request${shift.openRequests === 1 ? "" : "s"} will be expired and any deposit hold released, and the patient${shift.openRequests === 1 ? " is" : "s are"} told the van went offline.`
      : "";
  return `End ${shift.operatorName}'s shift on ${shift.vanName}?${waiting} Visits already accepted are not affected, and the shift can't end while any are open. The operator will have to start a new shift. This can't be undone.`;
}
