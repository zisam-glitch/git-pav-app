// Runs the shop's real checkout, webhook and refund code against Stripe's test
// mode, using an in-memory database. It never touches a real database, and it
// refuses to start with anything but a test key. Run from admin-dashboard/:
//
//   node --experimental-strip-types --env-file=.env.local scripts/stripe-test-mode-check.mjs
//
// It leaves test customers' payments and refunds in your Stripe test account.
// Not covered: paying on Stripe's hosted page, and real webhook delivery to a
// deployed site. Check those by hand after deploying.
import Stripe from "stripe";

import { parseCheckoutBody, placeOrder } from "../src/lib/shop/checkout-order.ts";
import { checkoutSessionParams } from "../src/lib/shop/checkout-session.ts";
import { toPence } from "../src/lib/shop/pricing.ts";
import { processRefund } from "../src/lib/shop/refunds.ts";
import { handleStripeEvent } from "../src/lib/shop/stripe-events.ts";
import { createTestDb } from "../src/lib/shop/test-db.mjs";

const key = process.env.STRIPE_SECRET_KEY ?? "";
if (!/^(sk|rk)_test_/.test(key)) {
  console.error("Refusing to run: STRIPE_SECRET_KEY must be set to a Stripe test key (sk_test_...).");
  process.exit(2);
}

const stripe = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
const db = await createTestDb();
let failures = 0;
let eventCounter = 0;

const clean = (message) => String(message).replace(/\b(sk|rk|whsec)_[A-Za-z0-9_*]+/g, "[redacted]");

function expectEqual(label, actual, expected) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

async function check(name, run) {
  try {
    await run();
    console.log(`PASS  ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${name}\n      ${clean(error.message)}`);
  }
}

const apply = (type, object) =>
  db.transaction((tx) => handleStripeEvent(tx, { id: `evt_check_${++eventCounter}`, type, data: { object } }));

async function newOrder({ price = "50.00", quantity = 1, stock = 10, discountCode } = {}) {
  const productId = await db.product({ price });
  const variantId = await db.variant(productId, { stock });
  const input = parseCheckoutBody({
    items: [{ productId, variantId, quantity }],
    customerEmail: "stripe-check@example.test",
    discountCode,
  });
  const placed = await db.transaction((tx) => placeOrder(tx, input));
  return { ...placed, variantId, input };
}

const createSession = (order) =>
  stripe.checkout.sessions.create(
    checkoutSessionParams({
      placed: order,
      customerEmail: order.input.customerEmail,
      cartSessionId: "stripe-check",
      storefrontUrl: "https://example.test",
      orderLink: "test-link",
    }),
  );

async function paidOrder(options) {
  const order = await newOrder(options);
  const intent = await stripe.paymentIntents.create({
    amount: order.totals.totalPence,
    currency: "gbp",
    payment_method: "pm_card_visa",
    payment_method_types: ["card"],
    confirm: true,
    metadata: { orderId: order.orderId },
  });
  await apply("checkout.session.completed", {
    id: "cs_check",
    payment_status: "paid",
    payment_intent: intent.id,
    amount_total: intent.amount,
    currency: intent.currency,
    metadata: { orderId: order.orderId },
  });
  return { ...order, intent };
}

const refundDeps = {
  query: db.query,
  transaction: db.transaction,
  createStripeRefund: async ({ paymentIntent, amountPence, idempotencyKey }) => {
    const refund = await stripe.refunds.create(
      { payment_intent: paymentIntent, amount: amountPence, reason: "requested_by_customer" },
      { idempotencyKey },
    );
    return refund.id;
  },
};

const chargeOf = async (intentId) => {
  const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
  return intent.latest_charge;
};

await check("Stripe charges the discounted total: £50 less 10% is £45", async () => {
  const order = await newOrder({ discountCode: await db.discount({ value: "10" }) });
  const session = await createSession(order);
  expectEqual("amount_total", session.amount_total, 4500);
  expectEqual("currency", session.currency, "gbp");
  if (!session.url) throw new Error("no checkout URL");
});

await check("A total that splits unevenly still matches to the penny", async () => {
  const order = await newOrder({
    price: "19.99",
    quantity: 3,
    discountCode: await db.discount({ value: "33.33" }),
  });
  const session = await createSession(order);
  expectEqual("amount_total", session.amount_total, order.totals.totalPence);
});

await check("Delivery is charged on an order under £40", async () => {
  const order = await newOrder({ price: "10.00" });
  const session = await createSession(order);
  expectEqual("amount_total", session.amount_total, 1399);
});

