// Run with `npm test`. Uses the real migrations on an in-memory Postgres.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { cartItemBelongsToSession } from "./cart-access.ts";
import { createTestDb } from "./test-db.mjs";

let db;
let itemId;

before(async () => {
  db = await createTestDb();
  const productId = await db.product();
  const [cart] = await db.query("INSERT INTO carts (session_id) VALUES ('session-a') RETURNING id");
  await db.query("INSERT INTO carts (session_id) VALUES ('session-b')");
  const [item] = await db.query("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, 1) RETURNING id", [
    cart.id,
    productId,
  ]);
  itemId = item.id;
});
after(() => db.close());

describe("cart item ownership", () => {
  it("allows the session whose cart holds the item", async () => {
    assert.equal(await cartItemBelongsToSession(db.query, itemId, "session-a"), true);
  });

  it("refuses another guest's session", async () => {
    assert.equal(await cartItemBelongsToSession(db.query, itemId, "session-b"), false);
  });

  it("refuses a missing or malformed session or item id", async () => {
    for (const [item, session] of [
      [itemId, undefined],
      [itemId, ""],
      [itemId, { $ne: "" }],
      ["temp_123", "session-a"],
      ["00000000-0000-4000-8000-000000000000", "session-a"],
    ]) {
      assert.equal(await cartItemBelongsToSession(db.query, item, session), false);
    }
  });
});
