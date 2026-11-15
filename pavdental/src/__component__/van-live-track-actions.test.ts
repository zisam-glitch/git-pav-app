import {
  authorizeDeposit,
  cancelDoneMessage,
  cancelPrompt,
  formatCountdown,
  rebookButtonLabel,
  rebookDraftFromRequest,
  secondsUntil,
  trackingPollIntervalMs,
  type AuthorizeDeps,
} from "@/features/van/live-track-actions";
import type { VanServiceRequest } from "@/features/van/van-types";

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

describe("rebookDraftFromRequest (N4/N30)", () => {
  const baseRequest: VanServiceRequest = {
    id: "req-1",
    shiftId: "shift-1",
    vanId: "van-1",
    patientId: "pat-1",
    serviceId: "svc-checkup",
    status: "declined",
    phase: "queued",
    patientLat: 53.7997,
    patientLng: -1.5492,
    accessDetails: {
      addressLine1: "14 Briggate",
      addressLine2: "Flat 2",
      city: "Leeds",
      postcode: "LS1 6HD",
      lat: 53.7997,
      lng: -1.5492,
      parkingType: "permit_bay",
      gateCode: "1234",
      accessNotes: "Call on arrival",
    },
    requestedAt: "2026-11-15T10:00:00Z",
    expiresAt: "2026-11-15T10:04:00Z",
    service: {
      name: "Emergency Dental Check",
      durationMinutes: 30,
      pricePence: 9500,
      depositPence: 2500,
    },
  };

  it("preserves treatment and access details and routes straight to confirm", () => {
    const draft = rebookDraftFromRequest(baseRequest);
    expect(draft.pathname).toBe("/(patient)/van/confirm");
    expect(draft.service).toEqual({
      serviceId: "svc-checkup",
      serviceName: "Emergency Dental Check",
      servicePricePence: 9500,
      serviceDurationMinutes: 30,
      serviceDepositPence: 2500,
    });
    expect(draft.accessDetails).toEqual({
      postcode: "LS1 6HD",
      addressLine1: "14 Briggate",
      addressLine2: "Flat 2",
      city: "Leeds",
      parkingType: "permit_bay",
      gateCode: "1234",
      accessNotes: "Call on arrival",
    });
  });

  it("falls back to service-area if address is incomplete", () => {
    const draft = rebookDraftFromRequest({
      ...baseRequest,
      accessDetails: { ...baseRequest.accessDetails, addressLine1: " " },
    });
    expect(draft.pathname).toBe("/(patient)/van/service-area");
  });

  it("uses clear rebook wording for cancelled vs declined/expired requests", () => {
    expect(rebookButtonLabel("cancelled")).toBe("Book another van visit");
    expect(rebookButtonLabel("declined")).toBe("Try again");
    expect(rebookButtonLabel("expired")).toBe("Try again");
  });
});

describe("trackingPollIntervalMs (N29)", () => {
  it("polls every 5s only while foregrounded and en_route", () => {
    expect(trackingPollIntervalMs({ status: "in_progress", phase: "en_route" }, true)).toBe(5000);
  });

  it("polls every 30s for non-en_route active stages", () => {
    expect(trackingPollIntervalMs({ status: "pending", phase: "queued" }, true)).toBe(30_000);
    expect(trackingPollIntervalMs({ status: "in_progress", phase: "on_site" }, true)).toBe(30_000);
    expect(trackingPollIntervalMs(null, true)).toBe(30_000);
  });

  it("pauses polling in the background or when terminal", () => {
    expect(trackingPollIntervalMs({ status: "in_progress", phase: "en_route" }, false)).toBe(false);
    for (const status of ["declined", "expired", "completed", "cancelled"]) {
      expect(trackingPollIntervalMs({ status, phase: "queued" }, true)).toBe(false);
    }
  });
});
