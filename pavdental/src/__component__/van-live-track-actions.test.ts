import {
  authorizeDeposit,
  cancelDoneMessage,
  cancelPrompt,
  formatCountdown,
  secondsUntil,
  type AuthorizeDeps,
} from "@/features/van/live-track-actions";

describe("cancelPrompt", () => {
  it("promises the deposit back while the van has not set off", () => {
    for (const phase of [undefined, "queued", "accepted"]) {
      const p = cancelPrompt({ phase });
      expect(p.message).toContain("Your deposit will be returned");
    }
  });
  it("warns the deposit is kept once the van is on its way or on site", () => {
    for (const phase of ["en_route", "on_site"]) {
      expect(cancelPrompt({ phase }).message).toContain("deposit will be kept");
    }
  });
  it("uses plain wording, not 'surgery'", () => {
    expect(cancelPrompt({}).message.toLowerCase()).not.toContain("surgery");
  });
});

describe("cancelDoneMessage", () => {
  it("says the deposit was kept only when it was", () => {
    expect(cancelDoneMessage({ depositRetained: true })).toContain("deposit has been kept");
    expect(cancelDoneMessage({ depositRetained: false })).not.toContain("kept");
    expect(cancelDoneMessage({})).toBe("Your van visit request has been cancelled.");
  });
});

describe("countdown", () => {
  const now = Date.parse("2026-11-10T10:00:00Z");
  it("counts whole seconds down to zero and no further", () => {
    expect(secondsUntil("2026-11-10T10:04:05Z", now)).toBe(245);
    expect(secondsUntil("2026-11-10T09:59:00Z", now)).toBe(0);
  });
  it("has no countdown without a usable deadline", () => {
    expect(secondsUntil(null, now)).toBeNull();
    expect(secondsUntil("not a date", now)).toBeNull();
  });
  it("shows minutes and two-digit seconds", () => {
    expect(formatCountdown(245)).toBe("4:05");
    expect(formatCountdown(60)).toBe("1:00");
    expect(formatCountdown(0)).toBe("0:00");
  });
});

describe("authorizeDeposit", () => {
  const deps = (over: Partial<AuthorizeDeps> = {}): AuthorizeDeps => ({
    retry: jest.fn(async () => ({ clientSecret: "pi_secret" })),
    presentSheet: jest.fn(async () => undefined),
    isClosedByPatient: (e) => (e as Error)?.name === "DepositCanceledError",
    ...over,
  });

  it("opens the sheet with the fresh secret and reports authorised", async () => {
    const d = deps();
    expect(await authorizeDeposit(d, "r1")).toEqual({ kind: "authorized" });
    expect(d.retry).toHaveBeenCalledWith("r1");
    expect(d.presentSheet).toHaveBeenCalledWith("pi_secret", { clientSecret: "pi_secret" });
  });

  it("does not open the sheet when the server already has the hold", async () => {
    const d = deps({ retry: jest.fn(async () => ({ alreadyAuthorized: true, clientSecret: "x" })) });
    expect(await authorizeDeposit(d, "r1")).toEqual({ kind: "already" });
    expect(d.presentSheet).not.toHaveBeenCalled();
  });

  it("treats a missing secret as already done", async () => {
    const d = deps({ retry: jest.fn(async () => ({ clientSecret: null })) });
    expect((await authorizeDeposit(d, "r1")).kind).toBe("already");
  });

  it("says nothing when the patient closes the sheet", async () => {
    const closed = Object.assign(new Error("closed"), { name: "DepositCanceledError" });
    const d = deps({ presentSheet: jest.fn(async () => Promise.reject(closed)) });
    expect(await authorizeDeposit(d, "r1")).toEqual({ kind: "closed" });
  });

  it("gives a plain failure, never the provider's text, and hands back the real error to report", async () => {
    const raw = new Error("Your card was declined. Decline code: do_not_honor");
    const d = deps({ presentSheet: jest.fn(async () => Promise.reject(raw)) });
    const out = await authorizeDeposit(d, "r1");
    expect(out.kind).toBe("failed");
    if (out.kind === "failed") {
      expect(out.message).toBe("We couldn't authorize the deposit. You have not been charged.");
      expect(out.error).toBe(raw);
    }
  });
});
