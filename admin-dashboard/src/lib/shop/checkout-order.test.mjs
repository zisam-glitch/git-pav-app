// Run with `npm test`. Uses the real migrations on an in-memory Postgres.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { abandonOrder, CheckoutRejected, isPlausibleEmail, parseCheckoutBody, placeOrder } from "./checkout-order.ts";
import { createTestDb } from "./test-db.mjs";

let db;
before(async () => {
  db = await createTestDb();
});
after(() => db.close());

const body = (items, extra = {}) => ({ items, customerEmail: "shopper@example.test", ...extra });
const place = (requestBody) => db.transaction((tx) => placeOrder(tx, parseCheckoutBody(requestBody), null));

async function assertRejected(promise, status, pattern) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof CheckoutRejected, `expected a rejection, got ${error}`);
    assert.equal(error.status, status);
    assert.match(error.message, pattern);
    return true;
  });
}

describe("checkout request validation", () => {
  const productId = "00000000-0000-4000-8000-000000000001";

  for (const quantity of [0, -1, 1.5, "2", 101]) {
    it(`rejects quantity ${JSON.stringify(quantity)}`, () => {
      assert.throws(() => parseCheckoutBody(body([{ productId, quantity }])), CheckoutRejected);
    });
  }

  it("rejects ids that aren't UUIDs before they reach the database", () => {
    assert.throws(() => parseCheckoutBody(body([{ productId: "' OR 1=1 --" }])), CheckoutRejected);
    assert.throws(() => parseCheckoutBody(body([{ productId, variantId: "nope" }])), CheckoutRejected);
  });

  it("rejects an empty bag and a bad email", () => {
    assert.throws(() => parseCheckoutBody(body([])), CheckoutRejected);
    assert.throws(() => parseCheckoutBody({ items: [{ productId }], customerEmail: "nope" }), CheckoutRejected);
  });
});

describe("email shape check", () => {
  it("accepts ordinary addresses", () => {
    for (const email of ["a@b.co", "first.last+tag@example.test", "x@mail.example.test"]) {
      assert.equal(isPlausibleEmail(email), true, email);
    }
  });

  it("rejects malformed addresses", () => {
    for (const email of ["", "nope", "@b.co", "a@", "a@b", "a@.co", "a@b.", "a b@c.co", "a@b@c.co"]) {
      assert.equal(isPlausibleEmail(email), false, email);
    }
  });

  it("answers immediately on the input a backtracking regex is slow on", () => {
    const hostile = `!@!.${"!.".repeat(500_000)}`;
    const started = performance.now();
    assert.equal(isPlausibleEmail(hostile), false);
    assert.ok(performance.now() - started < 100);
  });
});

describe("placing an order", () => {
  it("stores the same total the customer sees, with VAT inside it", async () => {
    const productId = await db.product({ price: "50.00" });
    const discountCode = await db.discount({ value: "10" });

    const placed = await place(body([{ productId }], { discountCode, expectedTotal: 45 }));
    const order = await db.order(placed.orderId);

    assert.equal(order.total, "45.00");
    assert.equal(order.discount_amount, "5.00");
    assert.equal(order.tax_amount, "7.50");
    assert.equal(placed.totals.totalPence, 4500);
  });

  it("refuses another product's cheaper variant", async () => {
    const expensive = await db.product({ price: "500.00" });
    const cheap = await db.product({ price: "1.00" });
    const cheapVariant = await db.variant(cheap, { priceOverride: "1.00" });

    await assertRejected(place(body([{ productId: expensive, variantId: cheapVariant }])), 400, /no longer available/);
  });

  it("uses a variant's own price, including a price override of £0", async () => {
    const productId = await db.product({ price: "20.00" });
    const variantId = await db.variant(productId, { priceOverride: "0.00" });
    const placed = await place(body([{ productId, variantId }]));
    assert.equal(placed.totals.subtotalPence, 0);
  });

  it("counts stock across repeated lines for one variant", async () => {
    const productId = await db.product();
    const variantId = await db.variant(productId, { stock: 3 });
    const items = [
      { productId, variantId, quantity: 2 },
      { productId, variantId, quantity: 2 },
    ];
    await assertRejected(place(body(items)), 400, /Only 3 left/);
  });

  it("refuses an out-of-stock product", async () => {
    const productId = await db.product({ inStock: false });
    await assertRejected(place(body([{ productId }])), 400, /out of stock/);
  });

  it("refuses a delivery option that doesn't exist, rather than delivering free", async () => {
    const productId = await db.product();
    const shippingMethodId = "00000000-0000-4000-8000-00000000abcd";
    await assertRejected(place(body([{ productId }], { shippingMethodId })), 400, /delivery option/);
  });

  it("refuses a discount code that doesn't apply, rather than dropping it silently", async () => {
    const productId = await db.product();
    await assertRejected(place(body([{ productId }], { discountCode: "NOPE" })), 400, /discount code/);
  });

  it("refuses when the total differs from what the customer was shown", async () => {
    const productId = await db.product({ price: "50.00" });
    await assertRejected(place(body([{ productId }], { expectedTotal: 40 })), 409, /changed to £50\.00/);
  });

  it("tolerates a one-penny rounding tie from the checkout page", async () => {
    const productId = await db.product({ price: "50.00" });
    await place(body([{ productId }], { expectedTotal: 50.01 }));
  });

  it("saves nothing when a later line fails", async () => {
    const good = await db.product();
    const discountCode = await db.discount({ maxUses: 5 });
    const [{ count: before }] = await db.query("SELECT count(*)::int AS count FROM orders");

    const missing = "00000000-0000-4000-8000-00000000dead";
    await assertRejected(place(body([{ productId: good }, { productId: missing }], { discountCode })), 400, /no longer/);

    const [{ count: afterCount }] = await db.query("SELECT count(*)::int AS count FROM orders");
    const [{ used_count }] = await db.query("SELECT used_count FROM discounts WHERE code = $1", [discountCode]);
    assert.equal(afterCount, before);
    assert.equal(used_count, 0);
  });
});

describe("discount uses", () => {
  it("won't let the last use be taken twice", async () => {
    const productId = await db.product();
    const discountCode = await db.discount({ maxUses: 1 });

    await place(body([{ productId }], { discountCode }));
    await assertRejected(place(body([{ productId }], { discountCode })), 400, /discount code/);
  });

  it("gives the use back when the payment page can't open, once only", async () => {
    const productId = await db.product();
    const discountCode = await db.discount({ maxUses: 1 });

    const first = await place(body([{ productId }], { discountCode }));
    await db.transaction((tx) => abandonOrder(tx, first.orderId));
    await db.transaction((tx) => abandonOrder(tx, first.orderId));

    assert.equal((await db.order(first.orderId)).status, "cancelled");
    const [{ used_count }] = await db.query("SELECT used_count FROM discounts WHERE code = $1", [discountCode]);
    assert.equal(used_count, 0);

    await place(body([{ productId }], { discountCode }));
  });
});
