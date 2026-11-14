import { planStops, etaSecondsFromPlan, VAN_PLAN_SETTINGS, PlanStop, promiseWindow, lateMinutes, VAN_PROMISE_SETTINGS } from "../lib/van-plan";

// The plan for a van shift (plan 16, design 2): from "where the van is, what it
// is doing, the stops in order" to an arrival, start and finish time for every
// stop. Pure, with a pinned clock.
const now = new Date("2026-11-14T10:00:00Z");
const at = (minutes: number) => new Date(now.getTime() + minutes * 60_000);
const settings = { defaultTreatmentMinutes: 45, gapMinutes: 10, setupMinutes: 0 };
const stop = (id: string, overrides: Partial<PlanStop> = {}): PlanStop => ({
  id,
  phase: "queued",
  treatmentStartedAt: null,
  treatmentMinutes: 30,
  ...overrides,
});

describe("planStops", () => {
  it("plans one stop: drive, then treat", () => {
    expect(planStops(now, [stop("a")], [600], settings)).toEqual([
      { id: "a", plannedArrivalAt: at(10), plannedStartAt: at(10), plannedFinishAt: at(40) },
    ]);
  });

  it("starts the drive to the next stop after the one before has finished and the gap has passed", () => {
    const plan = planStops(now, [stop("a"), stop("b", { phase: "queued" })], [600, 300], settings);
    // a: arrive 10, finish 40. Gap 10. Drive 5. b arrives at 55.
    expect(plan[1]).toEqual({ id: "b", plannedArrivalAt: at(55), plannedStartAt: at(55), plannedFinishAt: at(85) });
  });

  it("counts only the treatment time left for a stop being treated, and keeps its arrival as it was", () => {
    const treating = stop("a", { phase: "in_treatment", treatmentStartedAt: at(-20) });
    const plan = planStops(now, [treating, stop("b")], [999, 300], settings);
    expect(plan[0]).toEqual({ id: "a", plannedArrivalAt: null, plannedStartAt: at(-20), plannedFinishAt: at(10) });
    // 10 minutes left, gap 10, drive 5. The van-to-first-stop leg is ignored: the van is there.
    expect(plan[1].plannedArrivalAt).toEqual(at(25));
  });

  it("never lets a treatment that has overrun pull later arrivals earlier: at least 5 minutes are left", () => {
    const overrun = stop("a", { phase: "in_treatment", treatmentStartedAt: at(-50) });
    const plan = planStops(now, [overrun, stop("b")], [0, 300], settings);
    expect(plan[0].plannedFinishAt).toEqual(at(5));
    expect(plan[1].plannedArrivalAt).toEqual(at(20));
  });

  it("does not drive to a stop the van is already parked at", () => {
    const plan = planStops(now, [stop("a", { phase: "on_site" }), stop("b")], [999, 300], settings);
    expect(plan[0]).toEqual({ id: "a", plannedArrivalAt: null, plannedStartAt: at(0), plannedFinishAt: at(30) });
    expect(plan[1].plannedArrivalAt).toEqual(at(45));
  });

  it("uses the setup time and the gap it is given", () => {
    const plan = planStops(now, [stop("a"), stop("b")], [600, 300], { ...settings, setupMinutes: 5, gapMinutes: 15 });
    expect(plan[0]).toEqual({ id: "a", plannedArrivalAt: at(10), plannedStartAt: at(15), plannedFinishAt: at(45) });
    expect(plan[1]).toEqual({ id: "b", plannedArrivalAt: at(65), plannedStartAt: at(70), plannedFinishAt: at(100) });
  });

  it("uses the default length for a treatment that has none", () => {
    const plan = planStops(now, [stop("a", { treatmentMinutes: null })], [0], settings);
    expect(plan[0].plannedFinishAt).toEqual(at(45));
  });

  it("keeps every stop in order: nobody is planned to be reached before the stop ahead of them is finished", () => {
    const stops = [stop("a", { phase: "en_route" }), stop("b"), stop("c"), stop("d")];
    const plan = planStops(now, stops, [120, 480, 900, 60], settings);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].plannedArrivalAt!.getTime()).toBeGreaterThan(plan[i - 1].plannedFinishAt.getTime());
    }
  });
});

