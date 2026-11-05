// Run with `npm test`. Node strips the types from pav-van-shifts.ts when it is imported.

import {
  SHIFTS_PAGE_SIZE,
  SHIFT_STATUS_LABEL,
  STALE_AFTER_MINUTES,
  agoLabel,
  endShiftQuestion,
  freshness,
  freshnessLabel,
  shiftLength,
  shiftsPath,
} from "./pav-van-shifts.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const ID = "6b1c7f3e-2a4d-4e8b-9c0a-1d2e3f4a5b6c";
const NOW = new Date("2031-03-11T10:00:00Z");
const ago = (minutes) => new Date(NOW.getTime() - minutes * 60_000).toISOString();

describe("shiftsPath", () => {
  it("sends only the filters that are set", () => {
    assert.equal(shiftsPath({ state: "", vanId: "" }), `van-shifts?page=1&limit=${SHIFTS_PAGE_SIZE}`);
    assert.equal(
      shiftsPath({ state: "live", vanId: ID }, 2),
      `van-shifts?page=2&limit=${SHIFTS_PAGE_SIZE}&state=live&vanId=${ID}`,
    );
  });

  it("drops anything malformed", () => {
    assert.equal(shiftsPath({ state: "sideways", vanId: "nope" }), `van-shifts?page=1&limit=${SHIFTS_PAGE_SIZE}`);
  });

  it("never asks for a page below 1", () => {
    assert.match(shiftsPath({ state: "", vanId: "" }, -2), /page=1&/);
  });
});

describe("freshness", () => {
  it("has nothing to chase once a shift has ended", () => {
    assert.deepEqual(freshness({ live: false, lastSeenAt: ago(500) }, NOW), { kind: "ended" });
  });

  it("flags a live van that has never reported in", () => {
    assert.deepEqual(freshness({ live: true, lastSeenAt: null }, NOW), { kind: "never" });
  });

  it("is fresh until the stale limit, then stale", () => {
    assert.deepEqual(freshness({ live: true, lastSeenAt: ago(3) }, NOW), { kind: "fresh", minutes: 3 });
    assert.deepEqual(freshness({ live: true, lastSeenAt: ago(STALE_AFTER_MINUTES - 1) }, NOW), {
      kind: "fresh",
      minutes: STALE_AFTER_MINUTES - 1,
    });
    assert.deepEqual(freshness({ live: true, lastSeenAt: ago(STALE_AFTER_MINUTES) }, NOW), {
      kind: "stale",
      minutes: STALE_AFTER_MINUTES,
    });
  });

  it("doesn't go negative if the clocks disagree", () => {
    assert.deepEqual(freshness({ live: true, lastSeenAt: ago(-5) }, NOW), { kind: "fresh", minutes: 0 });
  });
});

describe("labels", () => {
  it("says how long ago in plain words", () => {
    assert.equal(agoLabel(0), "Just now");
    assert.equal(agoLabel(5), "5 min ago");
    assert.equal(agoLabel(60), "1 hr ago");
    assert.equal(agoLabel(65), "1 hr 5 min ago");
    assert.equal(agoLabel(60 * 26), "1 day ago");
    assert.equal(agoLabel(60 * 50), "2 days ago");
  });

  it("words every kind of freshness", () => {
    assert.equal(freshnessLabel({ kind: "ended" }), "Shift ended");
    assert.equal(freshnessLabel({ kind: "never" }), "No location yet");
    assert.equal(freshnessLabel({ kind: "stale", minutes: 12 }), "12 min ago");
  });

  it("names every shift status", () => {
    assert.deepEqual(Object.keys(SHIFT_STATUS_LABEL).sort(), ["offline", "online", "paused"]);
  });
});

describe("shiftLength", () => {
  it("measures a finished shift", () => {
    assert.equal(
      shiftLength({ startedAt: "2031-03-10T08:00:00Z", endedAt: "2031-03-10T16:30:00Z" }, NOW),
      "8 hr 30 min",
    );
    assert.equal(shiftLength({ startedAt: "2031-03-10T08:00:00Z", endedAt: "2031-03-10T10:00:00Z" }, NOW), "2 hr");
  });

  it("measures a live shift up to now", () => {
    assert.equal(shiftLength({ startedAt: "2031-03-11T09:45:00Z", endedAt: null }, NOW), "15 min");
  });
});

describe("endShiftQuestion", () => {
  const shift = { vanName: "Van One", operatorName: "Sam Driver", openRequests: 0 };

  it("names the operator and the van, and says it can't be undone", () => {
    const q = endShiftQuestion(shift);
    assert.match(q, /End Sam Driver's shift on Van One\?/);
    assert.match(q, /start a new shift/);
    assert.match(q, /can't be undone/);
  });

  it("says nothing about waiting requests when there are none", () => {
    assert.doesNotMatch(endShiftQuestion(shift), /open request/);
  });

  it("warns that waiting requests are expired and patients told, in the right number", () => {
    assert.match(
      endShiftQuestion({ ...shift, openRequests: 1 }),
      /1 open request will be expired.*the patient is told/,
    );
    assert.match(
      endShiftQuestion({ ...shift, openRequests: 3 }),
      /3 open requests will be expired.*the patients are told/,
    );
  });

  it("says accepted visits are not affected and block the end", () => {
    assert.match(endShiftQuestion(shift), /already accepted are not affected/);
  });
});
