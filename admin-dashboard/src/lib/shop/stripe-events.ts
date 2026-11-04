import type Stripe from "stripe";

import type { QueryFn } from "@/lib/db/client";

import { releaseOrderDiscount } from "./checkout-order.ts";
import { toPence, toPounds } from "./pricing.ts";
import { changeVariantStock } from "./stock.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AWAITING_PAYMENT = ["pending", "payment_processing", "payment_failed"];
const REFUNDABLE = ["paid", "fulfilling", "shipped", "delivered"];

export type VerifiedEvent = { ok: true; event: Stripe.Event } | { ok: false; status: number; error: string };

/** Only an event signed by Stripe is ever processed, in every environment. */
export function verifyStripeEvent(
  body: string,
  signature: string | null,
  secret: string | undefined,
  webhooks: Pick<Stripe["webhooks"], "constructEvent">,
): VerifiedEvent {
  if (!secret) return { ok: false, status: 503, error: "Stripe webhook is not configured" };
  if (!signature) return { ok: false, status: 400, error: "Missing Stripe signature" };
  try {
    return { ok: true, event: webhooks.constructEvent(body, signature, secret) };
  } catch {
    return { ok: false, status: 400, error: "Invalid Stripe signature" };
  }
}

async function auditOrder(tx: QueryFn, orderId: string, action: string, values: Record<string, unknown>) {
  await tx(`INSERT INTO audit_logs (action, entity_type, entity_id, new_values) VALUES ($1, 'order', $2, $3)`, [
    action,
    orderId,
    JSON.stringify(values),
  ]);
}

async function lockOrder(tx: QueryFn, orderId: string | undefined) {
  if (!orderId || !UUID.test(orderId)) return null;
  const [order] = await tx<{ id: string; status: string; total: string }>(
    "SELECT id, status, total FROM orders WHERE id = $1 FOR UPDATE",
    [orderId],
  );
  return order ?? null;
}

async function handleCheckoutCompleted(tx: QueryFn, session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return;

  const order = await lockOrder(tx, session.metadata?.orderId);
  if (!order) {
    console.error(`[Stripe webhook] Checkout session ${session.id} has no matching order`);
    return;
  }

  const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.id;
  const chargedPence = session.amount_total ?? 0;
  await tx(
    `INSERT INTO payments (order_id, stripe_payment_intent_id, amount, currency, status)
     VALUES ($1, $2, $3, $4, 'succeeded')
     ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET status = 'succeeded', amount = $3, updated_at = now()`,
    [order.id, paymentId, toPounds(chargedPence), session.currency || "gbp"],
  );

  // Money arrived for an order that isn't waiting for it (for example staff
  // cancelled it first). Keep the record and leave the order for staff.
  if (!AWAITING_PAYMENT.includes(order.status)) {
    console.error(`[Stripe webhook] Payment received for order ${order.id} in status ${order.status}`);
    await auditOrder(tx, order.id, "order_notes_added", { paymentReceivedInStatus: order.status, paymentId });
    return;
  }

  if (chargedPence !== toPence(order.total)) {
    console.error(`[Stripe webhook] Order ${order.id} was charged a different amount from its total`);
    await tx("UPDATE orders SET status = 'payment_processing', updated_at = now() WHERE id = $1", [order.id]);
    await auditOrder(tx, order.id, "order_status_changed", {
      status: "payment_processing",
      amountMismatch: { chargedPence, orderTotal: order.total },
      paymentIntent: paymentId,
    });
    return;
  }

  await tx("UPDATE orders SET status = 'paid', updated_at = now() WHERE id = $1", [order.id]);

  const items = await tx<{ variant_id: string | null; quantity: number }>(
    "SELECT variant_id, quantity FROM order_items WHERE order_id = $1",
    [order.id],
  );
  for (const item of items) {
    if (!item.variant_id) continue;
    await changeVariantStock(tx, {
      variantId: item.variant_id,
      quantityChange: -item.quantity,
      reason: "sale",
      orderId: order.id,
      notes: "Automatic checkout decrement",
    });
  }

  const cartSessionId = session.metadata?.cartSessionId;
  if (cartSessionId) {
    await tx("DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE session_id = $1)", [cartSessionId]);
  }

  await auditOrder(tx, order.id, "order_status_changed", { status: "paid", paymentIntent: paymentId });
}

