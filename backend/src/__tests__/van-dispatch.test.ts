import { getCancellationPolicy, vanCancellationPolicy } from "../lib/cancellation-policy";
import { checkPhaseChange, statusForPhase, PHASE_MESSAGES, checkDecision, declineMessage, pendingCloseMessage, checkCancel, checkVanSideCancel, vanCancelledMessage, VAN_CANCEL_REASONS, checkNoShow } from "../lib/van-dispatch";

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

// A request that ends without an accept: declined, timed out, or the shift ended.
describe("pendingCloseMessage", () => {
  it("has a title and a reason for each way a request can end without an accept", () => {
    expect(pendingCloseMessage("declined", null).title).toBe("Van Request Declined");
    expect(pendingCloseMessage("expired", null)).toMatchObject({ title: "Van Request Expired", body: expect.stringContaining("in time") });
    expect(pendingCloseMessage("shift_ended", null)).toMatchObject({ title: "Van Went Offline", body: expect.stringContaining("ended its shift") });
  });

  it("only says no deposit was taken when the hold is not still waiting to be released", () => {
    for (const how of ["declined", "expired", "shift_ended"] as const) {
      expect(pendingCloseMessage(how, "failed").body).toContain("We are releasing your deposit hold");
      expect(pendingCloseMessage(how, "failed").body).not.toContain("No deposit was taken");
      expect(pendingCloseMessage(how, "released").body).toContain("No deposit was taken");
    }
  });

  it("says the deposit was refunded when it had been taken before the request closed", () => {
    for (const how of ["declined", "expired", "shift_ended"] as const) {
      const body = pendingCloseMessage(how, "refunded").body;
      expect(body).toContain("Your deposit has been refunded in full");
      expect(body).not.toContain("No deposit was taken");
      expect(pendingCloseMessage(how, "pending").body).not.toContain("No deposit was taken");
    }
  });
});

// A patient cancelling: allowed until treatment starts, and safe to repeat.
describe("checkCancel", () => {
  it("lets a request be cancelled while it waits, is queued, or the van is on its way or outside", () => {
    for (const [status, phase] of [["pending", null], ["accepted", "queued"], ["in_progress", "en_route"], ["in_progress", "on_site"]] as const) {
      expect(checkCancel({ status, phase })).toEqual({ kind: "go" });
    }
  });

  it("treats cancelling twice as a repeat, not an error", () => {
    expect(checkCancel({ status: "cancelled", phase: "cancelled" })).toEqual({ kind: "repeat" });
  });

  it("refuses once treatment has started, and for a request that already ended another way", () => {
    expect(checkCancel({ status: "in_progress", phase: "in_treatment" })).toMatchObject({ kind: "refuse", error: expect.stringContaining("during treatment") });
    for (const status of ["completed", "no_show", "declined", "expired"]) {
      expect(checkCancel({ status, phase: null })).toMatchObject({ kind: "refuse", error: `Request is already ${status}` });
    }
  });
});

describe("vanCancellationPolicy", () => {
  it("matches the policy by phase", () => {
    expect(vanCancellationPolicy(false)).toEqual(getCancellationPolicy({ channel: "van", phase: "queued" }));
    expect(vanCancellationPolicy(true)).toEqual(getCancellationPolicy({ channel: "van", phase: "en_route" }));
    expect(vanCancellationPolicy(true)).toEqual(getCancellationPolicy({ channel: "van", phase: "on_site" }));
  });

  it("does not say a refund was issued while it is still to be made", () => {
    const pending = vanCancellationPolicy(false, true);
    expect(pending).toMatchObject({ refundPercentage: 100, keepsDeposit: false });
    expect(pending.policyNotice).toContain("on its way");
    expect(pending.policyNotice).not.toContain("issued");
    // A kept deposit has no refund to wait for.
    expect(vanCancellationPolicy(true, true)).toEqual(vanCancellationPolicy(true));
  });
});

