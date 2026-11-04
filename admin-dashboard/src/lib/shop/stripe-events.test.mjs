// Run with `npm test`. Signatures use Stripe's real library; SQL runs on an
// in-memory Postgres with the real migrations.
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";

import Stripe from "stripe";

import { parseCheckoutBody, placeOrder } from "./checkout-order.ts";
import { handleStripeEvent, verifyStripeEvent } from "./stripe-events.ts";
import { createTestDb } from "./test-db.mjs";

const SECRET = "whsec_test_not_a_real_secret";

let db;
before(async () => {
  db = await createTestDb();
});
after(() => db.close());
beforeEach(() => {
  mock.method(console, "error", () => undefined);
});

let eventCounter = 0;
const event = (type, object) => ({ id: `evt_${++eventCounter}`, type, data: { object } });
const apply = (stripeEvent) => db.transaction((tx) => handleStripeEvent(tx, stripeEvent));

async function pendingOrder({ price = "50.00", stock = 10, quantity = 2, discountCode } = {}) {
  const productId = await db.product({ price });
  const variantId = await db.variant(productId, { stock });
  const input = parseCheckoutBody({
    items: [{ productId, variantId, quantity }],
    customerEmail: "shopper@example.test",
    discountCode,
  });
  const placed = await db.transaction((tx) => placeOrder(tx, input));
  return { ...placed, variantId, productId };
}

const completed = (orderId, amountTotal, overrides = {}) =>
  event("checkout.session.completed", {
    id: `cs_${eventCounter}`,
    payment_status: "paid",
    payment_intent: `pi_${orderId}`,
    amount_total: amountTotal,
    currency: "gbp",
    metadata: { orderId },
    ...overrides,
  });

describe("webhook signature", () => {
  const payload = JSON.stringify({ id: "evt_x", object: "event", type: "checkout.session.completed", data: { object: {} } });
  const signed = (secret = SECRET) => Stripe.webhooks.generateTestHeaderString({ payload, secret });

  it("accepts an event signed by Stripe", () => {
    const result = verifyStripeEvent(payload, signed(), SECRET, Stripe.webhooks);
    assert.equal(result.ok, true);
    assert.equal(result.event.id, "evt_x");
  });

  it("refuses a forged event with no signature header", () => {
    const result = verifyStripeEvent(payload, null, SECRET, Stripe.webhooks);
    assert.deepEqual(result, { ok: false, status: 400, error: "Missing Stripe signature" });
  });

  it("refuses a request signed with the wrong secret", () => {
    const result = verifyStripeEvent(payload, signed("whsec_wrong"), SECRET, Stripe.webhooks);
    assert.equal(result.status, 400);
  });

  it("refuses a body changed after signing", () => {
    const result = verifyStripeEvent(`${payload} `, signed(), SECRET, Stripe.webhooks);
    assert.equal(result.status, 400);
  });

  it("refuses everything when no secret is configured, even with a signature", () => {
    const result = verifyStripeEvent(payload, signed(), undefined, Stripe.webhooks);
    assert.equal(result.status, 503);
  });
});

describe("checkout.session.completed", () => {
  it("marks the order paid, records the payment and takes the stock", async () => {
    const order = await pendingOrder({ quantity: 2, stock: 10 });
    await apply(completed(order.orderId, 10000));

    assert.equal((await db.order(order.orderId)).status, "paid");
    assert.equal(await db.stockOf(order.variantId), 8);
    const [payment] = await db.query("SELECT amount, status FROM payments WHERE order_id = $1", [order.orderId]);
    assert.deepEqual(payment, { amount: "100.00", status: "succeeded" });
  });

  it("takes stock once when Stripe redelivers the same event", async () => {
    const order = await pendingOrder({ quantity: 2, stock: 10 });
    const stripeEvent = completed(order.orderId, 10000);

    assert.deepEqual(await apply(stripeEvent), { duplicate: false });
    assert.deepEqual(await apply(stripeEvent), { duplicate: true });

    assert.equal(await db.stockOf(order.variantId), 8);
    const logs = await db.query("SELECT 1 FROM inventory_logs WHERE order_id = $1", [order.orderId]);
    assert.equal(logs.length, 1);
  });

  it("rolls back and can be retried when processing fails part-way", async () => {
    const order = await pendingOrder({ quantity: 1, stock: 5 });
    const stripeEvent = completed(order.orderId, 5000);

    await assert.rejects(
      db.transaction(async (tx) => {
        await handleStripeEvent(tx, stripeEvent);
        throw new Error("database went away");
      }),
    );
    assert.equal((await db.order(order.orderId)).status, "pending");
    assert.equal(await db.stockOf(order.variantId), 5);

    assert.deepEqual(await apply(stripeEvent), { duplicate: false });
    assert.equal((await db.order(order.orderId)).status, "paid");
    assert.equal(await db.stockOf(order.variantId), 4);
  });

  it("doesn't mark paid, or take stock, when the charge differs from the order total", async () => {
    const order = await pendingOrder({ quantity: 1, stock: 5 });
    await apply(completed(order.orderId, 1));

    assert.equal((await db.order(order.orderId)).status, "payment_processing");
    assert.equal(await db.stockOf(order.variantId), 5);
    const [payment] = await db.query("SELECT amount FROM payments WHERE order_id = $1", [order.orderId]);
    assert.equal(payment.amount, "0.01");
  });

  it("ignores a session Stripe hasn't been paid for", async () => {
    const order = await pendingOrder();
    await apply(completed(order.orderId, 10000, { payment_status: "unpaid" }));
    assert.equal((await db.order(order.orderId)).status, "pending");
  });

  it("records money for an order staff already cancelled, without reviving it", async () => {
    const order = await pendingOrder({ quantity: 1, stock: 5 });
    await db.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [order.orderId]);
    await apply(completed(order.orderId, 5000));

    assert.equal((await db.order(order.orderId)).status, "cancelled");
    assert.equal(await db.stockOf(order.variantId), 5);
    const payments = await db.query("SELECT 1 FROM payments WHERE order_id = $1", [order.orderId]);
    assert.equal(payments.length, 1);
  });

  it("doesn't go below zero stock when two paid orders race for the last item", async () => {
    const order = await pendingOrder({ quantity: 2, stock: 2 });
    await db.query("UPDATE product_variants SET stock_qty = 1 WHERE id = $1", [order.variantId]);
    await apply(completed(order.orderId, 10000));

    assert.equal(await db.stockOf(order.variantId), 0);
    const [log] = await db.query("SELECT quantity_change, notes FROM inventory_logs WHERE order_id = $1", [order.orderId]);
    assert.equal(log.quantity_change, -1);
    assert.match(log.notes, /oversold/);
  });

  it("ignores an event whose order id isn't ours", async () => {
    assert.deepEqual(await apply(completed("not-a-uuid", 100)), { duplicate: false });
  });
});

