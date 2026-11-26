// Run with `npm test`.
// Every public form route must refuse a malformed email before it saves anything.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const routes = [
  "forms/contact",
  "forms/vacancy",
  "forms/petition",
  "bookings",
  "newsletter/subscribe",
];

describe("public form routes", () => {
  for (const route of routes) {
    it(`${route} checks the email's format and rate limits before saving`, () => {
      const source = readFileSync(new URL(`../app/api/v1/${route}/route.ts`, import.meta.url), "utf8");
      assert.match(source, /isValidEmail\(/, "no email format check");
      assert.match(source, /rateLimit\(request, "publicForm"\)/, "no rate limit");
      assert.ok(source.indexOf("isValidEmail(") < source.search(/INSERT INTO/), "the email is checked after the insert");
    });
  }

  it("the registration route validates its email in validateRegistration", () => {
    const source = readFileSync(new URL("./registration-submission.ts", import.meta.url), "utf8");
    assert.match(source, /A valid email address is required/);
  });
});
