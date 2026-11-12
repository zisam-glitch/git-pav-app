import { notifyAppointmentChange } from "../lib/patient-email";
import { Router, Response } from "express";
import Stripe from "stripe";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateParams } from "../middleware/validate";
import { appointmentIdParamsSchema } from "../schemas/booking";
import {
  CancellationChannel,
  getCancellationPolicy,
  appointmentRefundPolicy,
} from "../lib/cancellation-policy";
import { releaseVanDeposit } from "../lib/van-payments";
import { cancelAppointmentReminders } from "../lib/background-jobs";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { pseudonymiseIp } from "../lib/audit-security";
import { safeError } from "../lib/log-safety";
import { logFailure } from "../lib/best-effort";
import { runIdempotent } from "../lib/idempotent-handler";

export { appointmentRefundPolicy } from "../lib/cancellation-policy";

const router = Router();
const isMockStripe = env.isMockStripe;
const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as never,
});

/**
 * Unified appointment cancellation handler (CS-18).
 * Closes BK-6 and VR-7.
 */
export async function handleAppointmentCancel(req: AuthRequest, res: Response) {
  const appointmentId = String(req.params.id);

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { id: true },
  });
  if (!profile) return res.status(404).json({ error: "Patient profile not found" });

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, patientId: profile.id },
    include: { vanServiceRequest: true },
  });
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });

  const hoursUntilVisit = (appointment.startTimeUtc.getTime() - Date.now()) / (1000 * 3600);
  const summary = (
    refundAmountPence: number,
    refundPercentage: number,
    stripeRefundId: string | null,
    policyNotice: string
  ) => ({
    appointmentId: appointment.id,
    appointmentStatus: "cancelled",
    hoursUntilVisit: Math.round(hoursUntilVisit * 10) / 10,
    depositPaidPence: appointment.depositPaidPence,
    refundPercentage,
    refundAmountPence,
    stripeRefundId,
    policyNotice,
  });

  if (appointment.status === "cancelled") {
    return res.json(summary(0, 0, null, "Appointment was already cancelled"));
  }

  // Strict allow-list: only confirmed and draft_hold appointments can be cancelled (BK-6)
  if (appointment.status !== "confirmed" && appointment.status !== "draft_hold") {
    return res.status(409).json({ error: `An appointment that is ${appointment.status} cannot be cancelled` });
  }

  // Van visit cancellation (VR-7)
  if (appointment.vanServiceRequest) {
    const vanRequest = appointment.vanServiceRequest;
    if (vanRequest.phase === "in_treatment") {
      return res.status(409).json({ error: "Cannot cancel during treatment. Contact support." });
    }

    const policy = getCancellationPolicy({ channel: "van", phase: vanRequest.phase });
    let stripeRefundId: string | null = null;
    let depositOutcome: string | null = null;

    if (vanRequest.paymentIntentId) {
      const release = await releaseVanDeposit(vanRequest.paymentIntentId, "patient_cancelled", {
        retainCaptured: policy.keepsDeposit,
      });
      depositOutcome = release.status;
      if (release.status === "failed") {
        return res.status(502).json({
          error: "Could not release deposit",
          message: "The payment hold could not be released right now. Please try cancelling again in a moment.",
        });
      }
      if (release.refundId) stripeRefundId = release.refundId;
    }

    await prisma.vanServiceRequest.update({
      where: { id: vanRequest.id },
      data: {
        status: "cancelled",
        phase: "cancelled",
        depositReleaseStatus: depositOutcome,
        depositReleasedAt:
          ["released", "already_released", "refunded", "retained"].includes(depositOutcome ?? "")
            ? new Date()
            : null,
      },
    });

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "cancelled" },
    });

    // Clear pending scheduled reminders for this cancelled van appointment
    await cancelAppointmentReminders(appointment.id);

    const refundAmountPence = policy.keepsDeposit ? 0 : appointment.depositPaidPence;

    await createAuditLogWithIntegrity({
      action: "appointment.cancelled.van",
      actorId: req.user!.sub,
      resourceId: appointment.id,
      sessionId: req.user?.sessionId ?? null,
      ipHash: pseudonymiseIp(req.ip || ""),
      metadata: {
        vanRequestId: vanRequest.id,
        refundPercentage: policy.refundPercentage,
        refundAmountPence,
        stripeRefundId,
      },
    }).catch(logFailure("audit write appointment.cancelled.van"));

    void notifyAppointmentChange("cancelled", appointment.id, { refundPence: refundAmountPence });
    return res.json(summary(refundAmountPence, policy.refundPercentage, stripeRefundId, policy.policyNotice));
  }

  // Clinic & Video visit cancellation
  const { refundPercentage, policyNotice } =
    appointment.status === "draft_hold"
      ? { refundPercentage: 0, policyNotice: "No deposit was taken for this booking." }
      : getCancellationPolicy({
          channel: (appointment.channel as CancellationChannel) || "clinic",
          hoursUntilVisit,
        });

  const refundAmountPence = Math.round((appointment.depositPaidPence * refundPercentage) / 100);

  // Claim status before refunding so a concurrent request cannot race or complete
  // the appointment while a refund is in flight (CS-49)
  const claimed = await prisma.appointment.updateMany({
    where: { id: appointment.id, status: appointment.status },
    data: { status: "cancelled" },
  });
  if (claimed.count === 0) {
    // A concurrent request changed the appointment first.
    const current = await prisma.appointment.findUnique({ where: { id: appointment.id }, select: { status: true } });
    if (current?.status === "cancelled") {
      return res.json(summary(refundAmountPence, refundPercentage, null, policyNotice));
    }
    return res.status(409).json({ error: "The appointment changed while cancelling. Please refresh and try again." });
  }

  // Key refund idempotency by appointment id and amount (CS-49)
  let stripeRefundId: string | null = null;
  if (refundAmountPence > 0) {
    if (!isMockStripe && appointment.stripePaymentId && !appointment.stripePaymentId.startsWith("pi_mock_")) {
      try {
        const refund = await stripe.refunds.create(
          { payment_intent: appointment.stripePaymentId, amount: refundAmountPence, reason: "requested_by_customer" },
          { idempotencyKey: `refund:${appointment.id}:${refundAmountPence}` }
        );
        stripeRefundId = refund.id;
      } catch (refundErr) {
        console.error("[Cancellations] Stripe refund failed:", safeError(refundErr));
        // Never tell a patient they are cancelled and refunded when no refund
        // was made. Put the booking back as it was so they can try again (the
        // same idempotency key makes a retry safe), and leave a record.
        await prisma.appointment
          .updateMany({ where: { id: appointment.id, status: "cancelled" }, data: { status: appointment.status } })
          .catch(logFailure("restore appointment after failed refund"));
        await createAuditLogWithIntegrity({
          action: "appointment.cancel_refund_failed",
          actorId: req.user!.sub,
          resourceId: appointment.id,
          sessionId: req.user?.sessionId ?? null,
          ipHash: pseudonymiseIp(req.ip || ""),
          metadata: { refundAmountPence, paymentIntentId: appointment.stripePaymentId },
        }).catch(logFailure("audit write appointment.cancel_refund_failed"));
        return res.status(502).json({
          error: "Could not refund your deposit",
          message: "We couldn't process your refund just now, so your booking has not been cancelled. Please try again in a moment.",
        });
      }
    } else if (isMockStripe) {
      stripeRefundId = `re_mock_${Date.now()}`;
    }
  }

  // An unpaid hold's PaymentIntent is voided so it can't be paid after the
  // booking is gone. If it was paid a moment ago this fails harmlessly: the
  // webhook sees a cancelled hold and refunds the deposit (late deposit).
  if (
    appointment.status === "draft_hold" &&
    !isMockStripe &&
    appointment.stripePaymentId &&
    !appointment.stripePaymentId.startsWith("pi_mock_")
  ) {
    await stripe.paymentIntents
      .cancel(appointment.stripePaymentId, { cancellation_reason: "abandoned" })
      .catch(logFailure("cancel unpaid PaymentIntent"));
  }

  // Clear pending scheduled reminders for this cancelled appointment (BK-6)
  await cancelAppointmentReminders(appointment.id);

  await createAuditLogWithIntegrity({
    action: "appointment.cancelled",
    actorId: req.user!.sub,
    resourceId: appointment.id,
    sessionId: req.user?.sessionId ?? null,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {
      refundPercentage,
      refundAmountPence,
      stripeRefundId,
      channel: appointment.channel,
    },
  }).catch(logFailure("audit write appointment.cancelled"));

  // An unpaid hold that lapses or is dropped is not a booking the patient knew about.
  if (appointment.status === "confirmed") {
    void notifyAppointmentChange("cancelled", appointment.id, { refundPence: refundAmountPence });
  }
  return res.json(summary(refundAmountPence, refundPercentage, stripeRefundId, policyNotice));
}

// ─── POST /api/booking/appointments/:id/cancel-with-refund ────────────────────
// ─── POST /api/booking/appointments/:id/cancel ────────────────────────────────
// The unified cancel path: both endpoints invoke the same policy and handler (CS-18).
// With an Idempotency-Key, a retry after a lost response gets the first answer (with the real refund) back (D3).
const cancelOnce = (req: AuthRequest, res: Response) => runIdempotent(req, res, "cancel", handleAppointmentCancel);
router.post("/:id/cancel-with-refund", requireAuth, validateParams(appointmentIdParamsSchema), cancelOnce);
router.post("/:id/cancel", requireAuth, validateParams(appointmentIdParamsSchema), cancelOnce);

export default router;
