// backend/src/lib/van-dispatch.ts
// The rules for moving a van visit from one state to the next, in one place.
//
// Before this, six handlers each decided for themselves what a stop may do.
// Now the phase change (and the check-in, which is a phase change) lives here:
// one lock, one table of allowed moves, one compare-and-set, one history entry
// written in the same transaction, and one set of things that follow (the
// patient's push, visit points, everyone's ETA). The accept, decline, cancel,
// expiry and shift-end paths write their history through `recordVanEvent`.

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { encryptField } from "./encryption";
import { renumberQueue } from "./van-queue";
import { awardVisitPoints } from "./rewards";
import { sendPatientNotification } from "./patient-push";
import { broadcastEtaUpdates } from "./van-eta-broadcast";
import { safeError } from "./log-safety";

// ─── History ──────────────────────────────────────────────────────────────

export type VanEventType =
  | "requested"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled"
  | "phase_changed"
  | "checked_in"
  | "shift_ended";

/** Who did it: a role, never a person (the audit log has the person). */
export type VanActorRole = "patient" | "operator" | "staff" | "system";

type Db = Prisma.TransactionClient | typeof prisma;

/**
 * Adds one line to a visit's history. Call it with the transaction that makes
 * the change, so the two cannot disagree.
 */
export async function recordVanEvent(
  db: Db,
  event: {
    requestId: string;
    type: VanEventType;
    fromPhase?: string | null;
    toPhase?: string | null;
    actorRole: VanActorRole;
  }
): Promise<void> {
  await db.vanRequestEvent.create({
    data: {
      requestId: event.requestId,
      type: event.type,
      fromPhase: event.fromPhase ?? null,
      toPhase: event.toPhase ?? null,
      actorRole: event.actorRole,
    },
  });
}

// ─── Phase rules ──────────────────────────────────────────────────────────

/** VR-3: the only moves a stop may make. Anything else is refused. */
export const PHASE_TRANSITIONS: Record<string, string[]> = {
  queued: ["en_route"],
  en_route: ["on_site"],
  on_site: ["in_treatment", "no_show"],
  in_treatment: ["completed"],
};

/** The van has parked at a patient it never set off for (a check-in). */
const CHECK_IN_SKIPS = { queued: ["on_site"] } as const;

export type PhaseCheck = { ok: true } | { ok: false; message: string };

/** Whether a stop may move from one phase to another. Pure. */
export function checkPhaseChange(from: string, to: string, opts: { viaCheckIn?: boolean } = {}): PhaseCheck {
  const allowed = [
    ...(PHASE_TRANSITIONS[from] ?? []),
    ...(opts.viaCheckIn ? (CHECK_IN_SKIPS as Record<string, readonly string[]>)[from] ?? [] : []),
  ];
  if (allowed.includes(to)) return { ok: true };
  return {
    ok: false,
    message: `Cannot transition stop from '${from}' to '${to}'. Allowed next phases: ${allowed.join(", ") || "none (terminal state)"}`,
  };
}

/** The request status that goes with a phase. */
export function statusForPhase(phase: string): "in_progress" | "completed" | "no_show" {
  if (phase === "completed") return "completed";
  if (phase === "no_show") return "no_show";
  return "in_progress";
}

/** What the patient is told at each phase. Pure. */
export const PHASE_MESSAGES: Record<string, { title: string; body: string }> = {
  en_route: { title: "Van is On the Way", body: "The dental van is now en route to your location." },
  on_site: {
    title: "Van Has Arrived",
    body: "The dental van has arrived at your location. Please be ready for your appointment.",
  },
  completed: { title: "Visit Completed", body: "Your van visit has been completed. Thank you for choosing Pav Dental." },
  no_show: {
    title: "Missed Appointment",
    body: "Our van arrived but you were not available. Please contact us to reschedule.",
  },
};

// ─── The phase change ─────────────────────────────────────────────────────

export type PhaseChangeResult = { status: number; body: Record<string, unknown> };

type TxOutcome =
  | PhaseChangeResult
  | { status: 200; body: Record<string, unknown>; changed: true; patientId: string; appointmentId: string | null };

/**
 * Moves one stop to a new phase.
 *
 * Safe to repeat: under the shift lock, a compare-and-set means two taps at
 * once change the stop once; the repeat returns the current state and sends
 * nothing. Only the first stop in the queue may set off. Treatment start and
 * finish stamp the appointment's real times. The history entry is written in
 * the same transaction.
 */
