import { Request, Response, Router } from "express";
import Stripe from "stripe";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { pseudonymiseIp } from "../lib/audit-security";
import { refundLateDeposit } from "../lib/late-deposit";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createPaymentIntentSchema } from "../schemas/payments";
import { scheduleAppointmentReminderLadder } from "../lib/background-jobs";
import { sendPatientNotification } from "../lib/patient-push";
import { applyDepositVoucher, depositDuePence } from "../lib/rewards";
import { customerEphemeralKey, ensureStripeCustomer } from "../lib/stripe-customer";
import { releaseVanDeposit } from "../lib/van-payments";
import { safeError } from "../lib/log-safety";
import { logFailure } from "../lib/best-effort";

const router = Router();
const isMockStripe = env.isMockStripe;
const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as never,
});


// The server derives the deposit from the appointment's service. A mobile client
// can never submit an amount, currency, or payment confirmation.
router.post("/create-intent", requireAuth, validateBody(createPaymentIntentSchema), async (req: AuthRequest, res: Response) => {
  const { appointmentId, voucherCode } = req.body as { appointmentId: string; voucherCode?: string };

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { id: true },
  });
  if (!profile) return res.status(404).json({ error: "Patient profile not found" });

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientId: profile.id,
      status: "draft_hold",
      holdExpiresAt: { gt: new Date() },
    },
    include: { service: { select: { depositPence: true, name: true } } },
  });
  if (!appointment) return res.status(404).json({ error: "Active appointment hold not found" });

  if (voucherCode && appointment.depositDiscountPence === 0) {
    const applied = await applyDepositVoucher({ userId: req.user!.sub, appointment, voucherCode });
    if (!applied.ok) return res.status(422).json({ error: applied.error });
    appointment.depositDiscountPence = applied.discountPence;
  }
  const amountPence = depositDuePence(appointment);

  if (isMockStripe) {
    const paymentIntentId = `pi_mock_${appointment.id.replaceAll("-", "")}`;
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { stripePaymentId: paymentIntentId },
    });
    return res.json({
      clientSecret: `${paymentIntentId}_secret_mock`,
      paymentIntentId,
      publishableKey: env.stripePublishableKey,
      amountPence,
      discountPence: appointment.depositDiscountPence,
      customerId: null,
      customerEphemeralKeySecret: null,
      isMock: true,
    });
  }

  // The amount is part of the key: a voucher added after a first attempt
  // needs a new PaymentIntent for the lower amount.
  // Paying as the patient's Stripe Customer lets the sheet offer their saved
  // cards, and a "save this card" box they can tick (decisions log #15).
  const customerId = await ensureStripeCustomer(stripe, req.user!.sub);
  if (!customerId) return res.status(404).json({ error: "Patient profile not found" });
  const customerEphemeralKeySecret = await customerEphemeralKey(stripe, customerId);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountPence,
    currency: "gbp",
    customer: customerId,
    metadata: {
      appointmentId: appointment.id,
      patientUserId: req.user!.sub,
      serviceName: appointment.service.name,
    },
    automatic_payment_methods: { enabled: true },
  }, { idempotencyKey: `appointment-deposit:${appointment.id}:${amountPence}:${customerId}` });

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { stripePaymentId: paymentIntent.id },
  });

  return res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    publishableKey: env.stripePublishableKey,
    amountPence,
    discountPence: appointment.depositDiscountPence,
    customerId,
    customerEphemeralKeySecret,
    isMock: false,
  });
});

// ─── POST /api/payments/setup-intent ──────────────────────────────────────────
// Creates a Stripe SetupIntent for saving a card without charging.
// The mobile app uses the client_secret with Stripe's CardField to tokenise
// the card locally — raw PANs never reach our server.
router.post("/setup-intent", requireAuth, async (req: AuthRequest, res: Response) => {
  if (isMockStripe) {
    return res.json({
      clientSecret: `seti_mock_${req.user!.sub}_secret_mock`,
      isMock: true,
    });
  }

  const stripeCustomerId = await ensureStripeCustomer(stripe, req.user!.sub);
  if (!stripeCustomerId) return res.status(404).json({ error: "Patient profile not found" });

  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    usage: "on_session",
    metadata: { userId: req.user!.sub },
  });

  return res.json({ clientSecret: setupIntent.client_secret, isMock: false });
});

