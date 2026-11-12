import { checkPhaseChange, statusForPhase, PHASE_MESSAGES } from "../lib/van-dispatch";

// The rulebook for a van stop's phase, as pure functions (plan 16, phase 2).
describe("checkPhaseChange", () => {
  it("allows the normal journey, one step at a time", () => {
    for (const [from, to] of [["queued", "en_route"], ["en_route", "on_site"], ["on_site", "in_treatment"], ["in_treatment", "completed"], ["on_site", "no_show"]]) {
      expect(checkPhaseChange(from, to)).toEqual({ ok: true });
    }
  });

  it("refuses skipping a step, going back, and moving on from a finished stop", () => {
    for (const [from, to] of [["queued", "on_site"], ["queued", "completed"], ["en_route", "in_treatment"], ["on_site", "queued"], ["in_treatment", "no_show"], ["completed", "en_route"], ["no_show", "on_site"]]) {
      const result = checkPhaseChange(from, to);
      expect(result.ok).toBe(false);
    }
  });

  it("says what is allowed next, or that there is nothing", () => {
    expect(checkPhaseChange("queued", "completed")).toMatchObject({ ok: false, message: expect.stringContaining("en_route") });
    expect(checkPhaseChange("completed", "queued")).toMatchObject({ ok: false, message: expect.stringContaining("none (terminal state)") });
  });

  it("lets a check-in park at a stop that was never set off for, and only that", () => {
    expect(checkPhaseChange("queued", "on_site", { viaCheckIn: true })).toEqual({ ok: true });
    expect(checkPhaseChange("en_route", "on_site", { viaCheckIn: true })).toEqual({ ok: true });
    expect(checkPhaseChange("queued", "in_treatment", { viaCheckIn: true }).ok).toBe(false);
  });
});

describe("statusForPhase and PHASE_MESSAGES", () => {
  it("maps each phase to the request status that goes with it", () => {
    expect(statusForPhase("en_route")).toBe("in_progress");
    expect(statusForPhase("in_treatment")).toBe("in_progress");
    expect(statusForPhase("completed")).toBe("completed");
    expect(statusForPhase("no_show")).toBe("no_show");
  });

  it("tells the patient about setting off, arriving, finishing and a missed visit, not about internal steps", () => {
    expect(Object.keys(PHASE_MESSAGES).sort()).toEqual(["completed", "en_route", "no_show", "on_site"]);
    expect(PHASE_MESSAGES.in_treatment).toBeUndefined();
  });
});
