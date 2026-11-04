// Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { priceOrder, shippingPence, stripeLineItems, toPence, toPounds } from "./pricing.ts";

const line = (unitPence, quantity = 1) => ({ productId: "p", variantId: null, name: "Item", unitPence, quantity });
const charged = (items) => items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0);

describe("order totals", () => {
  it("charges what the customer was shown: £50 with 10% off is £45, not £50 or £54", () => {
    const lines = [line(5000)];
    const totals = priceOrder(lines, null, { type: "percentage", value: "10" });
    assert.equal(totals.discountPence, 500);
    assert.equal(totals.shippingPence, 0);
    assert.equal(totals.totalPence, 4500);
    assert.equal(charged(stripeLineItems(lines, totals, "Standard UK")), 4500);
  });

  it("reports VAT as part of the total and doesn't add it on top", () => {
    const totals = priceOrder([line(6000)], null, null);
    assert.equal(totals.totalPence, 6000);
    assert.equal(totals.vatPence, 1000);
  });

  it("uses the subtotal before discount for free delivery, as the checkout page does", () => {
    assert.equal(priceOrder([line(4000)], null, { type: "percentage", value: "50" }).shippingPence, 0);
    assert.equal(priceOrder([line(3999)], null, null).shippingPence, 399);
  });

  it("applies a delivery method's own price and free-delivery threshold", () => {
    const rate = { name: "Express", basePence: 800, freeFromPence: 10000 };
    assert.equal(shippingPence(9999, rate), 800);
    assert.equal(shippingPence(10000, rate), 0);
    assert.equal(shippingPence(10000, { ...rate, freeFromPence: null }), 800);
  });

  it("never discounts more than the goods cost", () => {
    const totals = priceOrder([line(1000)], null, { type: "fixed_amount", value: "25.00" });
    assert.equal(totals.discountPence, 1000);
    assert.equal(totals.totalPence, 399);
  });

  it("handles float-unfriendly prices exactly", () => {
    assert.equal(toPence("19.99"), 1999);
    assert.equal(toPence("1.10"), 110);
    assert.equal(toPounds(1999), "19.99");
  });
});

describe("Stripe line items", () => {
  it("adds up to the order total to the penny, whatever the split", () => {
    const cases = [
      [[line(333, 3), line(1999, 7), line(1)], { type: "percentage", value: "33.33" }],
      [[line(1, 100), line(2, 100)], { type: "fixed_amount", value: "1.01" }],
      [[line(1999), line(1999), line(1999)], { type: "fixed_amount", value: "0.01" }],
      [[line(5000, 2)], { type: "percentage", value: "100" }],
      [[line(1250, 3)], null],
    ];
    for (const [lines, discount] of cases) {
      const totals = priceOrder(lines, null, discount);
      const items = stripeLineItems(lines, totals, "Standard UK");
      assert.equal(charged(items), totals.totalPence);
      assert.ok(items.every((item) => item.price_data.unit_amount >= 0));
    }
  });

  it("names the quantity and shows delivery as its own line", () => {
    const lines = [line(1000, 2)];
    const items = stripeLineItems(lines, priceOrder(lines, null, null), "Standard UK");
    assert.equal(items[0].price_data.product_data.name, "Item × 2");
    assert.equal(items[1].price_data.product_data.name, "Delivery (Standard UK)");
    assert.equal(items[1].price_data.unit_amount, 399);
  });

  it("refuses to build a charge that doesn't match the total", () => {
    const lines = [line(1000)];
    assert.throws(() => stripeLineItems(lines, { ...priceOrder(lines, null, null), totalPence: 1 }, "Standard UK"));
  });
});
