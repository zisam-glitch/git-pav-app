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
  | "duplicate_request"
  | "queue_full";

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

import { vanCancellationKeepsDeposit } from "./cancellation-policy";
export { vanCancellationKeepsDeposit };

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
 * Captures a van deposit, or confirms it was already captured. Returns the
 * error response to send, or null when the deposit is captured.
 */
export function captureVanDeposit(requestId: string, paymentIntentId: string): Promise<{ status: number; body: Record<string, string> } | null> {
  // Two taps at once share one capture instead of racing each other to Stripe.
  return singleFlight(`capture:${requestId}`, () => captureOnce(requestId, paymentIntentId));
}

async function captureOnce(requestId: string, paymentIntentId: string): Promise<{ status: number; body: Record<string, string> } | null> {
  // The intent must be authorised (the patient completed PaymentSheet). A
  // pre-capture check gives the operator an actionable message instead of a
  // raw Stripe error.
  let intent: Stripe.PaymentIntent;
  try {
    intent = await getStripe().paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("Failed to retrieve PaymentIntent for capture:", safeError(error));
    return { status: 502, body: { error: "Payment service unavailable", message: "Could not verify the deposit before acceptance. Please try again." } };
  }

  // Captured by an earlier attempt whose response was lost.
  if (intent.status === "succeeded") return null;

  if (intent.status !== "requires_capture") {
    return {
      status: 409,
      body: {
        error: "Deposit not authorized",
        message:
          intent.status === "canceled"
            ? "The patient's deposit hold was released. Please decline this request."
            : `The patient has not completed deposit authorization (status: ${intent.status}). Ask them to authorize the deposit, then accept.`,
      },
    };
  }

  const failed = { status: 409, body: { error: "Payment capture failed", message: "The payment could not be captured. Please ask the patient to try again." } };
  try {
    // Keyed per request id: a retried accept reuses the same key instead of
    // capturing blind.
    const captured = await getStripe().paymentIntents.capture(paymentIntentId, undefined, {
      idempotencyKey: `van-deposit-capture:${requestId}`,
    });
    if (captured.status !== "succeeded") {
      console.error(`Payment capture failed for intent ${paymentIntentId}: ${captured.status}`);
      return failed;
    }
    return null;
  } catch (error) {
    // Another server may have captured it at the same moment (Stripe refuses a
    // second request on the same key while the first is in flight).
    const after = await getStripe().paymentIntents.retrieve(paymentIntentId).catch(() => null);
    if (after?.status === "succeeded") return null;
    console.error("Failed to capture payment:", safeError(error));
    return failed;
  }
}

// ─── Releasing after the database has been written (N22) ──────────────────

/**
 * Stored on a closed request, in the same transaction that closes it, when its
 * deposit still has to be released at Stripe. The release itself happens after
 * that transaction, outside any lock; if the server stops in between, the
 * background job finds the row and finishes it.
 */
export const DEPOSIT_RELEASE_PENDING = "pending";

/** Outcomes after which nothing more has to be done for the deposit. */
const RELEASE_SETTLED: string[] = ["released", "already_released", "refunded", "retained", "mock"];

const flights = new Map<string, Promise<unknown>>();

/** Runs `fn` once for calls that overlap on the same key in this server. */
function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const running = flights.get(key) as Promise<T> | undefined;
  if (running) return running;
  const started = fn().finally(() => flights.delete(key));
  flights.set(key, started);
  return started;
}

export type SettledRelease = { status: string | null; refundId: string | null };

/**
 * Releases the deposit of a request that has closed without the visit taking
 * place (declined, timed out, shift ended, cancelled), and stores the result.
 *
 * Everything it needs comes from the stored request and its history, so the
 * request that closed it, a repeat of that request and the retry job all do
 * the same thing: the reason, and for a cancel whether the policy keeps a
 * deposit already taken (decided by the phase the visit was cancelled from).
 * Does nothing when the release is already settled, and overlapping calls
 * share one run. Never throws for a Stripe failure: that is stored as failed
 * and retried.
 */
export function settleVanDepositRelease(requestId: string): Promise<SettledRelease> {
  return singleFlight(`release:${requestId}`, async () => {
    const row = await prisma.vanServiceRequest.findUnique({
      where: { id: requestId },
      select: { status: true, paymentIntentId: true, depositReleaseStatus: true },
    });
    const stored = row?.depositReleaseStatus ?? null;
    if (!row?.paymentIntentId) return { status: stored, refundId: null };
    if (!["declined", "expired", "cancelled"].includes(row.status)) return { status: stored, refundId: null };
    if (stored !== DEPOSIT_RELEASE_PENDING && stored !== "failed") return { status: stored, refundId: null };

    const closing = await prisma.vanRequestEvent.findFirst({
      where: { requestId, type: { in: ["declined", "expired", "shift_ended", "cancelled"] } },
      orderBy: { at: "desc" },
      select: { type: true, fromPhase: true },
    });
    const reason: VanDepositReleaseReason =
      row.status === "declined"
        ? "operator_declined"
        : row.status === "cancelled"
          ? "patient_cancelled"
          : closing?.type === "shift_ended"
            ? "shift_ended"
            : "expired";
    const retainCaptured = row.status === "cancelled" && vanCancellationKeepsDeposit(closing?.fromPhase);

    const release = await releaseVanDeposit(row.paymentIntentId, reason, { retainCaptured });
    await prisma.vanServiceRequest.updateMany({
      where: { id: requestId, depositReleaseStatus: { in: [DEPOSIT_RELEASE_PENDING, "failed"] } },
      data: {
        depositReleaseStatus: release.status,
        depositReleasedAt: RELEASE_SETTLED.includes(release.status) ? new Date() : null,
      },
    });
    return { status: release.status, refundId: release.refundId ?? null };
  });
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
