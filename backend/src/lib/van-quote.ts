// backend/src/lib/van-quote.ts
// What the van can promise a patient who asks now: which van, how long, and
// whether there is room. One place for the availability check and the request
// itself, so they cannot give different answers (N12).
//
// Requests still waiting for an operator's answer count as provisional stops
// (N7). Before, a second patient asking while the first was pending was quoted
// as if they were next, and the van's real queue (accepted stops) was the only
// thing in the chain. Now a pending request sits in the queue after the
// accepted stops, in the order requested, until it is accepted, declined,
// cancelled or has expired.

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getOnlineShiftsCoveringPoint } from "./van-coverage";
import { VAN_PLAN_SETTINGS } from "./van-plan";
import { etaSecondsToNewPatient, MAX_ETA_SECONDS, MAX_QUEUE_DEPTH, Point, QueueStop } from "./van-eta";

type Db = Prisma.TransactionClient | typeof prisma;

/** The plan's figures (lib/van-plan.ts), so a quote and the plan cannot use different ones. */
export const STOP_BUFFER_MINUTES = VAN_PLAN_SETTINGS.gapMinutes;
export const DEFAULT_TREATMENT_MINUTES = VAN_PLAN_SETTINGS.defaultTreatmentMinutes;

type StopRow = {
  patientLat: number;
  patientLng: number;
  phase: string;
  treatmentStartedAt: Date | null;
  service: { durationMinutes: number | null };
};

function toQueueStop(row: StopRow): QueueStop {
  return {
    lat: row.patientLat,
    lng: row.patientLng,
    phase: row.phase,
    treatmentStartedAt: row.treatmentStartedAt,
    treatmentMinutes: row.service.durationMinutes || DEFAULT_TREATMENT_MINUTES,
    bufferMinutes: STOP_BUFFER_MINUTES,
  };
}

/** A pending request that has not yet passed its time limit. One the sweeper has not reached yet still counts as gone. */
const livePending = (now: Date): Prisma.VanServiceRequestWhereInput => ({ status: "pending", expiresAt: { gt: now } });

/** Accepted and in-progress stops, plus pending requests still within their time limit. */
export async function countOpenStops(db: Db, shiftId: string, now = new Date()): Promise<number> {
  return db.vanServiceRequest.count({
    where: { shiftId, OR: [{ status: { in: ["accepted", "in_progress"] } }, livePending(now)] },
  });
}

export type ShiftQueue = {
  /** Accepted and in-progress stops in queue order. */
  accepted: QueueStop[];
  /** Pending requests in the order they were made, each with its id and time. */
  pending: { id: string; requestedAt: Date; stop: QueueStop }[];
};

export async function loadShiftQueue(db: Db, shiftId: string, now = new Date()): Promise<ShiftQueue> {
  const [accepted, pending] = await Promise.all([
    db.vanServiceRequest.findMany({
      where: { shiftId, status: { in: ["accepted", "in_progress"] } },
      include: { service: { select: { durationMinutes: true } } },
      orderBy: { queuePosition: "asc" },
    }),
    db.vanServiceRequest.findMany({
      where: { shiftId, ...livePending(now) },
      include: { service: { select: { durationMinutes: true } } },
      orderBy: [{ requestedAt: "asc" }, { id: "asc" }],
    }),
  ]);
  return {
    accepted: accepted.map(toQueueStop),
    pending: pending.map((p) => ({ id: p.id, requestedAt: p.requestedAt, stop: toQueueStop(p) })),
  };
}

/**
 * The stops that come before one request. For an accepted stop that is the
 * accepted stops ahead of its place; for a pending request it is every
 * accepted stop and the pending requests made before it. Pure.
 */
export function stopsAheadOf(
  queue: ShiftQueue,
  request: { id: string; status: string; queuePosition: number | null }
): QueueStop[] {
  if (request.status === "pending") {
    const index = queue.pending.findIndex((p) => p.id === request.id);
    const earlier = index === -1 ? queue.pending : queue.pending.slice(0, index);
    return [...queue.accepted, ...earlier.map((p) => p.stop)];
  }
  const position = request.queuePosition ?? queue.accepted.length + 1;
  return queue.accepted.slice(0, Math.max(0, position - 1));
}

export type BestVan = {
  shift: Awaited<ReturnType<typeof getOnlineShiftsCoveringPoint>>[number];
  etaSeconds: number;
  /** Accepted, in-progress and pending requests already on that shift. */
  queueLength: number;
};

export type Quote =
  | { kind: "no_van" }
  | { kind: "none_available" }
  | { kind: "best"; best: BestVan };

/**
 * The best van for a patient at `point`: the online shift covering it with the
 * shortest wait, counting pending requests as part of its queue. Skips a shift
 * with no position yet, a full queue, or a wait beyond the limit. Shifts are
 * quoted at the same time, not one after another.
 */
export async function quoteBestVan(point: Point, now = new Date()): Promise<Quote> {
  const shifts = await getOnlineShiftsCoveringPoint(point);
  if (shifts.length === 0) return { kind: "no_van" };

  const quotes = await Promise.all(
    shifts.map(async (shift): Promise<BestVan | null> => {
      // VR-9: no GPS fix yet; skip rather than assuming a fake coordinate.
      if (shift.lastLat == null || shift.lastLng == null) return null;
      const queue = await loadShiftQueue(prisma, shift.id, now);
      const queueLength = queue.accepted.length + queue.pending.length;
      if (queueLength >= MAX_QUEUE_DEPTH) return null;
      const etaSeconds = await etaSecondsToNewPatient(
        { lat: shift.lastLat, lng: shift.lastLng },
        [...queue.accepted, ...queue.pending.map((p) => p.stop)],
        point
      );
      return etaSeconds > MAX_ETA_SECONDS ? null : { shift, etaSeconds, queueLength };
    })
  );

  const best = quotes
    .filter((q): q is BestVan => q !== null)
    .reduce<BestVan | null>((a, b) => (a === null || b.etaSeconds < a.etaSeconds ? b : a), null);
  return best ? { kind: "best", best } : { kind: "none_available" };
}
