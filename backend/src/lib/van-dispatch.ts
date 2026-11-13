// backend/src/lib/van-dispatch.ts
// The rules for moving a van visit from one state to the next, in one place.
//
// Before this, six handlers each decided for themselves what a stop may do.
// Now the phase change (and the check-in, which is a phase change) lives here:
// one lock, one table of allowed moves, one compare-and-set, one history entry
// written in the same transaction, and one set of things that follow (the
// patient's push, visit points, everyone's ETA). Accept, decline, the time-out,
// the patient's cancel and the end of a shift live here too, under the same
// lock, each with its rule as a pure function.

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { encryptField } from "./encryption";
import { renumberQueue } from "./van-queue";
import { awardVisitPoints } from "./rewards";
import { sendPatientNotification } from "./patient-push";
import { broadcastEtaUpdates } from "./van-eta-broadcast";
import { safeError } from "./log-safety";
import { MAX_QUEUE_DEPTH } from "./van-eta";
import {
  captureVanDeposit,
  isDepositAuthorized,
  isMockStripe,
  releaseVanDeposit,
  VanDepositReleaseReason,
  VanDepositReleaseStatus,
  vanCancellationKeepsDeposit,
} from "./van-payments";
import { cancelAppointmentReminders } from "./background-jobs";
import { logFailure } from "./best-effort";

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

export type DispatchResult = { status: number; body: Record<string, unknown> };
export type PhaseChangeResult = DispatchResult;

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

// ─── Accept and decline ───────────────────────────────────────────────────

export type VanDecision = "accept" | "decline";

export type DecisionCheck =
  | { kind: "go" }
  | { kind: "repeat" }
  | { kind: "refuse"; error: string; message?: string };

const DECIDED_STATUS: Record<VanDecision, string> = { accept: "accepted", decline: "declined" };

/**
 * Whether a request may be accepted or declined. Pure.
 *
 * Only a pending request can be answered. The same answer given twice is a
 * repeat (a second tap, or a retry after a lost response), not an error. A
 * request whose time has run out can be declined but not accepted.
 */
export function checkDecision(
  request: { status: string; appointmentId: string | null; expiresAt: Date | null },
  decision: VanDecision,
  now: Date
): DecisionCheck {
  if (request.status === DECIDED_STATUS[decision]) {
    // An accept only counts as done once its appointment exists.
    if (decision === "decline" || request.appointmentId) return { kind: "repeat" };
  }
  if (request.status !== "pending") return { kind: "refuse", error: `Request is already ${request.status}` };
  if (decision === "accept" && request.expiresAt && now > request.expiresAt) {
    return { kind: "refuse", error: "Request expired", message: "This request has expired. The patient may submit a new request." };
  }
  return { kind: "go" };
}

// ─── A request that ends without an accept ────────────────────────────────

/** The three ways a pending request ends without a van taking it. */
export type PendingClose = "declined" | "expired" | "shift_ended";

const PENDING_CLOSES: Record<
  PendingClose,
  { status: "declined" | "expired"; releaseReason: VanDepositReleaseReason; title: string; lead: string }
> = {
  declined: {
    status: "declined",
    releaseReason: "operator_declined",
    title: "Van Request Declined",
    lead: "Unfortunately, your van visit request could not be accommodated at this time.",
  },
  expired: {
    status: "expired",
    releaseReason: "expired",
    title: "Van Request Expired",
    lead: "No operator accepted your van request in time, so it has expired.",
  },
  shift_ended: {
    status: "expired",
    releaseReason: "shift_ended",
    title: "Van Went Offline",
    lead: "The van has ended its shift before accepting your request.",
  },
};

/** What the patient is told when their request ends without an accept. Pure. */
export function pendingCloseMessage(how: PendingClose, releaseStatus: VanDepositReleaseStatus | null): { title: string; body: string } {
  const { title, lead } = PENDING_CLOSES[how];
  const deposit = releaseStatus === "failed" ? "We are releasing your deposit hold." : "No deposit was taken — please try again later.";
  return { title, body: `${lead} ${deposit}` };
}

/** What the patient is told when a van cannot take their request. Pure. */
export function declineMessage(releaseStatus: VanDepositReleaseStatus | null): string {
  return pendingCloseMessage("declined", releaseStatus).body;
}

/** A hold that is known to be gone, so the release needs no retry. */
const HOLD_LIFTED: VanDepositReleaseStatus[] = ["released", "already_released", "refunded", "mock"];

type ClosedPending = { releaseStatus: VanDepositReleaseStatus | null; updated: Record<string, unknown> };

