import { judgePing, isPositionStale, POSITION_STALE_MS } from "../lib/van-location";

// N14, N18: which van position reports to believe, and when a van has gone
// quiet. Pure functions with a pinned clock; synthetic coordinates only.
const NOW = new Date("2031-03-11T10:00:00Z");
const at = (secondsAgo: number) => new Date(NOW.getTime() - secondsAgo * 1000);
const here = { lat: 51.5, lng: -0.12 };

describe("judgePing", () => {
  it("accepts a first report and stamps it with the phone's time", () => {
    const verdict = judgePing(null, { ...here, recordedAt: at(5) }, NOW);
    expect(verdict).toEqual({ accept: true, recordedAt: at(5) });
  });

  it("uses the server time when the phone sends none", () => {
    expect(judgePing(null, here, NOW)).toEqual({ accept: true, recordedAt: NOW });
  });

  it("pulls a phone clock running ahead back to now", () => {
    const verdict = judgePing(null, { ...here, recordedAt: new Date(NOW.getTime() + 3_600_000) }, NOW);
    expect(verdict).toEqual({ accept: true, recordedAt: NOW });
  });

  it("ignores a report that is minutes old when it arrives", () => {
    expect(judgePing(null, { ...here, recordedAt: at(400) }, NOW)).toEqual({ accept: false, reason: "too_old" });
  });

  it("ignores a rough fix but keeps a good one", () => {
    expect(judgePing(null, { ...here, accuracyM: 900 }, NOW)).toEqual({ accept: false, reason: "inaccurate" });
    expect(judgePing(null, { ...here, accuracyM: 12 }, NOW).accept).toBe(true);
  });

  it("ignores a report no newer than the last one (out of order or repeated)", () => {
    const previous = { ...here, at: at(10) };
    expect(judgePing(previous, { ...here, recordedAt: at(20) }, NOW)).toEqual({ accept: false, reason: "out_of_order" });
    expect(judgePing(previous, { ...here, recordedAt: at(10) }, NOW)).toEqual({ accept: false, reason: "out_of_order" });
  });

  it("ignores a jump no van could make, but not ordinary driving", () => {
    const previous = { ...here, at: at(20) };
    // About 11 km north in 15 seconds.
    expect(judgePing(previous, { lat: 51.6, lng: -0.12, recordedAt: at(5) }, NOW)).toEqual({
      accept: false,
      reason: "impossible_speed",
    });
    // About 220 m in 15 seconds: 53 km/h.
    expect(judgePing(previous, { lat: 51.502, lng: -0.12, recordedAt: at(5) }, NOW).accept).toBe(true);
  });

  it("does not call GPS noise on a stationary van a jump", () => {
    const previous = { ...here, at: at(2) };
    expect(judgePing(previous, { lat: 51.5002, lng: -0.12, recordedAt: at(1) }, NOW).accept).toBe(true);
  });
});

describe("isPositionStale", () => {
  it("is false for a fresh report and true once the limit passes", () => {
    expect(isPositionStale(at(30), NOW)).toBe(false);
    expect(isPositionStale(new Date(NOW.getTime() - POSITION_STALE_MS - 1000), NOW)).toBe(true);
  });

  it("does not call a shift with no report stale", () => {
    expect(isPositionStale(null, NOW)).toBe(false);
  });
});