async function handleCheckoutExpired(tx: QueryFn, session: Stripe.Checkout.Session) {
  const order = await lockOrder(tx, session.metadata?.orderId);
  if (!order) return;

  if (order.status === "pending" || order.status === "payment_failed") {
    await tx("UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = $1", [order.id]);
    await auditOrder(tx, order.id, "order_status_changed", { status: "cancelled", reason: "checkout expired" });
    await releaseOrderDiscount(tx, order.id);
  } else if (order.status === "cancelled") {
    await releaseOrderDiscount(tx, order.id);
  }
}

async function handlePaymentFailed(tx: QueryFn, intent: Stripe.PaymentIntent) {
  const order = await lockOrder(tx, intent.metadata?.orderId);
  if (!order) return;

  await tx(
    `INSERT INTO payments (order_id, stripe_payment_intent_id, amount, currency, status)
     VALUES ($1, $2, $3, $4, 'failed')
     ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET status = 'failed', updated_at = now()
     WHERE payments.status NOT IN ('succeeded', 'refunded')`,
    [order.id, intent.id, toPounds(intent.amount), intent.currency],
  );
  // Events can arrive out of order: never move a paid order backwards.
  if (order.status === "pending" || order.status === "payment_processing") {
    await tx("UPDATE orders SET status = 'payment_failed', updated_at = now() WHERE id = $1", [order.id]);
    await auditOrder(tx, order.id, "order_status_changed", { status: "payment_failed", paymentIntent: intent.id });
  }
}

/** Also how a refund made directly in the Stripe dashboard reaches the order. */
async function handleChargeRefunded(tx: QueryFn, charge: Stripe.Charge) {
  const paymentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentId) return;

  const [payment] = await tx<{ order_id: string }>(
    "SELECT order_id FROM payments WHERE stripe_payment_intent_id = $1",
    [paymentId],
  );
  if (!payment) return;
  const order = await lockOrder(tx, payment.order_id);
  if (!order) return;

  await tx(
    `UPDATE payments SET amount_refunded = $1, status = CASE WHEN $2 THEN 'refunded' ELSE status END, updated_at = now()
     WHERE stripe_payment_intent_id = $3`,
    [toPounds(charge.amount_refunded), charge.refunded, paymentId],
  );
  if (charge.refunded && REFUNDABLE.includes(order.status)) {
    await tx("UPDATE orders SET status = 'refunded', updated_at = now() WHERE id = $1", [order.id]);
  }
  await auditOrder(tx, order.id, "refund_processed", {
    amountRefundedPence: charge.amount_refunded,
    fullyRefunded: charge.refunded,
    source: "stripe webhook",
  });
}

/**
 * Applies one verified event. Run in a transaction: the claim on the event and
 * all its changes commit together, so a failure rolls back and Stripe's retry
 * starts clean, while a redelivery of a finished event changes nothing.
 */
export async function handleStripeEvent(tx: QueryFn, event: Stripe.Event): Promise<{ duplicate: boolean }> {
  const claimed = await tx(
    "INSERT INTO processed_stripe_events (id, type) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING RETURNING id",
    [event.id, event.type],
  );
  if (claimed.length === 0) return { duplicate: true };

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(tx, event.data.object);
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(tx, event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(tx, event.data.object);
      break;
    case "charge.refunded":
      await handleChargeRefunded(tx, event.data.object);
      break;
    default:
      break;
  }
  return { duplicate: false };
}
