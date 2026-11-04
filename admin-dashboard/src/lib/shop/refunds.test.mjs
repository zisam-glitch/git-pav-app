// Run with `npm test`. SQL runs on an in-memory Postgres with the real migrations;
// only the call out to Stripe is replaced.
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";

import { parseCheckoutBody, placeOrder } from "./checkout-order.ts";
import { processRefund } from "./refunds.ts";
import { handleStripeEvent } from "./stripe-events.ts";
import { createTestDb } from "./test-db.mjs";

let db;
before(async () => {
  db = await createTestDb();
});
after(() => db.close());
beforeEach(() => {
  mock.method(console, "error", () => undefined);
});

let eventCounter = 0;

async function paidOrder({ stock = 10, quantity = 2 } = {}) {
  const productId = await db.product({ price: "50.00" });
  const variantId = await db.variant(productId, { stock });
  const input = parseCheckoutBody({
    items: [{ productId, variantId, quantity }],
    customerEmail: "shopper@example.test",
  });
  const { orderId, totals } = await db.transaction((tx) => placeOrder(tx, input, null));
  await db.transaction((tx) =>
    handleStripeEvent(tx, {
      id: `evt_refund_${++eventCounter}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_x",
          payment_status: "paid",
          payment_intent: `pi_${orderId}`,
          amount_total: totals.totalPence,
          currency: "gbp",
          metadata: { orderId },
        },
      },
    }),
  );
  return { orderId, variantId };
}

function deps(createStripeRefund = async () => "re_test") {
  const calls = [];
  return {
    calls,
    query: db.query,
    transaction: db.transaction,
    createStripeRefund: async (refund) => {
      calls.push(refund);
      return createStripeRefund(refund);
    },
  };
}

const paymentOf = async (orderId) =>
  (await db.query("SELECT status, amount_refunded FROM payments WHERE order_id = $1", [orderId]))[0];

describe("refunds", () => {
  it("refunds in full through Stripe, then updates the order and restocks", async () => {
    const { orderId, variantId } = await paidOrder({ stock: 10, quantity: 2 });
    const d = deps();
    const result = await processRefund(d, { orderId });

    assert.equal(result.status, 200);
    assert.equal(d.calls[0].amountPence, 10000);
    assert.equal(d.calls[0].paymentIntent, `pi_${orderId}`);
    assert.equal((await db.order(orderId)).status, "refunded");
    assert.deepEqual(await paymentOf(orderId), { status: "refunded", amount_refunded: "100.00" });
    assert.equal(await db.stockOf(variantId), 10);
  });

  it("changes nothing when Stripe refuses, and says so", async () => {
    const { orderId, variantId } = await paidOrder({ stock: 10, quantity: 2 });
    const result = await processRefund(
      deps(async () => {
        throw new Error("card_declined");
      }),
      { orderId },
    );

    assert.equal(result.status, 502);
    assert.match(result.body.error, /nothing has changed/);
    assert.equal((await db.order(orderId)).status, "paid");
    assert.deepEqual(await paymentOf(orderId), { status: "succeeded", amount_refunded: "0.00" });
    assert.equal(await db.stockOf(variantId), 8);
  });

  it("records a partial refund, keeps the order's status and doesn't restock", async () => {
    const { orderId, variantId } = await paidOrder({ stock: 10, quantity: 2 });
    const result = await processRefund(deps(), { orderId, refundAmount: "25.00" });

    assert.equal(result.status, 200);
    assert.equal(result.body.fullyRefunded, false);
    assert.equal(result.body.restocked, false);
    assert.equal((await db.order(orderId)).status, "paid");
    assert.deepEqual(await paymentOf(orderId), { status: "succeeded", amount_refunded: "25.00" });
    assert.equal(await db.stockOf(variantId), 8);
  });

  it("only allows what's left after earlier partial refunds, then completes the order", async () => {
    const { orderId } = await paidOrder();
    await processRefund(deps(), { orderId, refundAmount: 60 });

    const tooMuch = await processRefund(deps(), { orderId, refundAmount: 40.01 });
    assert.equal(tooMuch.status, 400);
    assert.match(tooMuch.body.error, /£40\.00/);

    const rest = await processRefund(deps(), { orderId });
    assert.equal(rest.status, 200);
    assert.equal(rest.body.refundedPence, 4000);
    assert.equal((await db.order(orderId)).status, "refunded");
  });

  it("rejects a nonsense amount without calling Stripe", async () => {
    const { orderId } = await paidOrder();
    for (const refundAmount of [0, -5, "abc"]) {
      const d = deps();
      assert.equal((await processRefund(d, { orderId, refundAmount })).status, 400);
      assert.equal(d.calls.length, 0);
    }
  });

  it("uses the same Stripe idempotency key for the same request", async () => {
    const { orderId } = await paidOrder();
    const d = deps(async () => {
      throw new Error("network");
    });
    await processRefund(d, { orderId });
    await processRefund(d, { orderId });
    assert.equal(d.calls[0].idempotencyKey, d.calls[1].idempotencyKey);
  });

  it("refuses a second refund of a refunded order", async () => {
    const { orderId } = await paidOrder();
    await processRefund(deps(), { orderId });
    const d = deps();
    assert.equal((await processRefund(d, { orderId })).status, 400);
    assert.equal(d.calls.length, 0);
  });

  it("restocks once even if the same order's refund is recorded twice", async () => {
    const { orderId, variantId } = await paidOrder({ stock: 10, quantity: 2 });
    await processRefund(deps(), { orderId, restockItems: true });
    await db.query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
    await db.query("UPDATE payments SET status = 'succeeded', amount_refunded = 0 WHERE order_id = $1", [orderId]);

    await processRefund(deps(), { orderId, restockItems: true });
    assert.equal(await db.stockOf(variantId), 10);
  });

  it("refuses an unpaid order and one with no payment, without calling Stripe", async () => {
    const { orderId } = await paidOrder();
    await db.query("DELETE FROM payments WHERE order_id = $1", [orderId]);
    const noPayment = deps();
    assert.equal((await processRefund(noPayment, { orderId })).status, 409);
    assert.equal(noPayment.calls.length, 0);

    await db.query("UPDATE orders SET status = 'pending' WHERE id = $1", [orderId]);
    const unpaid = deps();
    assert.equal((await processRefund(unpaid, { orderId })).status, 409);
    assert.equal(unpaid.calls.length, 0);
  });

  it("warns staff not to refund again if recording fails after Stripe accepted", async () => {
    const { orderId } = await paidOrder();
    const result = await processRefund(
      {
        ...deps(),
        transaction: async () => {
          throw new Error("database went away");
        },
      },
      { orderId },
    );
    assert.equal(result.status, 500);
    assert.match(result.body.error, /Do not refund it again/);
  });
});
