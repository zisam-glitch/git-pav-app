// backend/src/lib/van-payments.ts
// Money-safety primitives for the mobile van dispatch flow.
//
// Van deposits are manual-capture PaymentIntents: authorised by the patient via
// PaymentSheet at request time, captured by the operator on accept. Every
// terminal path that does NOT end in an accept (patient cancel, operator
// decline, request expiry, shift end) must release the authorisation so the
// patient is never left with a pending card hold — matching the client promise
// of "you pay nothing if the request is declined or times out".

import Stripe from "stripe";
import { env } from "../config/env";
import { logFailure } from "./best-effort";
import { prisma } from "./prisma";
import { createAuditLogWithIntegrity } from "./audit-integrity";
import { safeError } from "./log-safety";

export const isMockStripe = env.isMockStripe;

function makeStripeClient(): Stripe {
  return new Stripe(env.stripeSecretKey, {
    apiVersion: "2025-02-24.acacia" as never,
  });
}

// Lazily constructed singleton so unit tests can inject their own client.
let defaultStripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!defaultStripe) defaultStripe = makeStripeClient();
  return defaultStripe;
}

export type VanDepositReleaseReason =
  | "patient_cancelled"
  | "operator_declined"
  | "expired"
  | "shift_ended"
  | "external_cancel"
  | "duplicate_request";

export type VanDepositReleaseStatus =
  | "released" // uncaptured hold cancelled (authorisation lifted)
  | "refunded" // already captured — money returned to the patient
  | "retained" // already captured and kept under the cancellation policy
  | "already_released" // intent was already cancelled upstream (idempotent no-op)
  | "nothing_to_release" // intent exists but holds no funds and is not cancellable
  | "mock" // mock Stripe mode — nothing to do
  | "failed"; // Stripe call failed — surface for retry/monitoring

export type VanDepositReleaseResult = {
  status: VanDepositReleaseStatus;
  refundId?: string;
  amountRefundedPence?: number;
  error?: string;
};

// Intent states in which the patient still has an active authorisation hold
// that must be lifted via cancel. "processing" is deliberately excluded: the
// intent may still transition, and cancelling it is rejected by Stripe.
const HOLD_STATUSES: Stripe.PaymentIntent.Status[] = [
  "requires_capture",
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
];

export { vanCancellationKeepsDeposit } from "./cancellation-policy";

/**
 * Release the deposit attached to a van service request.
 *
 * - Uncaptured hold        → cancel the intent (lifts the authorisation)
 * - Captured               → full refund (e.g. patient cancels after accept)
 * - Already cancelled      → idempotent no-op
 *
 * Never throws for Stripe-level failures: a payment-provider outage must not
 * corrupt dispatch state. Every outcome (including failures) is audit-logged.
 */
export async function releaseVanDeposit(
  paymentIntentId: string,
  reason: VanDepositReleaseReason,
  opts?: { stripe?: Stripe; retainCaptured?: boolean }
): Promise<VanDepositReleaseResult> {
  if (isMockStripe && !opts?.stripe) {
    return { status: "mock" };
  }

  const stripe = opts?.stripe ?? getStripe();

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    let result: VanDepositReleaseResult;

    if (intent.status === "succeeded" && opts?.retainCaptured) {
      // Kept under the cancellation policy. An uncaptured hold is still lifted
      // below: the policy never captures money that was not already taken.
      result = { status: "retained" };
    } else if (intent.status === "succeeded") {
      // Deposit already captured (patient cancelled after operator accept) —
      // refund the full captured amount. Keyed per intent so a retried release
      // (e.g. network drop after the refund call) cannot double-refund.
      const refund = await stripe.refunds.create(
        { payment_intent: paymentIntentId },
        { idempotencyKey: `van-deposit-refund:${paymentIntentId}` }
      );
      result = {
        status: "refunded",
        refundId: refund.id,
        amountRefundedPence: refund.amount,
      };
    } else if (intent.status === "canceled") {
      result = { status: "already_released" };
    } else if (HOLD_STATUSES.includes(intent.status)) {
      // Keyed per intent: a retried cancel (network drop mid-call) replays the
      // same operation instead of throwing an ambiguous second error.
      await stripe.paymentIntents.cancel(paymentIntentId, undefined, {
        idempotencyKey: `van-deposit-cancel:${paymentIntentId}`,
      });
      result = { status: "released" };
    } else {
      // e.g. "processing" — no funds held yet, nothing we can release.
      result = { status: "nothing_to_release" };
    }

    await auditRelease(paymentIntentId, reason, result);
    return result;
  } catch (error: any) {
    // Stripe-card errors carry a human-readable message; everything else is
    // an infrastructure failure worth the full log.
    const message =
      error?.type === "StripeCardError" || error?.type === "StripeInvalidRequestError"
        ? error.message
        : String(error?.message ?? error);
    console.error(
      `[VAN PAYMENTS] Failed to release deposit ${paymentIntentId} (reason=${reason}):`,
      message
    );
    const result: VanDepositReleaseResult = { status: "failed", error: message };
    await auditRelease(paymentIntentId, reason, result).catch(logFailure("audit write van deposit release"));
    return result;
  }
}

async function auditRelease(
  paymentIntentId: string,
  reason: VanDepositReleaseReason,
  result: VanDepositReleaseResult
): Promise<void> {
  await createAuditLogWithIntegrity({
    action: "van.payment.released",
    actorId: null,
    resourceId: paymentIntentId,
    sessionId: null,
    ipHash: null,
    metadata: {
      reason,
      status: result.status,
      ...(result.refundId ? { refundId: result.refundId } : {}),
      ...(result.amountRefundedPence != null
        ? { amountRefundedPence: result.amountRefundedPence }
        : {}),
      ...(result.error ? { error: result.error } : {}),
    },
  }).catch((err) => console.error("[VAN PAYMENTS] Audit log write failed:", safeError(err)));
}

/**
 * Whether the patient has authorised the deposit PaymentIntent for this
 * van request (i.e. PaymentSheet succeeded and the hold is in place).
 */
export async function isDepositAuthorized(
  paymentIntentId: string | null,
  depositAuthorizedAt: Date | null
): Promise<boolean> {
  if (!paymentIntentId) return false;
  if (depositAuthorizedAt) return true;
  if (isMockStripe && paymentIntentId.startsWith("pi_mock_")) return true;
  return false;
}
