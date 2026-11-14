// Unit tests for the live ETA re-push broadcast.
// Prisma and the shift's plan are mocked so drift gating, throttle windows,
// and force semantics are exercised hermetically.

process.env.PORT = process.env.PORT || "3000";

jest.mock("../lib/prisma", () => ({
  prisma: {
    vanServiceRequest: {
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

jest.mock("../lib/patient-push", () => ({
  sendPatientNotification: jest.fn().mockResolvedValue(undefined),
}));

// The plan is mocked: each stop is planned to be reached `etaSeconds` from now.
jest.mock("../lib/van-plan", () => ({
  ...jest.requireActual("../lib/van-plan"),
  recomputeShiftPlan: jest.fn(),
}));

import { prisma } from "../lib/prisma";
import { sendPatientNotification } from "../lib/patient-push";
import { recomputeShiftPlan } from "../lib/van-plan";
import { broadcastEtaUpdates, isMaterialDrift } from "../lib/van-eta-broadcast";

const SHIFT_ID = "shift-1";

function makeStop(overrides: Record<string, unknown> = {}) {
  return {
    id: "req-1",
    patientId: "patient-1",
    phase: "queued",
    lastEtaSeconds: null as number | null,
    lastEtaPushedAt: null as Date | null,
    /** Seconds from now to the end of the window the patient was told; null when none was. */
    promisedToInSeconds: 1800 as number | null,
    lateNoticeSentAt: null as Date | null,
    etaSeconds: 600,
    ...overrides,
  };
}

/** A shift whose plan reaches each stop `etaSeconds` from now; null means the van has no fix. */
function mockPlan(stops: ReturnType<typeof makeStop>[] | null) {
  const computedAt = new Date();
  (recomputeShiftPlan as jest.Mock).mockResolvedValue(
    stops && {
      computedAt,
      stops: stops.map(({ etaSeconds, promisedToInSeconds, ...stop }) => ({
        ...stop,
        promisedFromAt: promisedToInSeconds == null ? null : new Date(computedAt.getTime() + (promisedToInSeconds - 1200) * 1000),
        promisedToAt: promisedToInSeconds == null ? null : new Date(computedAt.getTime() + promisedToInSeconds * 1000),
        plannedArrivalAt: new Date(computedAt.getTime() + etaSeconds * 1000),
        plannedStartAt: new Date(computedAt.getTime() + etaSeconds * 1000),
        plannedFinishAt: new Date(computedAt.getTime() + (etaSeconds + 1800) * 1000),
      })),
    }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (prisma.vanServiceRequest.update as jest.Mock).mockResolvedValue({});
  (prisma.vanServiceRequest.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  (sendPatientNotification as jest.Mock).mockResolvedValue(undefined);
});

describe("isMaterialDrift", () => {
  test("first fix (no previous position) is always material", () => {
    expect(isMaterialDrift(null, null, 51.5, -0.12)).toBe(true);
  });

  test("small movement (just a few metres) is not material", () => {
    // ~10 m apart
    expect(isMaterialDrift(51.5, -0.12, 51.5001, -0.12)).toBe(false);
  });

  test("movement above 200 m is material", () => {
    // ~220 m north
    expect(isMaterialDrift(51.5, -0.12, 51.502, -0.12)).toBe(true);
  });

  test("threshold scales with queue length", () => {
    // ~220 m move: material for a 1-stop queue, not for a 3-stop queue
    // (threshold 200 + 2×100 = 400 m)
    expect(isMaterialDrift(51.5, -0.12, 51.502, -0.12, 1)).toBe(true);
    expect(isMaterialDrift(51.5, -0.12, 51.502, -0.12, 3)).toBe(false);
  });
});

describe("broadcastEtaUpdates", () => {
  test("no van fix → no outcomes, no pushes", async () => {
    mockPlan(null);

    const outcomes = await broadcastEtaUpdates(SHIFT_ID);

    expect(Object.keys(outcomes)).toHaveLength(0);
    expect(sendPatientNotification).not.toHaveBeenCalled();
  });

  test("no active stops → no outcomes", async () => {
    mockPlan([]);

    const outcomes = await broadcastEtaUpdates(SHIFT_ID);
    expect(Object.keys(outcomes)).toHaveLength(0);
  });

  test("first push for a patient always goes out (no previous ETA)", async () => {
    mockPlan([makeStop()]);

    const outcomes = await broadcastEtaUpdates(SHIFT_ID);

    expect(outcomes["req-1"]).toBe("pushed");
    expect(sendPatientNotification).toHaveBeenCalledWith(
      "patient-1",
      "ETA Update",
      expect.stringContaining("around 10 minutes"),
      expect.objectContaining({ requestId: "req-1", type: "eta_update" })
    );
    expect(prisma.vanServiceRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "req-1" },
        data: expect.objectContaining({ lastEtaSeconds: 600 }),
      })
    );
  });

  test("change below drift threshold is suppressed", async () => {
    // Last pushed 590s; new ETA 600s — 10s delta, far below 5 min gate.
    mockPlan([makeStop({ lastEtaSeconds: 590, lastEtaPushedAt: new Date(Date.now() - 3600_000) })]);

    const outcomes = await broadcastEtaUpdates(SHIFT_ID);

    expect(outcomes["req-1"]).toBe("below_drift");
    expect(sendPatientNotification).not.toHaveBeenCalled();
  });

  test("material change inside the throttle window is suppressed", async () => {
    // 30 min vs 10 min = 20 min drift, pushed 1 min ago
    mockPlan([makeStop({ etaSeconds: 1800, lastEtaSeconds: 600, lastEtaPushedAt: new Date(Date.now() - 60_000) })]);

    const outcomes = await broadcastEtaUpdates(SHIFT_ID);

    expect(outcomes["req-1"]).toBe("throttled");
    expect(sendPatientNotification).not.toHaveBeenCalled();
  });

  test("material change after the throttle window pushes", async () => {
    // pushed 15 min ago
    mockPlan([makeStop({ etaSeconds: 1800, lastEtaSeconds: 600, lastEtaPushedAt: new Date(Date.now() - 15 * 60_000) })]);

    const outcomes = await broadcastEtaUpdates(SHIFT_ID);

    expect(outcomes["req-1"]).toBe("pushed");
    expect(sendPatientNotification).toHaveBeenCalledWith(
      "patient-1",
      "ETA Update",
      expect.stringContaining("around 30 minutes"),
      expect.any(Object)
    );
  });

  test("force bypasses both gates (post-accept seed)", async () => {
    mockPlan([makeStop({ lastEtaSeconds: 600, lastEtaPushedAt: new Date() })]); // pushed just now, no drift

    const outcomes = await broadcastEtaUpdates(SHIFT_ID, { force: true });

    expect(outcomes["req-1"]).toBe("pushed");
    expect(sendPatientNotification).toHaveBeenCalled();
  });

  test("each patient is told their own planned arrival, later for the one further back", async () => {
    // How the stops ahead feed a later stop's time is the plan's job: see van-plan.test.ts.
    mockPlan([
      makeStop({ id: "req-1", patientId: "p1", etaSeconds: 600 }),
      makeStop({ id: "req-2", patientId: "p2", etaSeconds: 2400 }),
    ]);

    const outcomes = await broadcastEtaUpdates(SHIFT_ID);

    expect(outcomes).toEqual({ "req-1": "pushed", "req-2": "pushed" });
    expect(sendPatientNotification).toHaveBeenNthCalledWith(1, "p1", "ETA Update", expect.stringContaining("around 10 minutes"), expect.objectContaining({ etaSeconds: 600 }));
    expect(sendPatientNotification).toHaveBeenNthCalledWith(2, "p2", "ETA Update", expect.stringContaining("around 40 minutes"), expect.objectContaining({ etaSeconds: 2400 }));
  });

  test("a stop the van is already at gets no ETA push", async () => {
    mockPlan([makeStop({ phase: "on_site" }), makeStop({ id: "req-2", patientId: "p2", phase: "in_treatment" })]);

    const outcomes = await broadcastEtaUpdates(SHIFT_ID, { force: true });

    expect(outcomes).toEqual({ "req-1": "no_change", "req-2": "no_change" });
    expect(sendPatientNotification).not.toHaveBeenCalled();
  });

  describe("running late", () => {
    test("a plan well past the promised window sends one plain notice, in place of the ETA push", async () => {
      // Promised by 30 min from now; now planned for 46 min: 16 past, told as 15.
      mockPlan([makeStop({ etaSeconds: 46 * 60, lastEtaSeconds: 600, lastEtaPushedAt: new Date(Date.now() - 3600_000) })]);

      const outcomes = await broadcastEtaUpdates(SHIFT_ID);

      expect(outcomes["req-1"]).toBe("late_notice");
      expect(sendPatientNotification).toHaveBeenCalledTimes(1);
      expect(sendPatientNotification).toHaveBeenCalledWith(
        "patient-1",
        "Running Late",
        expect.stringContaining("about 15 minutes late"),
        expect.objectContaining({ requestId: "req-1", type: "running_late", lateMinutes: 15 })
      );
      // Claimed before sending, so two passes at once cannot both send it.
      expect(prisma.vanServiceRequest.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "req-1", lateNoticeSentAt: null } })
      );
    });

    test("the notice goes out even inside the ETA throttle window", async () => {
      mockPlan([makeStop({ etaSeconds: 46 * 60, lastEtaSeconds: 600, lastEtaPushedAt: new Date() })]);
      expect((await broadcastEtaUpdates(SHIFT_ID))["req-1"]).toBe("late_notice");
    });

    test("it is sent once: a patient already told gets ordinary ETA updates after that", async () => {
      mockPlan([makeStop({ etaSeconds: 46 * 60, lateNoticeSentAt: new Date(), lastEtaSeconds: 600, lastEtaPushedAt: new Date(Date.now() - 3600_000) })]);

      const outcomes = await broadcastEtaUpdates(SHIFT_ID);

      expect(outcomes["req-1"]).toBe("pushed");
      expect(sendPatientNotification).toHaveBeenCalledWith("patient-1", "ETA Update", expect.any(String), expect.any(Object));
    });

    test("another pass that claimed the notice first means this one sends nothing for it", async () => {
      (prisma.vanServiceRequest.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      mockPlan([makeStop({ etaSeconds: 46 * 60, lastEtaSeconds: 46 * 60, lastEtaPushedAt: new Date() })]);

      const outcomes = await broadcastEtaUpdates(SHIFT_ID);

      expect(outcomes["req-1"]).toBe("below_drift");
      expect(sendPatientNotification).not.toHaveBeenCalled();
    });

    test("inside the window, or within the grace after it, nobody is told they are late", async () => {
      mockPlan([makeStop({ etaSeconds: 39 * 60 }), makeStop({ id: "req-2", patientId: "p2", etaSeconds: 600, promisedToInSeconds: null })]);

      const outcomes = await broadcastEtaUpdates(SHIFT_ID);

      expect(outcomes).toEqual({ "req-1": "pushed", "req-2": "pushed" });
      expect(sendPatientNotification).not.toHaveBeenCalledWith(expect.anything(), "Running Late", expect.anything(), expect.anything());
    });
  });
});
