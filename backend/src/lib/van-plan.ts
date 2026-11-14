// backend/src/lib/van-plan.ts
// The plan for a van shift: when the van is expected to arrive at, start and
// finish every stop, worked out in one place and stored with the stop.
//
// Before this, three places each recomputed an ETA their own way. Now the
// patient's screen, the push and the operator's list read the same stored
// times. The plan is rewritten whenever the queue changes or the van has
// moved a meaningful distance (through broadcastEtaUpdates), and a reader
// refreshes it when it has gone stale.

import { prisma } from "./prisma";
import { chainLegSeconds, Point } from "./van-eta";

const minutesFromEnv = (name: string, fallback: number) => {
  const parsed = parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

/**
 * The figures the plan is built from (N10). One place, not three files.
 * Setup is the time between parking and starting treatment; the gap is the
 * time between finishing one visit and setting off for the next.
 */
export const VAN_PLAN_SETTINGS = {
  defaultTreatmentMinutes: minutesFromEnv("VAN_DEFAULT_TREATMENT_MINUTES", 45),
  gapMinutes: minutesFromEnv("VAN_GAP_MINUTES", 10),
  setupMinutes: minutesFromEnv("VAN_SETUP_MINUTES", 0),
};
export type VanPlanSettings = typeof VAN_PLAN_SETTINGS;

/** A treatment that has overrun is still planned to take this long (VE-1). */
const MIN_REMAINING_TREATMENT_SECONDS = 300;

/** A stored plan older than this is refreshed when someone reads it. */
export const PLAN_MAX_AGE_SECONDS = 60;

export type PlanStop = {
  id: string;
  phase: string;
  treatmentStartedAt: Date | null;
  /** The service's length; null or 0 uses the default. */
  treatmentMinutes: number | null;
};

export type PlannedStop = {
  id: string;
  /** Null once the van is there: the arrival already stored is kept. */
  plannedArrivalAt: Date | null;
  plannedStartAt: Date;
  plannedFinishAt: Date;
};

const vanIsThere = (phase: string) => phase === "on_site" || phase === "in_treatment";

/**
 * Turns the stops in order into arrival, start and finish times. Pure.
 *
 * `legSeconds[i]` is the drive to stop i from where the van will be: its
 * position now for the first stop, the stop before for the rest. A stop the
 * van is already at takes no drive. A stop being treated counts only the
 * treatment time left, never less than five minutes.
 */
export function planStops(
  now: Date,
  stops: PlanStop[],
  legSeconds: number[],
  settings: VanPlanSettings = VAN_PLAN_SETTINGS
): PlannedStop[] {
  const plus = (date: Date, seconds: number) => new Date(date.getTime() + seconds * 1000);
  let free = now; // when the van can next set off

  return stops.map((stop, i) => {
    const treatmentSeconds = (stop.treatmentMinutes || settings.defaultTreatmentMinutes) * 60;
    let plannedArrivalAt: Date | null = null;
    let plannedStartAt: Date;
    let plannedFinishAt: Date;

    if (stop.phase === "in_treatment" && stop.treatmentStartedAt) {
      plannedStartAt = stop.treatmentStartedAt;
      const due = plus(plannedStartAt, treatmentSeconds);
      const earliest = plus(now, MIN_REMAINING_TREATMENT_SECONDS);
      plannedFinishAt = due > earliest ? due : earliest;
    } else if (vanIsThere(stop.phase)) {
      plannedStartAt = plus(free, settings.setupMinutes * 60);
      plannedFinishAt = plus(plannedStartAt, treatmentSeconds);
    } else {
      plannedArrivalAt = plus(free, legSeconds[i] ?? 0);
      plannedStartAt = plus(plannedArrivalAt, settings.setupMinutes * 60);
      plannedFinishAt = plus(plannedStartAt, treatmentSeconds);
    }

    free = plus(plannedFinishAt, settings.gapMinutes * 60);
    return { id: stop.id, plannedArrivalAt, plannedStartAt, plannedFinishAt };
  });
}

/**
 * Seconds until the van reaches a stop, from its stored plan. Pure.
 * Zero once the van is there; null when there is no plan yet.
 */
export function etaSecondsFromPlan(stop: { phase: string | null; plannedArrivalAt: Date | null }, now: Date): number | null {
  if (stop.phase && vanIsThere(stop.phase)) return 0;
  if (!stop.plannedArrivalAt) return null;
  return Math.max(0, Math.round((stop.plannedArrivalAt.getTime() - now.getTime()) / 1000));
}

/** Whether a stored plan should be worked out again before it is shown. Pure. */
export function planIsStale(stop: { phase: string | null; planComputedAt: Date | null }, now: Date): boolean {
  if (stop.phase && vanIsThere(stop.phase)) return false;
  if (!stop.planComputedAt) return true;
  return now.getTime() - stop.planComputedAt.getTime() > PLAN_MAX_AGE_SECONDS * 1000;
}

export type ShiftPlanStop = {
  id: string;
  patientId: string;
  phase: string;
  lastEtaSeconds: number | null;
  lastEtaPushedAt: Date | null;
  plannedArrivalAt: Date | null;
  plannedStartAt: Date;
  plannedFinishAt: Date;
};

export type ShiftPlan = { computedAt: Date; stops: ShiftPlanStop[] };

/**
 * Works out a shift's plan from the van's last position and stores it.
 *
 * Returns null when the van has not reported a position yet: there is nothing
 * to plan from. One routing request for the whole chain. A plan never
 * overwrites a newer one, so two runs finishing out of order cannot leave the
 * older times behind, and a stop that closed meanwhile is left alone.
 */
export async function recomputeShiftPlan(shiftId: string, now: Date = new Date()): Promise<ShiftPlan | null> {
  const shift = await prisma.vanShift.findUnique({ where: { id: shiftId }, select: { lastLat: true, lastLng: true } });
  if (!shift || shift.lastLat == null || shift.lastLng == null) return null;

  const stops = await prisma.vanServiceRequest.findMany({
    where: { shiftId, status: { in: ["accepted", "in_progress"] } },
    include: { service: { select: { durationMinutes: true } } },
    orderBy: { queuePosition: "asc" },
  });
  if (stops.length === 0) return { computedAt: now, stops: [] };

  const van: Point = { lat: shift.lastLat, lng: shift.lastLng };
  const legs = await chainLegSeconds([van, ...stops.map((s) => ({ lat: s.patientLat, lng: s.patientLng }))]);
  const planned = planStops(
    now,
    stops.map((s) => ({
      id: s.id,
      phase: s.phase,
      treatmentStartedAt: s.treatmentStartedAt,
      treatmentMinutes: s.service?.durationMinutes ?? null,
    })),
    legs
  );

  await prisma.$transaction(
    planned.map((p) =>
      prisma.vanServiceRequest.updateMany({
        where: {
          id: p.id,
          status: { in: ["accepted", "in_progress"] },
          OR: [{ planComputedAt: null }, { planComputedAt: { lt: now } }],
        },
        data: {
          ...(p.plannedArrivalAt ? { plannedArrivalAt: p.plannedArrivalAt } : {}),
          plannedStartAt: p.plannedStartAt,
          plannedFinishAt: p.plannedFinishAt,
          planComputedAt: now,
        },
      })
    )
  );

  return {
    computedAt: now,
    stops: stops.map((s, i) => ({
      id: s.id,
      patientId: s.patientId,
      phase: s.phase,
      lastEtaSeconds: s.lastEtaSeconds,
      lastEtaPushedAt: s.lastEtaPushedAt,
      // A stop the van is at keeps the arrival it already had.
      plannedArrivalAt: planned[i].plannedArrivalAt ?? s.plannedArrivalAt,
      plannedStartAt: planned[i].plannedStartAt,
      plannedFinishAt: planned[i].plannedFinishAt,
    })),
  };
}
