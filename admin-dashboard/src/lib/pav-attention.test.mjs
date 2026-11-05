// Run with `npm test`. Node strips the types from pav-attention.ts when it is imported.

import { attentionItems, hasUrgent } from "./pav-attention.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const quiet = {
  visitsToday: 0,
  visitsLeftToday: 0,
  unreadThreads: 0,
  erasureOpen: 0,
  erasureOverdue: 0,
  cardFailuresLastWeek: 0,
  depositReleaseFailures: 0,
  vansOut: 0,
  asOf: "2031-03-11T10:00:00.000Z",
};
const find = (items, key) => items.find((item) => item.key === key);

describe("attentionItems", () => {
  it("is all clear or just information when nothing needs a person", () => {
    const items = attentionItems(quiet);
    assert.equal(items.length, 6);
    assert.equal(hasUrgent(items), false);
    assert.ok(items.every((item) => item.tone === "clear" || item.tone === "info"));
    assert.equal(find(items, "erasure").note, "None waiting");
    assert.equal(find(items, "visits").note, "No visits today");
  });

  it("makes an overdue erasure request urgent and says how many", () => {
    const items = attentionItems({ ...quiet, erasureOpen: 3, erasureOverdue: 1 });
    const erasure = find(items, "erasure");
    assert.equal(erasure.tone, "urgent");
    assert.equal(erasure.count, 3);
    assert.equal(erasure.note, "1 past the one-month deadline");
    assert.equal(hasUrgent(items), true);
  });

  it("treats erasure requests still inside their month as action, not urgent", () => {
    const erasure = find(attentionItems({ ...quiet, erasureOpen: 2 }), "erasure");
    assert.equal(erasure.tone, "action");
    assert.equal(erasure.note, "All within the one-month deadline");
  });

  it("makes failed payments and stuck deposits urgent", () => {
    const items = attentionItems({ ...quiet, cardFailuresLastWeek: 2, depositReleaseFailures: 1 });
    assert.equal(find(items, "card").tone, "urgent");
    assert.equal(find(items, "deposit").tone, "urgent");
  });

  it("makes waiting messages an action", () => {
    assert.equal(find(attentionItems({ ...quiet, unreadThreads: 1 }), "inbox").note, "Conversation to read");
    assert.equal(find(attentionItems({ ...quiet, unreadThreads: 4 }), "inbox").note, "Conversations to read");
    assert.equal(find(attentionItems({ ...quiet, unreadThreads: 4 }), "inbox").tone, "action");
  });

  it("puts the worst first and keeps a steady order within a tone", () => {
    const items = attentionItems({
      ...quiet,
      visitsToday: 5,
      visitsLeftToday: 2,
      unreadThreads: 1,
      cardFailuresLastWeek: 1,
      erasureOpen: 1,
      erasureOverdue: 1,
    });
    assert.deepEqual(
      items.map((item) => item.key),
      ["erasure", "card", "inbox", "visits", "vans", "deposit"],
    );
  });

  it("links every item to a screen in the dashboard", () => {
    for (const item of attentionItems(quiet)) assert.match(item.href, /^\/dashboard\/[a-z-]+$/);
  });

  it("says how many of today's visits are still to come", () => {
    assert.equal(
      find(attentionItems({ ...quiet, visitsToday: 8, visitsLeftToday: 3 }), "visits").note,
      "3 still to come",
    );
  });
});
