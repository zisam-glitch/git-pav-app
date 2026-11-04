// Run with `npm test`. Production builds strip console calls, but never
// console.error or console.warn: they are the dashboard's server error log.

import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("next.config compiler.removeConsole", () => {
  it("keeps error and warn in production builds", async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const { default: config } = await import(`../next.config.mjs?production=${Date.now()}`);
      assert.deepEqual(config.compiler.removeConsole, { exclude: ["error", "warn"] });
    } finally {
      process.env.NODE_ENV = previous;
    }
  });
});

describe("next.config security headers", () => {
  it("sends them on every route, and still lets the dashboard frame its own pages", async () => {
    const { default: config } = await import(`../next.config.mjs?headers=${Date.now()}`);
    const [rule] = await config.headers();
    const headers = Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));

    assert.equal(rule.source, "/:path*");
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["X-Frame-Options"], "SAMEORIGIN");
    assert.match(headers["Strict-Transport-Security"], /max-age=\d{7,}/);
    assert.ok(headers["Referrer-Policy"]);
    assert.ok(headers["Permissions-Policy"]);
  });
});