// ─── POST /api/payments/methods/attach ────────────────────────────────────────
// After confirmSetupIntent succeeds on the device, the app sends us the
// resulting paymentMethodId so we can store it for display in the methods list.
router.post("/methods/attach", requireAuth, async (req: AuthRequest, res: Response) => {
  const { paymentMethodId } = req.body as { paymentMethodId?: string };
  if (!paymentMethodId || typeof paymentMethodId !== "string") {
    return res.status(400).json({ error: "paymentMethodId is required" });
  }

  if (isMockStripe) {
    return res.json({ success: true, isMock: true });
  }

  // Retrieve details from Stripe so we can display brand/last4 etc.
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { stripeCustomerId: true },
  });
  const pmCustomerId = typeof pm.customer === "string" ? pm.customer : pm.customer?.id;
  // Only a card already saved to this patient's own Customer can be listed.
  if (!pmCustomerId || !profile?.stripeCustomerId || pmCustomerId !== profile.stripeCustomerId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const card = pm.card;
  if (!card) {
    return res.status(400).json({ error: "PaymentMethod is not a card" });
  }

  // Store in DB (upsert by paymentMethodId to handle retries)
  await prisma.savedPaymentMethod.upsert({
    where: { stripePaymentMethodId: paymentMethodId },
    update: {},
    create: {
      stripePaymentMethodId: paymentMethodId,
      userId: req.user!.sub,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      isDefault: false,
    },
  });

  return res.json({ success: true });
});

// ─── GET /api/payments/methods ────────────────────────────────────────────────
// Returns the user's saved payment methods for display in the profile screen.
router.get("/methods", requireAuth, async (req: AuthRequest, res: Response) => {
  // Cards saved while paying a deposit are attached in Stripe, not here, so
  // the list follows the patient's Customer in Stripe (decisions log #15).
  if (!isMockStripe) {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.sub },
      select: { stripeCustomerId: true },
    });
    if (profile?.stripeCustomerId) {
      await syncSavedCards(req.user!.sub, profile.stripeCustomerId);
    }
  }

  const methods = await prisma.savedPaymentMethod.findMany({
    where: { userId: req.user!.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return res.json(
    methods.map((m) => ({
      id: m.id,
      brand: m.brand,
      last4: m.last4,
      expMonth: m.expMonth,
      expYear: m.expYear,
      isDefault: m.isDefault,
    }))
  );
});

async function syncSavedCards(userId: string, customerId: string) {
  const cards = await stripe.customers.listPaymentMethods(customerId, { type: "card", limit: 100 });
  const ids = cards.data.map((pm) => pm.id);
  for (const pm of cards.data) {
    if (!pm.card) continue;
    await prisma.savedPaymentMethod.upsert({
      where: { stripePaymentMethodId: pm.id },
      update: { expMonth: pm.card.exp_month, expYear: pm.card.exp_year },
      create: {
        stripePaymentMethodId: pm.id,
        userId,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        isDefault: false,
      },
    });
  }
  // Cards removed in Stripe (or by the sheet) disappear from the list too.
  await prisma.savedPaymentMethod.deleteMany({ where: { userId, stripePaymentMethodId: { notIn: ids } } });
}

// ─── PATCH /api/payments/methods/:id/default ──────────────────────────────────
router.patch("/methods/:id/default", requireAuth, async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);

  const method = await prisma.savedPaymentMethod.findFirst({
    where: { id, userId: req.user!.sub },
  });
  if (!method) return res.status(404).json({ error: "Payment method not found" });

  // Also Stripe's default for the Customer, so the choice isn't only cosmetic.
  if (!isMockStripe) {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.sub },
      select: { stripeCustomerId: true },
    });
    if (profile?.stripeCustomerId) {
      await stripe.customers.update(profile.stripeCustomerId, {
        invoice_settings: { default_payment_method: method.stripePaymentMethodId },
      });
    }
  }

  // Clear all defaults then set the new one
  await prisma.$transaction([
    prisma.savedPaymentMethod.updateMany({
      where: { userId: req.user!.sub },
      data: { isDefault: false },
    }),
    prisma.savedPaymentMethod.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);

  return res.json({ success: true });
});

