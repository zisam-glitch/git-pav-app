import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldLoadAnalytics } from "./analytics.ts";

test("analytics loads only after the visitor accepts cookies", () => {
  assert.equal(shouldLoadAnalytics("accepted", "G-ZZW34YMNDY"), true);
  assert.equal(shouldLoadAnalytics("declined", "G-ZZW34YMNDY"), false);
  assert.equal(shouldLoadAnalytics(null, "G-ZZW34YMNDY"), false);
});

test("analytics needs a real measurement id", () => {
  assert.equal(shouldLoadAnalytics("accepted", "G-XXXXXXXXXX"), false);
  assert.equal(shouldLoadAnalytics("accepted", ""), false);
  assert.equal(shouldLoadAnalytics("accepted", "UA-12345-1"), false);
});