/**
 * Ends a pending request without an accept. Call it inside the shift lock.
 *
 * One compare-and-set from pending, one release of the deposit hold, one
 * history entry. Returns null when the request was no longer pending, and
 * then nothing was released or recorded. A release that fails is stored as
 * failed and retried by the background job; it never blocks the close.
 */
async function closePendingRequest(
  tx: Prisma.TransactionClient,
  request: { id: string; paymentIntentId: string | null },
  how: PendingClose,
  actorRole: VanActorRole
): Promise<ClosedPending | null> {
  const { status, releaseReason } = PENDING_CLOSES[how];
  const claimed = await tx.vanServiceRequest.updateMany({ where: { id: request.id, status: "pending" }, data: { status } });
  if (claimed.count !== 1) return null;

  let releaseStatus: VanDepositReleaseStatus | null = null;
  if (request.paymentIntentId) {
    releaseStatus = (await releaseVanDeposit(request.paymentIntentId, releaseReason)).status;
  }
  const updated = await tx.vanServiceRequest.update({
    where: { id: request.id },
    data: {
      depositReleaseStatus: releaseStatus,
      depositReleasedAt: releaseStatus && HOLD_LIFTED.includes(releaseStatus) ? new Date() : null,
    },
  });
  await recordVanEvent(tx, { requestId: request.id, type: how, actorRole });
  return { releaseStatus, updated };
}

/** Tells the patient their request ended without an accept. Never throws. */
async function notifyPendingClosed(patientId: string, requestId: string, how: PendingClose, releaseStatus: VanDepositReleaseStatus | null) {
  const { title, body } = pendingCloseMessage(how, releaseStatus);
  await sendPatientNotification(patientId, title, body, { requestId, status: PENDING_CLOSES[how].status }).catch(() => {});
}

const refusal = (check: { error: string; message?: string }): DispatchResult => ({
  status: 409,
  body: check.message ? { error: check.error, message: check.message } : { error: check.error },
});

type DecisionOutcome = DispatchResult | (DispatchResult & { changed: true; patientId: string });

/**
 * Accepts a pending request onto a shift.
 *
 * Safe to tap twice or retry (VR-1). Answers on one shift run one at a time
 * under the shift lock, so the queue-depth check and position cannot race. The
 * request moves pending -> accepted with a compare-and-set in the same
 * transaction that creates the appointment and writes the history, so exactly
 * one appointment exists. The deposit capture is keyed per request, and an
 * intent already captured counts as captured, so a retry after a lost
 * response succeeds. A paused shift accepts nothing.
 */
