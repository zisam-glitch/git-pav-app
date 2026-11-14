import { arrivalSeconds, choosePlacement, lateStops, promisedArrival, PlacementStop } from "../lib/van-placement";

// N8: where a newly accepted visit goes, and whether a reorder keeps the times
// patients were told. Pure functions; the van and the stops sit on a line,
// one minute of driving per unit, five minutes of treatment, no gap between.
const NOW = new Date("2031-03-11T10:00:00Z");
const at = (secondsFromNow: number) => new Date(NOW.getTime() + secondsFromNow * 1000);

const position: Record<string, number> = { van: 0 };
const leg = (from: string, to: string) => Math.abs(position[from] - position[to]) * 60;

function stop(id: string, where: number, extra: Partial<PlacementStop> = {}): PlacementStop {
  position[id] = where;
  return { id, lat: 0, lng: where, phase: "queued", treatmentStartedAt: null, treatmentMinutes: 5, bufferMinutes: 0, promisedBy: null, ...extra };
}

describe("arrivalSeconds", () => {
  it("adds the drive, the treatment and the gap down the queue", () => {
    const a = stop("a", 10);
    const b = stop("b", 20);
    expect([...arrivalSeconds([a, b], leg, NOW)]).toEqual([["a", 600], ["b", 1500]]);
  });

  it("does not drive to a stop the van is already at", () => {
    const here = stop("here", 10, { phase: "on_site" });
    const next = stop("next", 12);
    // No drive to "here"; 5 minutes of treatment; then 2 minutes to "next".
    expect([...arrivalSeconds([here, next], leg, NOW)]).toEqual([["here", 0], ["next", 300 + 120]]);
  });
});

describe("choosePlacement", () => {
  it("puts a stop on the way between two others in the middle, when nobody is made later than promised", () => {
    const a = stop("a", 10, { promisedBy: at(600) });
    const b = stop("b", 20, { promisedBy: at(1500) });
    const c = stop("c", 15);

    const placement = choosePlacement([a, b], c, leg, NOW, 1200);

    expect(placement.order.map((s) => s.id)).toEqual(["a", "c", "b"]);
    expect(placement.movedAhead).toBe(true);
  });

  it("keeps it at the back when going earlier would make someone later than they were told", () => {
    const a = stop("a", 10, { promisedBy: at(600) });
    const b = stop("b", 20, { promisedBy: at(1500) });
    const c = stop("c", 15);

    // No allowance: b would arrive at 1800, later than the 1500 it was told.
    const placement = choosePlacement([a, b], c, leg, NOW, 0);

    expect(placement.order.map((s) => s.id)).toEqual(["a", "b", "c"]);
    expect(placement.movedAhead).toBe(false);
  });

  it("can go to the front when the new address is on the way to the first stop", () => {
    const a = stop("a", 10, { promisedBy: at(600) });
    const b = stop("b", 20, { promisedBy: at(1500) });
    const c = stop("c", 5);

    expect(choosePlacement([a, b], c, leg, NOW, 1200).order.map((s) => s.id)).toEqual(["c", "a", "b"]);
  });

  it("never goes ahead of a stop the van is already driving to or treating", () => {
    const a = stop("a", 10, { phase: "en_route", promisedBy: at(600) });
    const b = stop("b", 20, { promisedBy: at(1500) });
    const c = stop("c", 5);

    const order = choosePlacement([a, b], c, leg, NOW, 1200).order.map((s) => s.id);
    expect(order[0]).toBe("a");
  });

  it("does not move a stop for no gain", () => {
    const a = stop("a", 10, { promisedBy: at(600) });
    const b = stop("b", 20, { promisedBy: at(1500) });
    const far = stop("far", 100);

    const placement = choosePlacement([a, b], far, leg, NOW, 1200);
    expect(placement.order.map((s) => s.id)).toEqual(["a", "b", "far"]);
    expect(placement.movedAhead).toBe(false);
  });

  it("goes to the back of an empty queue", () => {
    const c = stop("c", 5);
    expect(choosePlacement([], c, leg, NOW).order.map((s) => s.id)).toEqual(["c"]);
  });
});

describe("lateStops", () => {
  it("names the stops a reorder would make later than promised, and by how much", () => {
    const a = stop("a", 10, { promisedBy: at(600) });
    const b = stop("b", 20, { promisedBy: at(1500) });
    const c = stop("c", 5, { promisedBy: at(300) });

    // Order c, a, b arrives at 300, 900, 1800 against promises 300, 600, 1500.
    const late = lateStops([c, a, b], [a, b, c], leg, NOW, 0);
    expect(late.map((l) => l.id).sort()).toEqual(["c"]);
  });

  it("allows lateness inside the allowance and never pushes back a stop that is already late", () => {
    const a = stop("a", 10, { promisedBy: at(100) });
    const b = stop("b", 20, { promisedBy: at(1500) });
    // a is already due at 600, past its promise of 100. Same order: nothing is later than before.
    expect(lateStops([a, b], [a, b], leg, NOW, 0)).toEqual([]);
    // Making a later still (b first) is late, whatever the allowance below its delay.
    expect(lateStops([a, b], [b, a], leg, NOW, 60).map((l) => l.id)).toContain("a");
  });
});

describe("promisedArrival", () => {
  const requestedAt = at(-120);

  it("is the last ETA pushed to the patient", () => {
    expect(promisedArrival({ lastEtaSeconds: 600, lastEtaPushedAt: at(-60), etaSecondsSnapshot: 1800, requestedAt })).toEqual(at(540));
  });

  it("is the quote they were given when they asked, if no ETA has been pushed", () => {
    expect(promisedArrival({ lastEtaSeconds: null, lastEtaPushedAt: null, etaSecondsSnapshot: 1800, requestedAt })).toEqual(at(1680));
  });

  it("is nothing when the patient was told nothing", () => {
    expect(promisedArrival({ lastEtaSeconds: null, lastEtaPushedAt: null, etaSecondsSnapshot: null, requestedAt })).toBeNull();
  });
});