describe("payment failures and expiry", () => {
  const failed = (orderId) =>
    event("payment_intent.payment_failed", { id: `pi_${orderId}`, amount: 10000, currency: "gbp", metadata: { orderId } });
  const expired = (orderId) => event("checkout.session.expired", { id: "cs_x", metadata: { orderId } });

  it("marks a failed payment, and a retry on the same session can still succeed", async () => {
    const order = await pendingOrder();
    await apply(failed(order.orderId));
    assert.equal((await db.order(order.orderId)).status, "payment_failed");

    await apply(completed(order.orderId, 10000));
    assert.equal((await db.order(order.orderId)).status, "paid");
    const [payment] = await db.query("SELECT status FROM payments WHERE order_id = $1", [order.orderId]);
    assert.equal(payment.status, "succeeded");
  });

  it("never moves a paid order backwards when a failure arrives late", async () => {
    const order = await pendingOrder();
    await apply(completed(order.orderId, 10000));
    await apply(failed(order.orderId));

    assert.equal((await db.order(order.orderId)).status, "paid");
    const [payment] = await db.query("SELECT status FROM payments WHERE order_id = $1", [order.orderId]);
    assert.equal(payment.status, "succeeded");
  });

  it("cancels an expired checkout and gives back its discount use", async () => {
    const discountCode = await db.discount({ maxUses: 1 });
    const order = await pendingOrder({ discountCode });
    const usedCount = async () =>
      (await db.query("SELECT used_count FROM discounts WHERE code = $1", [discountCode]))[0].used_count;
    assert.equal(await usedCount(), 1);

    await apply(expired(order.orderId));
    assert.equal((await db.order(order.orderId)).status, "cancelled");
    assert.equal(await usedCount(), 0);
  });

  it("keeps a paid order's discount use", async () => {
    const discountCode = await db.discount({ maxUses: 1 });
    const order = await pendingOrder({ quantity: 1, discountCode });
    await apply(completed(order.orderId, 4500));
    await apply(expired(order.orderId));

    assert.equal((await db.order(order.orderId)).status, "paid");
    const [{ used_count }] = await db.query("SELECT used_count FROM discounts WHERE code = $1", [discountCode]);
    assert.equal(used_count, 1);
  });
});

describe("charge.refunded", () => {
  const refunded = (orderId, amountRefunded, full) =>
    event("charge.refunded", { payment_intent: `pi_${orderId}`, amount_refunded: amountRefunded, refunded: full });

  it("records a partial refund without marking the order refunded", async () => {
    const order = await pendingOrder();
    await apply(completed(order.orderId, 10000));
    await apply(refunded(order.orderId, 2500, false));

    assert.equal((await db.order(order.orderId)).status, "paid");
    const [payment] = await db.query("SELECT status, amount_refunded FROM payments WHERE order_id = $1", [order.orderId]);
    assert.deepEqual(payment, { status: "succeeded", amount_refunded: "25.00" });
  });

  it("marks a full refund made in Stripe's dashboard", async () => {
    const order = await pendingOrder();
    await apply(completed(order.orderId, 10000));
    await apply(refunded(order.orderId, 10000, true));

    assert.equal((await db.order(order.orderId)).status, "refunded");
    const [payment] = await db.query("SELECT status FROM payments WHERE order_id = $1", [order.orderId]);
    assert.equal(payment.status, "refunded");
  });
});