export async function acceptVanRequest(opts: { shiftId: string; requestId: string; actorRole: VanActorRole }): Promise<DispatchResult> {
  const { shiftId, requestId, actorRole } = opts;

  const outcome: DecisionOutcome = await prisma.$transaction(
    async (tx): Promise<DecisionOutcome> => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${shiftId}`}))`;

      // Read under the lock: the shift may have been paused or ended since the caller looked.
      const shift = await tx.vanShift.findUnique({ where: { id: shiftId }, select: { status: true, endedAt: true } });
      if (!shift || shift.endedAt || shift.status === "offline") return { status: 404, body: { error: "No active shift" } };
      if (shift.status === "paused") return { status: 409, body: { error: "Shift is paused. Resume before accepting." } };

      const request = await tx.vanServiceRequest.findUnique({ where: { id: requestId } });
      if (!request) return { status: 404, body: { error: "Request not found" } };
      if (request.shiftId !== shiftId) return { status: 403, body: { error: "Request not on your shift" } };

      const now = new Date();
      const check = checkDecision(request, "accept", now);
      if (check.kind === "repeat") return { status: 200, body: request };
      if (check.kind === "refuse") return refusal(check);

      const acceptedCount = await tx.vanServiceRequest.count({
        where: { shiftId, status: { in: ["accepted", "in_progress"] } },
      });
      if (acceptedCount >= MAX_QUEUE_DEPTH) {
        return { status: 409, body: { error: "Queue full", message: `Maximum ${MAX_QUEUE_DEPTH} stops allowed.` } };
      }

      const service = await tx.service.findUnique({ where: { id: request.serviceId } });
      if (!service) return { status: 404, body: { error: "Service not found" } };

      if (request.paymentIntentId && !isMockStripe) {
        const captureFailure = await captureVanDeposit(request.id, request.paymentIntentId);
        if (captureFailure) return captureFailure;
      } else if (request.paymentIntentId && !(await isDepositAuthorized(request.paymentIntentId, request.depositAuthorizedAt))) {
        // Mock payments still need a hold, so tests can catch an accept without one (N24).
        return { status: 409, body: { error: "Deposit not authorized", message: "The patient has not authorized the deposit yet." } };
      }

      const claimed = await tx.vanServiceRequest.updateMany({
        where: { id: request.id, status: "pending" },
        data: { status: "accepted", phase: "queued", queuePosition: acceptedCount + 1, acceptedAt: now },
      });
      if (claimed.count !== 1) return { status: 409, body: { error: "Request changed while accepting. Refresh and try again." } };

      const etaSeconds = request.etaSecondsSnapshot || 1800; // 30 minutes when there is no snapshot
      const startTime = new Date(now.getTime() + etaSeconds * 1000);
      const appointment = await tx.appointment.create({
        data: {
          patientId: request.patientId,
          serviceId: request.serviceId,
          channel: "van",
          vanId: request.vanId,
          startTimeUtc: startTime,
          endTimeUtc: new Date(startTime.getTime() + service.durationMinutes * 60 * 1000),
          status: "confirmed",
          accessDetails: request.accessDetails as Prisma.InputJsonValue,
          totalPricePence: service.pricePence,
          depositPaidPence: request.paymentIntentId ? service.depositPence : 0,
          stripePaymentId: request.paymentIntentId,
        },
      });
      await tx.vanServiceRequest.update({ where: { id: request.id }, data: { appointmentId: appointment.id } });
      await renumberQueue(tx, shiftId, "accepted_at");
      await recordVanEvent(tx, { requestId: request.id, type: "accepted", fromPhase: "queued", toPhase: "queued", actorRole });

      return {
        status: 200,
        body: await tx.vanServiceRequest.findUniqueOrThrow({ where: { id: request.id } }),
        changed: true,
        patientId: request.patientId,
      };
    },
    // Holds the lock across the Stripe capture; a timeout rolls back and the
    // retry finds the deposit already captured.
    { maxWait: 10_000, timeout: 30_000 }
  );

  if (!("changed" in outcome)) return outcome;

  await sendPatientNotification(
    outcome.patientId,
    "Van Request Accepted",
    "Your van visit request has been accepted. The van is on its way!",
    { requestId, status: "accepted" }
  );

  // Seed the patient's first live ETA at once (past the drift and throttle
  // gates), for the newly accepted request only (EB-1).
  void broadcastEtaUpdates(shiftId, { forceRequestId: requestId }).catch((err) =>
    console.error("[VAN ETA PUSH] post-accept broadcast failed:", safeError(err))
  );

  return { status: outcome.status, body: outcome.body };
}

/**
 * Declines a pending request and lifts the deposit hold.
 *
 * Runs under the same lock as accept with a compare-and-set, so the two
 * cannot both win (CS-49). Safe to repeat: a second tap returns the declined
 * request and releases, records and sends nothing again.
 */
export async function declineVanRequest(opts: { shiftId: string; requestId: string; actorRole: VanActorRole }): Promise<DispatchResult> {
  const { shiftId, requestId, actorRole } = opts;

  const outcome: DecisionOutcome = await prisma.$transaction(
    async (tx): Promise<DecisionOutcome> => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${shiftId}`}))`;

      const request = await tx.vanServiceRequest.findUnique({ where: { id: requestId } });
      if (!request) return { status: 404, body: { error: "Request not found" } };
      if (request.shiftId !== shiftId) return { status: 403, body: { error: "Request not on your shift" } };

      const check = checkDecision(request, "decline", new Date());
      if (check.kind === "repeat") return { status: 200, body: { ...request, releaseStatus: request.depositReleaseStatus } };
      if (check.kind === "refuse") return refusal(check);

      const closed = await closePendingRequest(tx, request, "declined", actorRole);
      if (!closed) return { status: 409, body: { error: "Request changed while declining" } };

      return { status: 200, body: { ...closed.updated, releaseStatus: closed.releaseStatus }, changed: true, patientId: request.patientId };
    },
    { maxWait: 10_000, timeout: 30_000 }
  );

  if (!("changed" in outcome)) return outcome;

  await notifyPendingClosed(outcome.patientId, requestId, "declined", (outcome.body.releaseStatus as VanDepositReleaseStatus | null) ?? null);

  return { status: outcome.status, body: outcome.body };
}

// ─── Time-out ─────────────────────────────────────────────────────────────

/**
 * Times out a pending request nobody answered, and lifts the deposit hold.
 *
 * Under the shift lock with a compare-and-set, so it cannot race an accept or
 * a decline (CS-49). Returns whether it timed the request out: false when it
 * was answered first, or its time has not run out.
 */
