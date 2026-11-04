// Run with `npm test`. Uses the real migrations on an in-memory Postgres.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { createTestDb } from "../shop/test-db.mjs";

let db;
const tableExists = async (name) => (await db.query("SELECT to_regclass($1) AS t", [name]))[0].t !== null;

before(async () => {
  db = await createTestDb();
});
after(() => db.close());

describe("dropping shopper accounts", () => {
  it("removes the users table and keeps what orders rely on", async () => {
    assert.equal(await tableExists("users"), false);
    for (const table of ["orders", "carts", "inventory_logs", "audit_logs"]) {
      assert.equal(await tableExists(table), true, table);
    }
  });

  it("stays dropped across a cold start and keeps existing orders", async () => {
    const [order] = await db.query(
      "INSERT INTO orders (total, customer_email) VALUES ('10.00', 'guest@example.test') RETURNING id",
    );

    await db.runMigrations();

    assert.equal(await tableExists("users"), false);
    assert.equal((await db.order(order.id)).customer_email, "guest@example.test");
  });

  it("leaves no foreign key to users, so orders can still be written", async () => {
    const orphanUserId = "00000000-0000-4000-8000-000000000001";
    await db.query("INSERT INTO orders (total, user_id) VALUES ('10.00', $1)", [orphanUserId]);
  });
});
