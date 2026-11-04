import type { QueryFn } from "@/lib/db/client";

import { toPence, toPounds } from "./pricing.ts";
import { changeVariantStock } from "./stock.ts";

const REFUNDABLE = ["paid", "fulfilling", "shipped", "delivered"];

export interface RefundRequest {
  orderId: string;
  refundAmount?: unknown;
  reason?: string;
  restockItems?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface RefundDeps {
  query: QueryFn;
  transaction: <T>(fn: (tx: QueryFn) => Promise<T>) => Promise<T>;
  /** Returns the Stripe refund id, or throws if Stripe didn't accept it. */
  createStripeRefund: (refund: { paymentIntent: string; amountPence: number; idempotencyKey: string }) => Promise<string>;
}

export interface RefundResult {
  status: number;
  body: Record<string, unknown>;
}

const refuse = (status: number, error: string): RefundResult => ({ status, body: { error } });

/**
 * Stripe is asked first and the order only changes once Stripe has accepted, so
 * an order can never read "refunded" while the customer still hasn't been paid.
 * A partial refund keeps the order's status and records the running total.
 */
export async function processRefund(deps: RefundDeps, request: RefundRequest): Promise<RefundResult> {
  const { orderId, reason, restockItems = true } = request;

  const [order] = await deps.query<{ status: string }>("SELECT status FROM orders WHERE id = $1", [orderId]);
  if (!order) return refuse(404, "Order not found");
  if (order.status === "refunded") return refuse(400, "Order is already refunded");
  if (!REFUNDABLE.includes(order.status)) return refuse(409, `An order that is ${order.status} can't be refunded`);

  const [payment] = await deps.query<{
    id: string;
    stripe_payment_intent_id: string;
    amount: string;
    amount_refunded: string;
  }>(
    `SELECT id, stripe_payment_intent_id, amount, amount_refunded FROM payments
     WHERE order_id = $1 AND status = 'succeeded' ORDER BY created_at DESC LIMIT 1`,
    [orderId],
  );
  if (!payment) return refuse(409, "This order has no card payment to refund");

  const alreadyRefunded = toPence(payment.amount_refunded);
  const remaining = toPence(payment.amount) - alreadyRefunded;
  if (remaining <= 0) return refuse(409, "This payment has already been fully refunded");

  let amountPence = remaining;
  if (request.refundAmount !== undefined && request.refundAmount !== null) {
    const requested = Number(request.refundAmount);
    if (!Number.isFinite(requested) || toPence(requested) <= 0) return refuse(400, "Enter a refund amount above £0");
    amountPence = toPence(requested);
    if (amountPence > remaining) return refuse(400, `The most that can be refunded is £${toPounds(remaining)}`);
  }

  let stripeRefundId: string;
  try {
    stripeRefundId = await deps.createStripeRefund({
      paymentIntent: payment.stripe_payment_intent_id,
      amountPence,
      // The same request repeated (a double click) can't refund twice.
      idempotencyKey: `refund-${orderId}-${alreadyRefunded}-${amountPence}`,
    });
  } catch (error) {
    console.error("[Stripe refund]", orderId, error instanceof Error ? error.name : "unknown error");
    return refuse(502, "Stripe didn't accept the refund, so nothing has changed. Please try again.");
  }

  const isFull = amountPence === remaining;
  let restocked = false;
  try {
    const updatedOrder = await deps.transaction(async (tx) => {
      await tx(
        `UPDATE payments SET amount_refunded = GREATEST(amount_refunded, $1),
           status = CASE WHEN $2 THEN 'refunded' ELSE status END, updated_at = now()
         WHERE id = $3`,
        [toPounds(alreadyRefunded + amountPence), isFull, payment.id],
      );

      const [updated] = isFull
        ? await tx<Record<string, unknown>>(
            "UPDATE orders SET status = 'refunded', updated_at = now() WHERE id = $1 RETURNING *",
            [orderId],
          )
        : await tx<Record<string, unknown>>("SELECT * FROM orders WHERE id = $1", [orderId]);

      if (isFull && restockItems) {
        // A repeat of the same request must not put the stock back twice.
        const alreadyRestocked = await tx("SELECT 1 FROM inventory_logs WHERE order_id = $1 AND reason = 'return' LIMIT 1", [
          orderId,
        ]);
        if (alreadyRestocked.length === 0) {
          const items = await tx<{ variant_id: string | null; quantity: number }>(
            "SELECT variant_id, quantity FROM order_items WHERE order_id = $1",
            [orderId],
          );
          for (const item of items) {
            if (!item.variant_id) continue;
            await changeVariantStock(tx, {
              variantId: item.variant_id,
              quantityChange: item.quantity,
              reason: "return",
              orderId,
              notes: reason ?? "Customer refund restock",
            });
          }
          restocked = true;
        }
      }

      await tx(
        `INSERT INTO audit_logs (action, entity_type, entity_id, new_values, ip_address, user_agent)
         VALUES ('refund_processed', 'order', $1, $2, $3, $4)`,
        [
          orderId,
          JSON.stringify({
            stripeRefundId,
            amountPence,
            fullyRefunded: isFull,
            restocked,
            reason: reason ?? "Admin triggered refund",
          }),
          request.ipAddress ?? null,
          request.userAgent ?? null,
        ],
      );
      return updated;
    });

    return {
      status: 200,
      body: {
        success: true,
        message: isFull ? "Refund processed successfully" : `Partial refund of £${toPounds(amountPence)} processed`,
        refundedPence: amountPence,
        fullyRefunded: isFull,
        restocked,
        order: updatedOrder,
      },
    };
  } catch (error) {
    // The money has moved. Stripe's charge.refunded webhook will bring the payment record into line.
    console.error("[Refund recording]", orderId, error instanceof Error ? error.name : "unknown error");
    return refuse(500, "Stripe issued the refund, but the order couldn't be updated. Do not refund it again.");
  }
}