export async function expireVanRequest(requestId: string, now: Date = new Date()): Promise<boolean> {
  const seen = await prisma.vanServiceRequest.findUnique({ where: { id: requestId }, select: { shiftId: true } });
  if (!seen?.shiftId) return false;

  const closed = await prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${seen.shiftId}`}))`;
      const request = await tx.vanServiceRequest.findUnique({ where: { id: requestId } });
      if (!request || request.status !== "pending" || !request.expiresAt || request.expiresAt > now) return null;
      const result = await closePendingRequest(tx, request, "expired", "system");
      return result && { patientId: request.patientId, releaseStatus: result.releaseStatus };
    },
    { maxWait: 10_000, timeout: 30_000 }
  );
  if (!closed) return false;

  await notifyPendingClosed(closed.patientId, requestId, "expired", closed.releaseStatus);
  return true;
}

// ─── The patient cancels ──────────────────────────────────────────────────

const CANCELLABLE = ["pending", "accepted", "in_progress"];

/**
 * Whether a van visit may be cancelled. Pure.
 *
 * Allowed until treatment starts. Cancelling a visit that is already
 * cancelled is a repeat, not an error.
 */
export function checkCancel(request: { status: string; phase: string | null }): DecisionCheck {
  if (request.status === "cancelled") return { kind: "repeat" };
  if (request.phase === "in_treatment") return { kind: "refuse", error: "Cannot cancel during treatment. Contact support." };
  if (!CANCELLABLE.includes(request.status)) return { kind: "refuse", error: `Request is already ${request.status}` };
  return { kind: "go" };
}

export type VanCancelOutcome = {
  status: number;
  body: Record<string, unknown>;
  depositOutcome?: string | null;
  refundId?: string | null;
  /** The request that was cancelled, when this call cancelled it. */
  cancelled?: { id: string; appointmentId: string | null; shiftId: string };
};

/**
 * Cancels a van visit for the patient. One path for the tracking screen and
 * the appointment screen, so the rules cannot drift apart (N3).
 *
 * Under the shift lock with a compare-and-set, so a cancel cannot race an
 * accept. The deposit is released or kept under the cancellation policy; a
 * release that fails undoes the cancel so the patient can try again. The
 * queue closes up, reminders are cleared and every other patient's ETA is
 * refreshed. Safe to repeat: a second tap returns the cancelled visit and
 * releases, records and sends nothing again.
 */
export async function cancelVanRequest(requestId: string, actorRole: VanActorRole = "patient"): Promise<VanCancelOutcome> {
  const request = await prisma.vanServiceRequest.findUnique({ where: { id: requestId } });
  if (!request) return { status: 404, body: { error: "Request not found" } };

  const repeatOf = (r: { depositReleaseStatus: string | null }): VanCancelOutcome => ({
    status: 200,
    body: { ...r, depositOutcome: r.depositReleaseStatus, depositRetained: r.depositReleaseStatus === "retained" },
    depositOutcome: r.depositReleaseStatus,
  });

  const first = checkCancel(request);
  if (first.kind === "repeat") return repeatOf(request);
  if (first.kind === "refuse") return refusal(first);

  let outcome: VanCancelOutcome;
  try {
    outcome = await prisma.$transaction(
      async (tx): Promise<VanCancelOutcome> => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${request.shiftId}`}))`;

        const fresh = await tx.vanServiceRequest.findUnique({ where: { id: request.id } });
        if (!fresh) return { status: 404, body: { error: "Request not found" } };
        const check = checkCancel(fresh);
        if (check.kind === "repeat") return repeatOf(fresh);
        if (check.kind === "refuse") return refusal(check);

        const cancelled = await tx.vanServiceRequest.updateMany({
          where: { id: fresh.id, status: fresh.status, appointmentId: fresh.appointmentId },
          data: { status: "cancelled", phase: "cancelled" },
        });
        if (cancelled.count !== 1) {
          return { status: 409, body: { error: "Request changed while cancelling. Please try again." } };
        }

        const keepsDeposit = vanCancellationKeepsDeposit(fresh.phase);
        let depositOutcome: VanDepositReleaseStatus | null = null;
        let refundId: string | null = null;
        if (fresh.paymentIntentId) {
          const release = await releaseVanDeposit(fresh.paymentIntentId, "patient_cancelled", {
            retainCaptured: keepsDeposit,
          });
          depositOutcome = release.status;
          refundId = release.refundId ?? null;
          if (release.status === "failed") throw new Error("Could not release deposit");
        }

        const updated = await tx.vanServiceRequest.update({
          where: { id: fresh.id },
          data: {
            depositReleaseStatus: depositOutcome,
            depositReleasedAt: ["released", "already_released", "refunded", "retained"].includes(depositOutcome ?? "")
              ? new Date()
              : null,
          },
        });

        await recordVanEvent(tx, { requestId: fresh.id, type: "cancelled", fromPhase: fresh.phase, toPhase: "cancelled", actorRole });
        if (fresh.appointmentId) {
          await tx.appointment.updateMany({ where: { id: fresh.appointmentId }, data: { status: "cancelled" } });
        }
        if (fresh.status === "accepted" || fresh.status === "in_progress") {
          await renumberQueue(tx, fresh.shiftId, "queue_position");
        }

        return {
          status: 200,
          body: { ...updated, depositOutcome, depositRetained: depositOutcome === "retained" },
          depositOutcome,
          refundId,
          cancelled: { id: fresh.id, appointmentId: fresh.appointmentId, shiftId: fresh.shiftId },
        };
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Could not release deposit") {
      return {
        status: 502,
        body: {
          error: "Could not release deposit",
          message: "The payment hold could not be released right now. Please try cancelling again in a moment.",
        },
      };
    }
    throw err;
  }

  if (outcome.cancelled) {
    const { appointmentId, shiftId } = outcome.cancelled;
    if (appointmentId) await cancelAppointmentReminders(appointmentId).catch(logFailure("reminder cancellation"));
    // A cancel shortens everyone else's wait.
    void broadcastEtaUpdates(shiftId).catch((err) =>
      console.error("[VAN ETA PUSH] post-cancel broadcast failed:", safeError(err))
    );
  }
  return outcome;
}