describe("checkVanSideCancel", () => {
  it("lets the crew cancel a stop they accepted, and tells them to decline one they have not", () => {
    expect(checkVanSideCancel({ status: "accepted", phase: "queued" }, "operator")).toEqual({ kind: "go" });
    expect(checkVanSideCancel({ status: "in_progress", phase: "on_site" }, "operator")).toEqual({ kind: "go" });
    expect(checkVanSideCancel({ status: "pending", phase: null }, "operator")).toMatchObject({ kind: "refuse", error: expect.stringContaining("Decline") });
    expect(checkVanSideCancel({ status: "pending", phase: null }, "staff")).toEqual({ kind: "go" });
  });

  it("never cancels a treatment under way or a visit that is over, and treats a repeat as a repeat", () => {
    for (const role of ["operator", "staff"] as const) {
      expect(checkVanSideCancel({ status: "in_progress", phase: "in_treatment" }, role).kind).toBe("refuse");
      expect(checkVanSideCancel({ status: "completed", phase: "completed" }, role).kind).toBe("refuse");
      expect(checkVanSideCancel({ status: "cancelled", phase: "cancelled" }, role)).toEqual({ kind: "repeat" });
    }
  });
});

describe("vanCancelledMessage", () => {
  it("apologises and says what happened to the money, never that it was kept", () => {
    expect(vanCancelledMessage("refunded").body).toContain("refunded in full");
    expect(vanCancelledMessage("released").body).toContain("not been charged");
    expect(vanCancelledMessage("failed").body).toContain("being returned to you in full");
    expect(vanCancelledMessage("pending").body).toContain("being returned to you in full");
    for (const outcome of ["refunded", "released", "failed", null]) {
      expect(vanCancelledMessage(outcome).body).toContain("sorry");
    }
  });

  it("has the same reason codes as the request schema", () => {
    const { vanSideCancelSchema } = require("../schemas/van-dispatch");
    for (const reason of VAN_CANCEL_REASONS) expect(vanSideCancelSchema.safeParse({ reason }).success).toBe(true);
    expect(vanSideCancelSchema.shape.reason.options).toEqual([...VAN_CANCEL_REASONS]);
  });
});

describe("checkNoShow", () => {
  const arrivedAt = new Date("2026-11-15T10:00:00Z");
  const at = (minutes: number) => new Date(arrivedAt.getTime() + minutes * 60_000);
  const both = [{ kind: "message", at: at(1) }, { kind: "call", at: at(2) }];

  it("allows a no-show after the wait with one message and one call attempt", () => {
    expect(checkNoShow({ arrivedAt, attempts: both }, at(10))).toEqual({ ok: true });
    expect(checkNoShow({ arrivedAt, attempts: both }, at(45))).toEqual({ ok: true });
  });

  it("refuses before the wait is over and says how long is left", () => {
    expect(checkNoShow({ arrivedAt, attempts: both }, at(4))).toMatchObject({ ok: false, waitMinutesLeft: 6, missing: [], message: expect.stringContaining("wait 6 more minutes") });
    expect(checkNoShow({ arrivedAt, attempts: both }, at(9.5))).toMatchObject({ ok: false, waitMinutesLeft: 1, message: expect.stringContaining("wait 1 more minute.") });
  });

  it("refuses without each kind of attempt, however long the crew has waited", () => {
    expect(checkNoShow({ arrivedAt, attempts: [] }, at(30))).toMatchObject({ ok: false, missing: ["message", "call"], waitMinutesLeft: 0 });
    expect(checkNoShow({ arrivedAt, attempts: [both[0]] }, at(30))).toMatchObject({ ok: false, missing: ["call"], message: "Before marking a no-show: try to call the patient." });
    expect(checkNoShow({ arrivedAt, attempts: [both[1], both[1]] }, at(30))).toMatchObject({ ok: false, missing: ["message"] });
  });

  it("does not count an attempt made before the van arrived, or a visit with no arrival", () => {
    const early = [{ kind: "message", at: at(-5) }, { kind: "call", at: at(-1) }];
    expect(checkNoShow({ arrivedAt, attempts: early }, at(30))).toMatchObject({ ok: false, missing: ["message", "call"] });
    expect(checkNoShow({ arrivedAt: null, attempts: both }, at(30)).ok).toBe(false);
  });

  it("uses the wait it is given", () => {
    expect(checkNoShow({ arrivedAt, attempts: both }, at(10), 15)).toMatchObject({ ok: false, waitMinutesLeft: 5 });
  });
});
