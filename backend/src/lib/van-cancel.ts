// backend/src/lib/van-cancel.ts
// A patient cancelling a van visit. One path for the tracking screen
// (POST /api/van/requests/:id/cancel) and the appointment screen
// (POST /api/appointments/:id/cancel), so the rules cannot drift apart (N3).
//
// Runs under the shift lock with a compare-and-set, so a cancel cannot race an
// accept. The deposit is released or kept under the cancellation policy; the
// queue is renumbered; reminders are cleared; every other patient's ETA is
// refreshed.

import { prisma } from "./prisma";
import { releaseVanDeposit, vanCancellationKeepsDeposit } from "./van-payments";
import { renumberQueue } from "./van-queue";
import { recordVanEvent } from "./van-dispatch";
import { cancelAppointmentReminders } from "./background-jobs";
import { broadcastEtaUpdates } from "./van-eta-broadcast";
import { logFailure } from "./best-effort";
import { safeError } from "./log-safety";

export type VanCancelOutcome = {
  status: number;
  body: Record<string, unknown>;
  depositOutcome?: string | null;
  refundId?: string | null;
  /** The request that was cancelled, when it was. */
  cancelled?: { id: string; appointmentId: string | null; shiftId: string };
};

const OPEN = ["pending", "accepted", "in_progress"];

export async function cancelVanRequestForPatient(requestId: string): Promise<VanCancelOutcome> {
  const request = await prisma.vanServiceRequest.findUnique({ where: { id: requestId } });
  if (!request) return { status: 404, body: { error: "Request not found" } };
  if (request.phase === "in_treatment") {
    return { status: 409, body: { error: "Cannot cancel during treatment. Contact support." } };
  }
  if (!OPEN.includes(request.status)) {
    return { status: 409, body: { error: `Request is already ${request.status}` } };
  }

  let outcome: VanCancelOutcome;
  try {
    outcome = await prisma.$transaction(
      async (tx): Promise<VanCancelOutcome> => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${request.shiftId}`}))`;

        const fresh = await tx.vanServiceRequest.findUnique({ where: { id: request.id } });
        if (!fresh || !OPEN.includes(fresh.status)) {
          return { status: 409, body: { error: `Request is already ${fresh?.status ?? "unknown"}` } };
        }
        if (fresh.phase === "in_treatment") {
          return { status: 409, body: { error: "Cannot cancel during treatment. Contact support." } };
        }

        const cancelled = await tx.vanServiceRequest.updateMany({
          where: { id: fresh.id, status: fresh.status, appointmentId: fresh.appointmentId },
          data: { status: "cancelled", phase: "cancelled" },
        });
        if (cancelled.count !== 1) {
          return { status: 409, body: { error: "Request changed while cancelling. Please try again." } };
        }

        const keepsDeposit = vanCancellationKeepsDeposit(fresh.phase);
        let depositOutcome: string | null = null;
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

        await recordVanEvent(tx, { requestId: fresh.id, type: "cancelled", fromPhase: fresh.phase, toPhase: "cancelled", actorRole: "patient" });
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
    // Cancellation shortens everyone else's chain — recompute their ETAs.
    void broadcastEtaUpdates(shiftId).catch((err) =>
      console.error("[VAN ETA PUSH] post-cancel broadcast failed:", safeError(err))
    );
  }
  return outcome;
}