// ─── End of a shift ───────────────────────────────────────────────────────

type VanShiftRow = Awaited<ReturnType<typeof prisma.vanShift.update>>;

export type EndVanShiftResult =
  | { ended: true; shift: VanShiftRow; expiredRequests: number; failedReleases: string[] }
  | { ended: false; openStops: number };

/**
 * Ends a van shift. One path for the operator ending their own shift and for
 * staff ending one that was left running.
 *
 * Stops already accepted or under way block it: those patients are waiting
 * with a deposit taken, so someone has to complete or cancel them first. That
 * check, the closing of every pending request and the shift going offline all
 * happen under the shift lock in one transaction, so an accept can land
 * before the end (and block it) or after it (and be refused), never in
 * between. A failed release is reported but never blocks the end; the
 * background job retries it. Ending a shift that has already ended changes
 * nothing.
 */
export async function endVanShift(shift: { id: string }): Promise<EndVanShiftResult> {
  const closedRequests: { id: string; patientId: string; releaseStatus: VanDepositReleaseStatus | null }[] = [];

  const result = await prisma.$transaction(
    async (tx): Promise<{ ended: true; shift: VanShiftRow } | { ended: false; openStops: number }> => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${shift.id}`}))`;

      const current = await tx.vanShift.findUniqueOrThrow({ where: { id: shift.id } });
      if (current.endedAt) return { ended: true, shift: current };

      const openStops = await tx.vanServiceRequest.count({
        where: { shiftId: shift.id, status: { in: ["accepted", "in_progress"] } },
      });
      if (openStops > 0) return { ended: false, openStops };

      const pendingRequests = await tx.vanServiceRequest.findMany({
        where: { shiftId: shift.id, status: "pending" },
        select: { id: true, patientId: true, paymentIntentId: true },
      });
      for (const pending of pendingRequests) {
        const closed = await closePendingRequest(tx, pending, "shift_ended", "system");
        if (closed) closedRequests.push({ id: pending.id, patientId: pending.patientId, releaseStatus: closed.releaseStatus });
      }

      return { ended: true, shift: await tx.vanShift.update({ where: { id: shift.id }, data: { status: "offline", endedAt: new Date() } }) };
    },
    { maxWait: 10_000, timeout: 30_000 }
  );
  if (!result.ended) return result;

  // After the commit, so nobody is told about an end that was rolled back.
  for (const closed of closedRequests) {
    await notifyPendingClosed(closed.patientId, closed.id, "shift_ended", closed.releaseStatus);
  }
  const failedReleases = closedRequests.filter((c) => c.releaseStatus === "failed").map((c) => c.id);
  if (failedReleases.length > 0) {
    console.error(`[VAN SHIFT END] Failed to release deposits for requests: ${failedReleases.join(", ")}`);
  }
  return { ended: true, shift: result.shift, expiredRequests: closedRequests.length, failedReleases };
}