describe("etaSecondsFromPlan", () => {
  it("is the time left until the planned arrival, never negative", () => {
    expect(etaSecondsFromPlan({ phase: "queued", plannedArrivalAt: at(12) }, now)).toBe(720);
    expect(etaSecondsFromPlan({ phase: "en_route", plannedArrivalAt: at(-3) }, now)).toBe(0);
  });

  it("is zero once the van is there, and unknown when there is no plan yet", () => {
    expect(etaSecondsFromPlan({ phase: "on_site", plannedArrivalAt: null }, now)).toBe(0);
    expect(etaSecondsFromPlan({ phase: "in_treatment", plannedArrivalAt: at(-30) }, now)).toBe(0);
    expect(etaSecondsFromPlan({ phase: "queued", plannedArrivalAt: null }, now)).toBeNull();
  });
});

describe("VAN_PLAN_SETTINGS", () => {
  it("keeps the figures the three old calculations used, in one place", () => {
    expect(VAN_PLAN_SETTINGS).toEqual({ defaultTreatmentMinutes: 45, gapMinutes: 10, setupMinutes: 0 });
  });
});

// The promise (plan 16, design 3): the patient is told a window, it is kept
// with the visit, and "late" has one meaning.
describe("promiseWindow", () => {
  const promise = { windowMinutes: 20, lateGraceMinutes: 10 };

  it("is a window on round five minutes that holds the planned arrival", () => {
    expect(promiseWindow(at(14), promise)).toEqual({ from: at(10), to: at(30) });
    expect(promiseWindow(at(10), promise)).toEqual({ from: at(10), to: at(30) });
    expect(promiseWindow(new Date(at(19).getTime() + 59_000), promise)).toEqual({ from: at(15), to: at(35) });
  });

  it("uses the window length it is given", () => {
    expect(promiseWindow(at(62), { ...promise, windowMinutes: 120 })).toEqual({ from: at(60), to: at(180) });
  });
});

describe("lateMinutes", () => {
  const promise = { windowMinutes: 20, lateGraceMinutes: 10 };
  const promised = { promisedToAt: at(30) };

  it("is nothing while the plan is inside the window or within the grace after it", () => {
    expect(lateMinutes({ ...promised, plannedArrivalAt: at(12) }, promise)).toBeNull();
    expect(lateMinutes({ ...promised, plannedArrivalAt: at(30) }, promise)).toBeNull();
    expect(lateMinutes({ ...promised, plannedArrivalAt: at(40) }, promise)).toBeNull();
  });

  it("is how far past the end of the window the plan now is, to the nearest five minutes", () => {
    expect(lateMinutes({ ...promised, plannedArrivalAt: at(41) }, promise)).toBe(10);
    expect(lateMinutes({ ...promised, plannedArrivalAt: at(44) }, promise)).toBe(15);
    expect(lateMinutes({ ...promised, plannedArrivalAt: at(75) }, promise)).toBe(45);
  });

  it("is nothing when no promise was made or there is no plan", () => {
    expect(lateMinutes({ promisedToAt: null, plannedArrivalAt: at(90) }, promise)).toBeNull();
    expect(lateMinutes({ ...promised, plannedArrivalAt: null }, promise)).toBeNull();
  });
});

describe("VAN_PROMISE_SETTINGS", () => {
  it("defaults to the figures suggested in the plan: a 20-minute window, late 10 minutes past its end", () => {
    expect(VAN_PROMISE_SETTINGS).toEqual({ windowMinutes: 20, lateGraceMinutes: 10 });
  });
});
