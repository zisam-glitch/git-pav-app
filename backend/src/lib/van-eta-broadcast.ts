// backend/src/lib/van-eta-broadcast.ts
// Live ETA re-push for van patients.
//
// Patients already see a live ETA by polling (live-track.tsx every 5 s). This
// module closes the remaining gap: the patient is *notified* when their ETA
// materially changes, without spamming them on every GPS ping.
//
// Triggers (wired in routes/van.ts):
//   - GPS ping with material drift from the last pinged position
//   - queue changes: accept, phase advance, cancel/no-show
//
// Gating (both must pass to actually push):
//   - material change: ETA differs from the patient's last-pushed ETA by at
//     least ETA_PUSH_DRIFT_MINUTES (5 default)
//   - throttle: at most one push per patient per ETA_PUSH_THROTTLE_MINUTES
//     (10 default); callers may force past both (e.g. right after accept)
//
// The ETA is read from the shift's plan (lib/van-plan.ts), which this pass
// works out again and stores first, so the push, the patient's screen and the
// operator's list all show the same times.
//
// Best-effort by design: push/DB failures are logged and swallowed — they
// must never break the operator's dispatch action.

import { prisma } from "./prisma";
import { etaSecondsFromPlan, recomputeShiftPlan } from "./van-plan";
import { sendPatientNotification } from "./patient-push";
import { safeError } from "./log-safety";

const DRIFT_MINUTES = parseInt(process.env.ETA_PUSH_DRIFT_MINUTES ?? "5", 10);
const THROTTLE_MINUTES = parseInt(process.env.ETA_PUSH_THROTTLE_MINUTES ?? "10", 10);

export type EtaPushOutcome =
  | "pushed"
  | "below_drift"
  | "throttled"
  | "no_fix"
  | "no_change";

/**
 * Material-drift gate for GPS-triggered broadcasts: a ping only kicks off a
 * recompute pass when the van has moved meaningfully since its last ping.
 * The threshold scales with queue length — each extra queued stop amplifies
 * how a van movement changes downstream ETAs, so a shorter move suffices.
 */
export function isMaterialDrift(
  lastLat: number | null | undefined,
  lastLng: number | null | undefined,
  newLat: number,
  newLng: number,
  queueLength = 1
): boolean {
  if (lastLat == null || lastLng == null) return true; // first fix — always material
  const dLat = (newLat - lastLat) * 111_000; // ~metres per degree latitude
  const cosLat = Math.cos((newLat * Math.PI) / 180);
  const dLng = (newLng - lastLng) * 111_000 * cosLat;
  const distanceM = Math.hypot(dLat, dLng);

  const thresholdM = 200 + Math.max(0, queueLength - 1) * 100;
  return distanceM >= thresholdM;
}

/**
 * Works out the shift's plan again, stores it, and pushes material changes
 * in each patient's ETA. Returns per-request outcomes for logging/tests.
 */
export async function broadcastEtaUpdates(
  shiftId: string,
  opts?: { force?: boolean; forceRequestId?: string }
): Promise<Record<string, EtaPushOutcome>> {
  const outcomes: Record<string, EtaPushOutcome> = {};

  let plan: Awaited<ReturnType<typeof recomputeShiftPlan>>;
  try {
    plan = await recomputeShiftPlan(shiftId);
  } catch (err) {
    console.error("[VAN ETA PUSH] recompute failed:", safeError(err));
    return outcomes;
  }
  // No fix yet: nothing to plan from.
  if (!plan) return outcomes;

  for (const stop of plan.stops) {
    // EB-1: the van is already with this patient.
    if (stop.phase === "on_site" || stop.phase === "in_treatment") {
      outcomes[stop.id] = "no_change";
      continue;
    }

    const etaSeconds = etaSecondsFromPlan(stop, plan.computedAt);
    if (etaSeconds == null) {
      outcomes[stop.id] = "no_change";
      continue;
    }

    const prevEta = stop.lastEtaSeconds;
    const lastPushedAt = stop.lastEtaPushedAt;

    // EB-1: If forceRequestId is passed, force only that request; otherwise respect force flag
    const isForced = opts?.forceRequestId
      ? stop.id === opts.forceRequestId
      : Boolean(opts?.force);

    if (!isForced && prevEta != null && Math.abs(etaSeconds - prevEta) < DRIFT_MINUTES * 60) {
      outcomes[stop.id] = "below_drift";
      continue;
    }
    if (
      !isForced &&
      lastPushedAt &&
      Date.now() - lastPushedAt.getTime() < THROTTLE_MINUTES * 60 * 1000
    ) {
      outcomes[stop.id] = "throttled";
      continue;
    }

    const minutes = Math.max(1, Math.round(etaSeconds / 60));
    const label = minutes < 5 ? "less than 5 minutes" : `around ${minutes} minutes`;

    try {
      await sendPatientNotification(
        stop.patientId,
        "ETA Update",
        `Your mobile dental van is now ${label} away.`,
        { requestId: stop.id, etaSeconds, type: "eta_update" }
      );

      await prisma.vanServiceRequest.update({
        where: { id: stop.id },
        data: { lastEtaSeconds: etaSeconds, lastEtaPushedAt: new Date() },
      });

      outcomes[stop.id] = "pushed";
    } catch (err) {
      console.error("[VAN ETA PUSH] push/persist failed:", safeError(err));
      outcomes[stop.id] = "no_change";
    }
  }

  return outcomes;
}
