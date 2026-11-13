import { checkPhaseChange, statusForPhase, PHASE_MESSAGES, checkDecision, declineMessage } from "../lib/van-dispatch";

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

// Accept and decline: what a pending request may do, as one pure rule.
describe("checkDecision", () => {
  const now = new Date("2026-11-13T10:00:00Z");
  const pending = { status: "pending", appointmentId: null, expiresAt: new Date("2026-11-13T10:04:00Z") };

  it("lets a pending request be accepted or declined", () => {
    expect(checkDecision(pending, "accept", now)).toEqual({ kind: "go" });
    expect(checkDecision(pending, "decline", now)).toEqual({ kind: "go" });
  });

  it("treats a second tap of the same answer as a repeat, not an error", () => {
    expect(checkDecision({ ...pending, status: "accepted", appointmentId: "appt-1" }, "accept", now)).toEqual({ kind: "repeat" });
    expect(checkDecision({ ...pending, status: "declined" }, "decline", now)).toEqual({ kind: "repeat" });
  });

  it("refuses the opposite answer once one has been given", () => {
    expect(checkDecision({ ...pending, status: "declined" }, "accept", now)).toMatchObject({ kind: "refuse", error: "Request is already declined" });
    expect(checkDecision({ ...pending, status: "accepted", appointmentId: "appt-1" }, "decline", now)).toMatchObject({ kind: "refuse", error: "Request is already accepted" });
  });

  it("refuses any answer to a request that was cancelled, timed out or is finished", () => {
    for (const status of ["cancelled", "expired", "in_progress", "completed", "no_show"]) {
      expect(checkDecision({ ...pending, status }, "accept", now).kind).toBe("refuse");
      expect(checkDecision({ ...pending, status }, "decline", now).kind).toBe("refuse");
    }
  });

  it("refuses accepting a request whose time ran out before the sweep marked it, but still lets it be declined", () => {
    const late = { ...pending, expiresAt: new Date("2026-11-13T09:59:59Z") };
    expect(checkDecision(late, "accept", now)).toMatchObject({ kind: "refuse", error: "Request expired" });
    expect(checkDecision(late, "decline", now)).toEqual({ kind: "go" });
  });
});

describe("declineMessage", () => {
  it("never says no deposit was taken when the hold could not be released yet", () => {
    expect(declineMessage("failed")).not.toContain("No deposit was taken");
    expect(declineMessage("released")).toContain("No deposit was taken");
    expect(declineMessage(null)).toContain("No deposit was taken");
  });
});