export async function changeVanPhase(opts: {
  shiftId: string;
  requestId: string;
  phase: string;
  notes?: string | null;
  actorRole: VanActorRole;
  viaCheckIn?: boolean;
}): Promise<PhaseChangeResult> {
  const { shiftId, requestId, phase, actorRole } = opts;
  const now = new Date();
  const closing = phase === "completed" || phase === "no_show";
  const encryptedNotes = closing && opts.notes ? JSON.stringify(await encryptField(opts.notes)) : null;

  const outcome: TxOutcome = await prisma.$transaction(
    async (tx): Promise<TxOutcome> => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${shiftId}`}))`;

      const request = await tx.vanServiceRequest.findUnique({ where: { id: requestId } });
      if (!request) return { status: 404, body: { error: "Request not found" } };
      if (request.shiftId !== shiftId) return { status: 403, body: { error: "Request not on your shift" } };

      // A repeat of a change that already went through: report it, do nothing.
      if (request.phase === phase && ["accepted", "in_progress", "completed", "no_show"].includes(request.status)) {
        return { status: 200, body: request };
      }
      if (!["accepted", "in_progress"].includes(request.status)) {
        return { status: 409, body: { error: `Cannot update phase for status: ${request.status}` } };
      }

      const check = checkPhaseChange(request.phase, phase, { viaCheckIn: opts.viaCheckIn });
      if (!check.ok) return { status: 409, body: { error: "Illegal phase transition", message: check.message } };

      // The van drives to one patient at a time, in queue order.
      if (phase === "en_route" && request.queuePosition != null) {
        const ahead = await tx.vanServiceRequest.count({
          where: { shiftId, status: { in: ["accepted", "in_progress"] }, queuePosition: { lt: request.queuePosition } },
        });
        if (ahead > 0) {
          return { status: 409, body: { error: "Earlier stops first", message: "Finish or cancel the stops ahead of this one before setting off." } };
        }
      }

      const data: Prisma.VanServiceRequestUpdateManyMutationInput = { phase: phase as never, status: statusForPhase(phase) };
      if (phase === "in_treatment") data.treatmentStartedAt = now;
      if (closing) {
        data.completedAt = now;
        if (encryptedNotes) data.notes = encryptedNotes;
      }

      const claimed = await tx.vanServiceRequest.updateMany({
        where: { id: request.id, phase: request.phase, status: request.status },
        data,
      });
      if (claimed.count !== 1) {
        return { status: 409, body: { error: "Request changed while updating. Refresh and try again." } };
      }

      // The booking behind the visit follows the real times.
      if (request.appointmentId) {
        if (phase === "in_treatment") {
          const service = await tx.service.findUnique({ where: { id: request.serviceId }, select: { durationMinutes: true } });
          await tx.appointment.updateMany({
            where: { id: request.appointmentId, status: { in: ["confirmed", "in_progress"] } },
            data: {
              status: "in_progress",
              startTimeUtc: now,
              endTimeUtc: new Date(now.getTime() + (service?.durationMinutes ?? 45) * 60 * 1000),
            },
          });
        } else if (closing) {
          await tx.appointment.updateMany({
            where: { id: request.appointmentId, status: { in: ["confirmed", "in_progress"] } },
            data: phase === "completed" ? { status: "completed", endTimeUtc: now } : { status: "no_show" },
          });
        }
      }

      await recordVanEvent(tx, {
        requestId: request.id,
        type: opts.viaCheckIn ? "checked_in" : "phase_changed",
        fromPhase: request.phase,
        toPhase: phase,
        actorRole,
      });

      if (closing) await renumberQueue(tx, shiftId, "queue_position");

      return {
        status: 200,
        body: await tx.vanServiceRequest.findUniqueOrThrow({ where: { id: request.id } }),
        changed: true,
        patientId: request.patientId,
        appointmentId: request.appointmentId,
      };
    },
    { maxWait: 10_000, timeout: 30_000 }
  );

  if (!("changed" in outcome)) return outcome;

  // After the change: points for a finished visit (a failure is caught up by
  // the background sweep), the patient's push, and everyone's ETA.
  if (phase === "completed" && outcome.appointmentId) {
    await awardVisitPoints(outcome.appointmentId).catch((err) => {
      console.error("[Van] Visit points award failed:", err instanceof Error ? err.name : "unknown error");
    });
  }
  const message = PHASE_MESSAGES[phase];
  if (message) await sendPatientNotification(outcome.patientId, message.title, message.body, { requestId, phase });

  void broadcastEtaUpdates(shiftId).catch((err) =>
    console.error("[VAN ETA PUSH] post-phase broadcast failed:", safeError(err))
  );

  return { status: outcome.status, body: outcome.body };
}
