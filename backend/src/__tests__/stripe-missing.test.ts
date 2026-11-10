import { isStripeMissingResource } from "../lib/stripe-errors";

describe("removing a saved card", () => {
  it("treats a card Stripe no longer has as already gone", () => {
    expect(isStripeMissingResource({ code: "resource_missing" })).toBe(true);
    expect(isStripeMissingResource({ statusCode: 404 })).toBe(true);
  });
  it("still fails on other Stripe errors", () => {
    expect(isStripeMissingResource({ code: "api_connection_error" })).toBe(false);
    expect(isStripeMissingResource(new Error("boom"))).toBe(false);
    expect(isStripeMissingResource(null)).toBe(false);
  });
});
