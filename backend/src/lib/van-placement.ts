// backend/src/lib/van-placement.ts
// Where in the queue a newly accepted visit goes, and whether a reorder keeps
// the arrival times patients were already told (N8).
//
// Before, a newly accepted visit always went to the back. When its address is
// on the way to a stop already queued, that wastes the van's time and makes
// everyone wait longer than they need to. Now it is tried at every position
// the queue allows and goes where the whole queue waits least, as long as no
// patient is made later than the time they were last told (plus a small
// allowance). The back of the queue never delays anyone, so there is always a
// valid answer.
//
// Timing follows the same chain as the ETA (van-eta.ts): travel to a stop,
// unless the van is already there, then the treatment still to do, then a gap
// before the next drive. The rules are pure, with travel times passed in.

import { Point, QueueStop, remainingTreatmentSeconds, getDurationMatrix, fallbackTravelSeconds } from "./van-eta";

/** How much later than the time a patient was last told is still keeping the promise. */
export const PROMISE_SLACK_SECONDS = parseInt(process.env.VAN_PROMISE_SLACK_MINUTES ?? "20", 10) * 60;

export type PlacementStop = QueueStop & {
  id: string;
  /** The arrival time the patient last heard, when there is one. */
  promisedBy: Date | null;
};

/** Travel seconds between two stops, or from the van when `from` is "van". */
export type LegFn = (from: string, to: string) => number;

/** Seconds from `now` until the van arrives at each stop, for stops visited in this order. */
export function arrivalSeconds(order: PlacementStop[], leg: LegFn, now: Date): Map<string, number> {
  const arrivals = new Map<string, number>();
  let t = 0;
  let at = "van";
  for (const stop of order) {
    // Already parked there (on site or in treatment): no drive.
    if (stop.phase !== "on_site" && stop.phase !== "in_treatment") t += leg(at, stop.id);
    arrivals.set(stop.id, t);
    t += remainingTreatmentSeconds(stop, now) + stop.bufferMinutes * 60;
    at = stop.id;
  }
  return arrivals;
}

export type LateStop = { id: string; lateBySeconds: number };

/**
 * Stops of `before` that the new order `after` would make later than they are promised to be (`after` may hold extra stops). A
 * stop is late when it would arrive after the later of its promised time plus
 * the allowance and the time it was already due to arrive: a stop that is
 * running late already is never pushed back further.
 */
export function lateStops(
  before: PlacementStop[],
  after: PlacementStop[],
  leg: LegFn,
  now: Date,
  slackSeconds = PROMISE_SLACK_SECONDS
): LateStop[] {
  const was = arrivalSeconds(before, leg, now);
  const will = arrivalSeconds(after, leg, now);
  const late: LateStop[] = [];
  for (const stop of before) {
    const due = was.get(stop.id);
    const next = will.get(stop.id);
    if (due === undefined || next === undefined) continue;
    const promised = stop.promisedBy ? (stop.promisedBy.getTime() - now.getTime()) / 1000 : due;
    const limit = Math.max(promised + slackSeconds, due);
    if (next > limit + 0.5) late.push({ id: stop.id, lateBySeconds: Math.round(next - limit) });
  }
  return late;
}

export type Placement = {
  /** Where the new stop goes in `order` (0 is first). */
  index: number;
  order: PlacementStop[];
  /** True when it went somewhere other than the back. */
  movedAhead: boolean;
};

/**
 * Chooses where a new stop goes. `existing` is the queue as it stands, stops
 * under way first. Tries every position after the stops under way, keeps those
 * that make nobody later than promised (and give the new patient no later an
 * arrival than the back would), and takes the one where the whole queue waits
 * least. Ties go to the later position, so nothing moves without a gain.
 */
export function choosePlacement(existing: PlacementStop[], candidate: PlacementStop, leg: LegFn, now: Date, slackSeconds = PROMISE_SLACK_SECONDS): Placement {
  let minIndex = 0;
  existing.forEach((stop, i) => {
    if (stop.phase !== "queued") minIndex = i + 1;
  });

  const back = [...existing, candidate];
  const backArrivals = arrivalSeconds(back, leg, now);
  const candidateAtBack = backArrivals.get(candidate.id) ?? Infinity;

  let best: Placement = { index: existing.length, order: back, movedAhead: false };
  let bestCost = [...backArrivals.values()].reduce((a, b) => a + b, 0);

  for (let index = minIndex; index < existing.length; index++) {
    const order = [...existing.slice(0, index), candidate, ...existing.slice(index)];
    // Nobody already queued may be made later than promised.
    if (lateStops(existing, order, leg, now, slackSeconds).length > 0) continue;
    // The new patient must not wait longer than the back of the queue would have meant.
    const arrivals = arrivalSeconds(order, leg, now);
    if ((arrivals.get(candidate.id) ?? Infinity) > candidateAtBack) continue;
    const cost = [...arrivals.values()].reduce((a, b) => a + b, 0);
    if (cost < bestCost) {
      bestCost = cost;
      best = { index, order, movedAhead: true };
    }
  }
  return best;
}

// ─── Travel times ─────────────────────────────────────────────────────────

/**
 * Travel times between the van and some stops, from one routing request when a
 * provider is configured and straight-line estimates otherwise. Call it before
 * taking a lock: it may wait on the network.
 */
export async function buildLegFn(van: Point, stops: { id: string; lat: number; lng: number }[]): Promise<LegFn> {
  const points: Point[] = [van, ...stops.map((s) => ({ lat: s.lat, lng: s.lng }))];
  const index = new Map<string, number>([["van", 0], ...stops.map((s, i): [string, number] => [s.id, i + 1])]);
  const matrix = await getDurationMatrix(points);
  return (from, to) => {
    const i = index.get(from);
    const j = index.get(to);
    if (i === undefined || j === undefined) return 0;
    const seconds = matrix?.[i]?.[j];
    if (seconds != null && Number.isFinite(seconds)) return Math.round(seconds);
    return fallbackTravelSeconds(points[i], points[j]);
  };
}

/** The arrival time a patient last heard: the last ETA pushed, else the quote they were given when they asked. */
export function promisedArrival(row: {
  lastEtaSeconds: number | null;
  lastEtaPushedAt: Date | null;
  etaSecondsSnapshot: number | null;
  requestedAt: Date;
}): Date | null {
  if (row.lastEtaPushedAt && row.lastEtaSeconds != null) {
    return new Date(row.lastEtaPushedAt.getTime() + row.lastEtaSeconds * 1000);
  }
  if (row.etaSecondsSnapshot != null) return new Date(row.requestedAt.getTime() + row.etaSecondsSnapshot * 1000);
  return null;
}
