// Run with `npm test`. Uses the real migration on an in-memory Postgres.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { deleteExpiredRateLimits, hitRateLimit, rateLimitKey } from "./rate-limit-core.ts";
import { createTestDb } from "./shop/test-db.mjs";

let db;
let counter = 0;
const freshKey = () => `test:${++counter}`;

before(async () => {
  db = await createTestDb();
});
after(() => db.close());

describe("rate limits", () => {
  it("allows up to the limit, then refuses and says when to retry", async () => {
    const key = freshKey();
    assert.equal((await hitRateLimit(db.query, key, 2, 60)).allowed, true);
    assert.equal((await hitRateLimit(db.query, key, 2, 60)).allowed, true);

    const refused = await hitRateLimit(db.query, key, 2, 60);
    assert.equal(refused.allowed, false);
    assert.ok(refused.retryAfterSeconds > 0 && refused.retryAfterSeconds <= 60);
  });

  it("counts each caller separately", async () => {
    const [first, second] = [freshKey(), freshKey()];
    await hitRateLimit(db.query, first, 1, 60);
    assert.equal((await hitRateLimit(db.query, first, 1, 60)).allowed, false);
    assert.equal((await hitRateLimit(db.query, second, 1, 60)).allowed, true);
  });

  it("starts counting again once the window has passed", async () => {
    const key = freshKey();
    await hitRateLimit(db.query, key, 1, 60);
    await db.query("UPDATE rate_limit_counters SET window_ends_at = now() - interval '1 second' WHERE key = $1", [key]);
    assert.equal((await hitRateLimit(db.query, key, 1, 60)).allowed, true);
  });

  it("doesn't lose counts when requests arrive together", async () => {
    const key = freshKey();
    const results = await Promise.all(Array.from({ length: 20 }, () => hitRateLimit(db.query, key, 5, 60)));
    assert.equal(results.filter((result) => result.allowed).length, 5);
  });

  it("tidies up finished windows and keeps running ones", async () => {
    const [finished, running] = [freshKey(), freshKey()];
    await hitRateLimit(db.query, finished, 1, 60);
    await hitRateLimit(db.query, running, 1, 60);
    await db.query("UPDATE rate_limit_counters SET window_ends_at = now() - interval '1 second' WHERE key = $1", [
      finished,
    ]);

    await deleteExpiredRateLimits(db.query);
    const left = await db.query("SELECT key FROM rate_limit_counters WHERE key = ANY($1)", [[finished, running]]);
    assert.deepEqual(
      left.map((row) => row.key),
      [running],
    );
  });

  it("stores no raw IP address or email, and ignores case in identifiers", () => {
    const key = rateLimitKey("login", "Shopper@Example.test");
    assert.ok(!key.toLowerCase().includes("shopper"));
    assert.equal(key, rateLimitKey("login", " shopper@example.test "));
    assert.notEqual(key, rateLimitKey("register", "shopper@example.test"));
  });
});