// ─── DELETE /api/payments/methods/:id ─────────────────────────────────────────
router.delete("/methods/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);

  const method = await prisma.savedPaymentMethod.findFirst({
    where: { id, userId: req.user!.sub },
  });
  if (!method) return res.status(404).json({ error: "Payment method not found" });

  if (!isMockStripe) {
    // Detach from Stripe so the card is no longer chargeable
    await stripe.paymentMethods.detach(method.stripePaymentMethodId);
  }

  await prisma.savedPaymentMethod.delete({ where: { id } });

  // If this was the default, promote the most recent remaining card
  if (method.isDefault) {
    const next = await prisma.savedPaymentMethod.findFirst({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.savedPaymentMethod.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return res.json({ success: true });
});

// This handler is mounted before express.json() in server.ts. Stripe signature
// verification depends on the exact raw request bytes.
export async function stripeWebhookHandler(req: Request, res: Response) {
  if (!env.stripeWebhookSecret) {
    return res.status(503).json({ error: "Stripe webhook is not configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch {
    return res.status(400).json({ error: "Invalid Stripe signature" });
  }

  // Deduplicate Stripe webhooks by claiming the row first (WH-3, BJ-4, CS-49)
  try {
    await prisma.processedStripeEvent.create({
      data: {
        id: event.id,
        type: event.type,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002" || err?.message?.includes("Unique constraint")) {
      return res.status(200).json({ received: true, duplicate: true });
    }
    throw err;
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = intent.metadata.appointmentId;

    if (appointmentId) {
      // Idempotent: only the matching, unexpired hold can transition to confirmed.
      const result = await prisma.appointment.updateMany({
        where: {
          id: appointmentId,
          status: "draft_hold",
          stripePaymentId: intent.id,
          OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: new Date() } }],
        },
        data: {
          status: "confirmed",
          holdExpiresAt: null,
          depositPaidPence: intent.amount_received,
        },
      });

      if (result.count === 1) {
        await scheduleAppointmentReminderLadder(appointmentId).catch((err) => {
          console.error("[Stripe Webhook] Failed to schedule reminders:", safeError(err));
        });
      } else {
        // Not confirmed by this event. Fine if it is already confirmed / completed
        // with this payment (a duplicate event, or the confirm call won); otherwise
        // the money arrived too late for its hold and goes back (CS-17, CS-49).
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
          select: { status: true, stripePaymentId: true, patientId: true, holdExpiresAt: true, depositPaidPence: true },
        });
        const POST_CONFIRMATION_STATUSES = new Set(["confirmed", "in_progress", "completed", "no_show"]);
        const alreadyApplied = appointment && (
          POST_CONFIRMATION_STATUSES.has(appointment.status) ||
          (appointment.status === "cancelled" && (appointment.depositPaidPence > 0 || appointment.holdExpiresAt === null))
        ) && appointment.stripePaymentId === intent.id;

        if (!alreadyApplied) {
          try {
            await refundLateDeposit({
              appointmentId: appointment ? appointmentId : null,
              patientId: appointment?.patientId ?? null,
              paymentIntentId: intent.id,
              amountPence: intent.amount_received,
            });
          } catch (err) {
            console.error("[Stripe Webhook] Late deposit refund failed:", err instanceof Error ? err.name : "unknown error");
            // A non-2xx makes Stripe retry the event, and with it the refund.
            // Release the claimed event row so Stripe can retry successfully
            await prisma.processedStripeEvent.delete({ where: { id: event.id } }).catch(() => {});
            return res.status(500).json({ error: "Late deposit refund failed" });
          }
        }
      }

      await createAuditLogWithIntegrity({
        action: "stripe.payment_intent.succeeded",
        actorId: null,
        resourceId: appointmentId,
        sessionId: null,
        ipHash: pseudonymiseIp(req.ip || ""),
        metadata: { eventId: event.id, applied: result.count === 1 },
      });
    } else {
      // Van flow: the intent carries vanServiceRequestId metadata. If an
      // accept/capture raced ahead of this event, sync the captured deposit
      // onto the linked appointment so records stay consistent.
      const vanRequestId = intent.metadata.vanServiceRequestId;
      if (vanRequestId && vanRequestId !== "pending") {
        const vanRequest = await prisma.vanServiceRequest.findUnique({
          where: { id: vanRequestId },
          select: { appointmentId: true, paymentIntentId: true },
        });

        if (vanRequest?.appointmentId && vanRequest.paymentIntentId === intent.id) {
          await prisma.appointment
            .updateMany({
              where: {
                id: vanRequest.appointmentId,
                stripePaymentId: intent.id,
                depositPaidPence: { lt: intent.amount_received },
              },
              data: { depositPaidPence: intent.amount_received },
            })
            .catch((err) =>
              console.error("[Stripe Webhook] Van deposit sync failed:", safeError(err))
            );
        }

        await createAuditLogWithIntegrity({
          action: "stripe.payment_intent.succeeded.van",
          actorId: null,
          resourceId: vanRequestId,
          sessionId: null,
          ipHash: pseudonymiseIp(req.ip || ""),
          metadata: {
            eventId: event.id,
            paymentIntentId: intent.id,
            amountReceived: intent.amount_received,
          },
        }).catch(logFailure("audit write stripe.payment_intent.succeeded.van"));
      }
    }
  }

  if (event.type === "payment_intent.amount_capturable_updated") {
    // The patient authorised the manual-capture van deposit (PaymentSheet
    // succeeded). Stamp the request so accept-time capture is allowed.
    const intent = event.data.object as Stripe.PaymentIntent;
    const vanRequestId = intent.metadata.vanServiceRequestId;

    if (vanRequestId && vanRequestId !== "pending") {
      // Idempotent: only a pending request transitions, and re-stamping the
      // same timestamp is harmless.
      const result = await prisma.vanServiceRequest.updateMany({
        where: { id: vanRequestId, status: "pending" },
        data: { depositAuthorizedAt: new Date() },
      });

      if (result.count === 0) {
        // WH-2 / VP-3: If the request is no longer pending (e.g. cancelled/expired/declined
        // while the patient was in PaymentSheet), release the newly authorized hold immediately.
        const vanRequest = await prisma.vanServiceRequest.findUnique({
          where: { id: vanRequestId },
          select: { status: true, paymentIntentId: true },
        });

        if (vanRequest && ["expired", "cancelled", "declined"].includes(vanRequest.status)) {
          const release = await releaseVanDeposit(intent.id, "external_cancel");
          await prisma.vanServiceRequest
            .update({
              where: { id: vanRequestId },
              data: {
                depositReleaseStatus: release.status,
                depositReleasedAt:
                  ["released", "already_released", "refunded"].includes(release.status)
                    ? new Date()
                    : null,
              },
            })
            .catch((err) =>
              console.error("[Stripe Webhook] Failed to update terminal van request release status:", safeError(err))
            );
        }
      }

      await createAuditLogWithIntegrity({
        action: "stripe.payment_intent.amount_capturable_updated.van",
        actorId: null,
        resourceId: vanRequestId,
        sessionId: null,
        ipHash: pseudonymiseIp(req.ip || ""),
        metadata: {
          eventId: event.id,
          paymentIntentId: intent.id,
          applied: result.count === 1,
        },
      }).catch(logFailure("audit write stripe.payment_intent.amount_capturable_updated.van"));
    }
  }

  if (event.type === "payment_intent.canceled") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = intent.metadata.appointmentId;
    const vanRequestId = intent.metadata.vanServiceRequestId;

    if (appointmentId) {
      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { status: true, patientId: true },
      });

      if (appt && appt.status === "draft_hold") {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: "cancelled", holdExpiresAt: null },
        });

        await sendPatientNotification(
          appt.patientId,
          "Booking Cancelled",
          "Your booking hold has expired or was cancelled.",
          { appointmentId, status: "cancelled" }
        ).catch(() => {});
      }

      await createAuditLogWithIntegrity({
        action: "stripe.payment_intent.canceled.appointment",
        actorId: null,
        resourceId: appointmentId,
        sessionId: null,
        ipHash: pseudonymiseIp(req.ip || ""),
        metadata: {
          eventId: event.id,
          paymentIntentId: intent.id,
          wasDraftHold: appt?.status === "draft_hold",
        },
      }).catch(logFailure("audit write stripe.payment_intent.canceled.appointment"));
    }

    if (vanRequestId && vanRequestId !== "pending") {
      const vanRequest = await prisma.vanServiceRequest.findUnique({
        where: { id: vanRequestId },
        select: { status: true, patientId: true },
      });

      // Only act if the request is still pending — i.e. the hold was lifted
      // externally (Stripe Dashboard) rather than by our own cancel/decline/
      // expiry paths, which always move the request to a terminal state first.
      if (vanRequest && vanRequest.status === "pending") {
        await prisma.vanServiceRequest.update({
          where: { id: vanRequestId },
          data: { status: "cancelled", phase: "cancelled" },
        });

        await sendPatientNotification(
          vanRequest.patientId,
          "Van Request Cancelled",
          "Your van request's deposit hold was released and the request has been cancelled. You have not been charged.",
          { requestId: vanRequestId, status: "cancelled" }
        ).catch(() => {});
      }

      await createAuditLogWithIntegrity({
        action: "stripe.payment_intent.canceled.van",
        actorId: null,
        resourceId: vanRequestId,
        sessionId: null,
        ipHash: pseudonymiseIp(req.ip || ""),
        metadata: {
          eventId: event.id,
          paymentIntentId: intent.id,
          requestWasPending: vanRequest?.status === "pending",
        },
      }).catch(logFailure("audit write stripe.payment_intent.canceled.van"));
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = intent.metadata.appointmentId;
    const vanRequestId = intent.metadata.vanServiceRequestId;

    if (appointmentId) {
      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { status: true, patientId: true },
      });

      if (appt && appt.status === "draft_hold") {
        await sendPatientNotification(
          appt.patientId,
          "Deposit Payment Failed",
          "We couldn't process your deposit payment. Please try another payment method.",
          { appointmentId, status: "payment_failed" }
        ).catch(() => {});
      }

      await createAuditLogWithIntegrity({
        action: "stripe.payment_intent.payment_failed.appointment",
        actorId: null,
        resourceId: appointmentId,
        sessionId: null,
        ipHash: pseudonymiseIp(req.ip || ""),
        metadata: {
          eventId: event.id,
          paymentIntentId: intent.id,
          failureMessage: intent.last_payment_error?.message ?? null,
        },
      }).catch(logFailure("audit write stripe.payment_intent.payment_failed.appointment"));
    }

    if (vanRequestId && vanRequestId !== "pending") {
      const vanRequest = await prisma.vanServiceRequest.findUnique({
        where: { id: vanRequestId },
        select: { status: true, patientId: true },
      });

      // The request stays pending — the patient can retry authorisation via
      // POST /api/van/requests/:id/payment-retry, which re-presents PaymentSheet.
      if (vanRequest && vanRequest.status === "pending") {
        await sendPatientNotification(
          vanRequest.patientId,
          "Deposit Authorization Failed",
          "We couldn't authorize your van deposit. Open your request to try again — you haven't been charged.",
          { requestId: vanRequestId, status: "payment_failed" }
        ).catch(() => {});
      }

      await createAuditLogWithIntegrity({
        action: "stripe.payment_intent.payment_failed.van",
        actorId: null,
        resourceId: vanRequestId,
        sessionId: null,
        ipHash: pseudonymiseIp(req.ip || ""),
        metadata: {
          eventId: event.id,
          paymentIntentId: intent.id,
          failureMessage: intent.last_payment_error?.message ?? null,
        },
      }).catch(logFailure("audit write stripe.payment_intent.payment_failed.van"));
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;

    if (paymentIntentId) {
      const appt = await prisma.appointment.findFirst({
        where: { stripePaymentId: paymentIntentId },
        select: { id: true, depositPaidPence: true },
      });

      if (appt) {
        // Stripe charge.amount_refunded is cumulative. Deposit is captured amount minus cumulative refunded amount (CS-49)
        const totalCaptured = charge.amount_captured ?? charge.amount ?? (appt.depositPaidPence || 0);
        const newDeposit = Math.max(0, totalCaptured - (charge.amount_refunded || 0));
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { depositPaidPence: newDeposit },
        });

        await createAuditLogWithIntegrity({
          action: "stripe.charge.refunded",
          actorId: null,
          resourceId: appt.id,
          sessionId: null,
          ipHash: pseudonymiseIp(req.ip || ""),
          metadata: {
            eventId: event.id,
            chargeId: charge.id,
            paymentIntentId,
            amountRefunded: charge.amount_refunded,
            depositPaidPence: newDeposit,
          },
        }).catch(logFailure("audit write stripe.charge.refunded"));
      }

      const vanRequest = await prisma.vanServiceRequest.findFirst({
        where: { paymentIntentId },
        select: { id: true },
      });

      if (vanRequest) {
        await prisma.vanServiceRequest.update({
          where: { id: vanRequest.id },
          data: {
            depositReleaseStatus: "refunded",
            depositReleasedAt: new Date(),
          },
        });

        await createAuditLogWithIntegrity({
          action: "stripe.charge.refunded.van",
          actorId: null,
          resourceId: vanRequest.id,
          sessionId: null,
          ipHash: pseudonymiseIp(req.ip || ""),
          metadata: {
            eventId: event.id,
            chargeId: charge.id,
            paymentIntentId,
            amountRefunded: charge.amount_refunded,
          },
        }).catch(logFailure("audit write stripe.charge.refunded.van"));
      }
    }
  }

  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;

    const appt = paymentIntentId
      ? await prisma.appointment.findFirst({
          where: { stripePaymentId: paymentIntentId },
          select: { id: true, patientId: true },
        })
      : null;

    const vanRequest = paymentIntentId
      ? await prisma.vanServiceRequest.findFirst({
          where: { paymentIntentId },
          select: { id: true, patientId: true },
        })
      : null;

    const resourceId = appt?.id ?? vanRequest?.id ?? paymentIntentId ?? dispute.id;

    if (appt) {
      await sendPatientNotification(
        appt.patientId,
        "Payment Dispute Notice",
        "A dispute was opened for your appointment payment. Our team will review this.",
        { appointmentId: appt.id, disputeId: dispute.id }
      ).catch(() => {});
    } else if (vanRequest) {
      await sendPatientNotification(
        vanRequest.patientId,
        "Payment Dispute Notice",
        "A dispute was opened for your van visit deposit. Our team will review this.",
        { requestId: vanRequest.id, disputeId: dispute.id }
      ).catch(() => {});
    }

    await createAuditLogWithIntegrity({
      action: "stripe.charge.dispute.created",
      actorId: null,
      resourceId,
      sessionId: null,
      ipHash: pseudonymiseIp(req.ip || ""),
      metadata: {
        eventId: event.id,
        disputeId: dispute.id,
        amount: dispute.amount,
        reason: dispute.reason,
        status: dispute.status,
        paymentIntentId,
        appointmentId: appt?.id ?? null,
        vanRequestId: vanRequest?.id ?? null,
      },
    }).catch(logFailure("audit write stripe.charge.dispute.created"));
  }

  return res.status(200).json({ received: true });
}

export default router;