await check("Stripe accepts a 100%-off order", async () => {
  const order = await newOrder({ discountCode: await db.discount({ value: "100" }) });
  expectEqual("order total", order.totals.totalPence, 0);
  const session = await createSession(order);
  expectEqual("amount_total", session.amount_total, 0);
});

await check("An expired checkout cancels the order and gives back the discount use", async () => {
  const discountCode = await db.discount({ maxUses: 1 });
  const order = await newOrder({ discountCode });
  const session = await stripe.checkout.sessions.expire((await createSession(order)).id);
  expectEqual("session status", session.status, "expired");

  await apply("checkout.session.expired", session);
  expectEqual("order status", (await db.order(order.orderId)).status, "cancelled");
  const [{ used_count }] = await db.query("SELECT used_count FROM discounts WHERE code = $1", [discountCode]);
  expectEqual("discount uses", used_count, 0);
});

await check("A declined card marks the order failed, using Stripe's real event data", async () => {
  const order = await newOrder();
  let intentId;
  try {
    await stripe.paymentIntents.create({
      amount: order.totals.totalPence,
      currency: "gbp",
      payment_method: "pm_card_chargeDeclined",
      payment_method_types: ["card"],
      confirm: true,
      metadata: { orderId: order.orderId },
    });
    throw new Error("the test card was not declined");
  } catch (error) {
    intentId = error?.payment_intent?.id;
    if (!intentId) throw error;
  }
  await apply("payment_intent.payment_failed", await stripe.paymentIntents.retrieve(intentId));
  expectEqual("order status", (await db.order(order.orderId)).status, "payment_failed");
});

await check("A real payment marks the order paid and takes stock", async () => {
  const order = await paidOrder({ stock: 5, quantity: 2, price: "25.00" });
  expectEqual("payment status", order.intent.status, "succeeded");
  expectEqual("order status", (await db.order(order.orderId)).status, "paid");
  expectEqual("stock", await db.stockOf(order.variantId), 3);
});

await check("Partial then full refund through Stripe, with stock returned once", async () => {
  const order = await paidOrder({ stock: 5, quantity: 2, price: "25.00" });

  const partial = await processRefund(refundDeps, { orderId: order.orderId, refundAmount: "10.00" });
  expectEqual("partial refund", partial.status, 200);
  expectEqual("order after partial", (await db.order(order.orderId)).status, "paid");
  expectEqual("Stripe refunded", (await chargeOf(order.intent.id)).amount_refunded, 1000);

  const rest = await processRefund(refundDeps, { orderId: order.orderId });
  expectEqual("full refund", rest.status, 200);
  expectEqual("order after full", (await db.order(order.orderId)).status, "refunded");
  const charge = await chargeOf(order.intent.id);
  expectEqual("Stripe refunded in total", charge.amount_refunded, 5000);
  expectEqual("Stripe marks it refunded", charge.refunded, true);
  expectEqual("stock", await db.stockOf(order.variantId), 5);

  const again = await processRefund(refundDeps, { orderId: order.orderId });
  expectEqual("second refund refused", again.status, 400);

  await apply("charge.refunded", charge);
  const [payment] = await db.query("SELECT status, amount_refunded FROM payments WHERE order_id = $1", [order.orderId]);
  expectEqual("payment status", payment.status, "refunded");
  expectEqual("payment refunded", toPence(payment.amount_refunded), 5000);
});

await check("Repeating a refund request can't refund twice at Stripe", async () => {
  const order = await paidOrder({ quantity: 1, price: "50.00" });
  const refund = { paymentIntent: order.intent.id, amountPence: 500, idempotencyKey: `check-${order.orderId}` };
  const first = await refundDeps.createStripeRefund(refund);
  const second = await refundDeps.createStripeRefund(refund);
  expectEqual("same refund returned", second, first);
  expectEqual("Stripe refunded", (await chargeOf(order.intent.id)).amount_refunded, 500);
});

await check("When Stripe refuses a refund, the order doesn't change", async () => {
  const order = await paidOrder({ stock: 5, quantity: 1, price: "50.00" });
  await db.query("UPDATE payments SET stripe_payment_intent_id = 'pi_does_not_exist' WHERE order_id = $1", [order.orderId]);

  const result = await processRefund(refundDeps, { orderId: order.orderId });
  expectEqual("response", result.status, 502);
  expectEqual("order status", (await db.order(order.orderId)).status, "paid");
  expectEqual("stock", await db.stockOf(order.variantId), 4);
});

await db.close();
console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
console.log("Not covered: paying on Stripe's hosted page, and real webhook delivery to a deployed site.");
process.exit(failures === 0 ? 0 : 1);
