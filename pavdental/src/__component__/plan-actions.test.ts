import {
  declinePlan,
  decisionFromStatus,
  findPlan,
  planBadge,
  prescribedBy,
  signPlan,
  signerNameFor,
  type SignDeps,
} from "@/features/records/plan-actions";

describe("plan helpers", () => {
  it("shows an earlier answer, and no answer for a plan still open", () => {
    expect(decisionFromStatus("accepted")).toBe("accepted");
    expect(decisionFromStatus("declined")).toBe("declined");
    expect(decisionFromStatus("proposed")).toBeNull();
    expect(decisionFromStatus(undefined)).toBeNull();
  });
  it("words each state of the badge", () => {
    expect(planBadge("accepted")).toEqual({ label: "Read", variant: "success" });
    expect(planBadge("declined")).toEqual({ label: "Declined", variant: "danger" });
    expect(planBadge(null)).toEqual({ label: "Awaiting review", variant: "warning" });
  });
  it("names the clinician from their record, with no made-up number", () => {
    expect(prescribedBy({ fullName: "Dr Example", roleTitle: "Dentist", gdcNumber: "12345" })).toBe("Dr Example · Dentist, GDC 12345");
    expect(prescribedBy({ fullName: "Dr Example" })).toBe("Dr Example");
    expect(prescribedBy(undefined)).toBe("Your clinician");
  });
  it("finds only the plan it was opened for, never the first in the list", () => {
    const plans = [{ id: "a" }, { id: "b" }];
    expect(findPlan(plans, "b")).toEqual({ id: "b" });
    expect(findPlan(plans, undefined)).toBeNull();
    expect(findPlan(plans, "zzz")).toBeNull();
    expect(findPlan(undefined, "a")).toBeNull();
  });
  it("names the signer by first and last name, or the email", () => {
    expect(signerNameFor({ firstName: "Pat", lastName: "Lee" })).toBe("Pat Lee");
    expect(signerNameFor({ firstName: "Pat" })).toBe("Pat");
    expect(signerNameFor({ email: "pat@example.test" })).toBe("pat@example.test");
  });
});

describe("signPlan", () => {
  const deps = (over: Partial<SignDeps> = {}): SignDeps => ({
    verifyIdentity: jest.fn(async () => "verified" as const),
    sign: jest.fn(async () => ({ signatureHash: "abc123", signedAt: "2026-11-10T10:00:00Z" })),
    ...over,
  });
  const user = { firstName: "Pat", lastName: "Lee" };

  it("checks identity, signs a read-confirmation, and returns the server's hash and time", async () => {
    const d = deps();
    const out = await signPlan(d, "p1", user);
    expect(out).toEqual({ kind: "signed", signerName: "Pat Lee", signedAt: "2026-11-10T10:00:00Z", hash: "abc123" });
    expect(d.sign).toHaveBeenCalledWith({ planId: "p1", signerName: "Pat Lee", signatureData: "read-confirmation:Pat Lee" });
  });

  it("does not sign when the biometric check is cancelled", async () => {
    const d = deps({ verifyIdentity: jest.fn(async () => "cancelled" as const) });
    expect(await signPlan(d, "p1", user)).toEqual({ kind: "not-verified" });
    expect(d.sign).not.toHaveBeenCalled();
  });

  it("goes on without a check where the phone has none, or the check cannot run", async () => {
    const none = deps({ verifyIdentity: jest.fn(async () => "unavailable" as const) });
    expect((await signPlan(none, "p1", user)).kind).toBe("signed");
    const broken = deps({ verifyIdentity: jest.fn(async () => Promise.reject(new Error("no hardware"))) });
    expect((await signPlan(broken, "p1", user)).kind).toBe("signed");
  });

  it("invents no hash or time when the server sends none", async () => {
    const d = deps({ sign: jest.fn(async () => undefined) });
    expect(await signPlan(d, "p1", user)).toEqual({ kind: "signed", signerName: "Pat Lee", signedAt: null, hash: "" });
  });

  it("gives a plain failure and the real error to report", async () => {
    const raw = new TypeError("Network request failed");
    const d = deps({ sign: jest.fn(async () => Promise.reject(raw)) });
    const out = await signPlan(d, "p1", user);
    expect(out).toMatchObject({ kind: "failed", message: "We couldn't reach the server. Check your connection and try again.", error: raw });
  });
});

describe("declinePlan", () => {
  it("declines the plan it was given", async () => {
    const decline = jest.fn(async () => ({}));
    expect(await declinePlan({ decline }, "p1")).toEqual({ kind: "declined" });
    expect(decline).toHaveBeenCalledWith("p1");
  });
  it("says plainly when it fails", async () => {
    const out = await declinePlan({ decline: async () => Promise.reject(new Error("undefined is not a function")) }, "p1");
    expect(out.kind).toBe("failed");
    if (out.kind === "failed") expect(out.message).not.toContain("undefined");
  });
});
