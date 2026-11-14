// N7, N12: a request waiting for an operator's answer is part of the van's
// queue when the next patient is quoted, and availability and the request
// itself share one quote. Prisma, coverage and the routing chain are mocked,
// so this runs without a database. Synthetic data only.

process.env.PORT = process.env.PORT || "3000";

type Row = {
  id: string;
  patientLat: number;
  patientLng: number;
  phase: string;
  treatmentStartedAt: Date | null;
  requestedAt: Date;
  queuePosition: number | null;
  service: { durationMinutes: number | null };
};

const acceptedRows: Row[] = [];
const pendingRows: Row[] = [];

jest.mock("../lib/prisma", () => ({
  prisma: {
    vanServiceRequest: {
      findMany: jest.fn(async (args: { where: { status: unknown } }) =>
        args.where.status === "pending" ? pendingRows : acceptedRows
      ),
      count: jest.fn(),
    },
  },
}));

const shifts: { id: string; vanId: string; lastLat: number | null; lastLng: number | null }[] = [];
jest.mock("../lib/van-coverage", () => ({
  getOnlineShiftsCoveringPoint: jest.fn(async () => shifts),
}));

jest.mock("../lib/van-eta", () => ({
  MAX_ETA_SECONDS: 4 * 60 * 60,
  MAX_QUEUE_DEPTH: 5,
  // One minute per stop in the chain, plus a base that depends on where the van is.
  etaSecondsToNewPatient: jest.fn(async (van: { lat: number }, chain: unknown[]) => van.lat * 1000 + chain.length * 60),
}));

import { etaSecondsToNewPatient } from "../lib/van-eta";
import { quoteBestVan, stopsAheadOf, loadShiftQueue } from "../lib/van-quote";
import { prisma } from "../lib/prisma";

const NOW = new Date("2031-03-11T10:00:00Z");
const patient = { lat: 53.8, lng: -1.73 };

let counter = 0;
function row(overrides: Partial<Row> = {}): Row {
  counter += 1;
  return {
    id: `r${counter}`,
    patientLat: 53.8 + counter / 1000,
    patientLng: -1.73,
    phase: "queued",
    treatmentStartedAt: null,
    requestedAt: new Date(NOW.getTime() - (100 - counter) * 1000),
    queuePosition: null,
    service: { durationMinutes: 30 },
    ...overrides,
  };
}

beforeEach(() => {
  acceptedRows.length = 0;
  pendingRows.length = 0;
  shifts.length = 0;
  counter = 0;
  jest.clearAllMocks();
});

describe("quoteBestVan", () => {
  it("says there is no van when no online shift covers the address", async () => {
    expect(await quoteBestVan(patient, NOW)).toEqual({ kind: "no_van" });
  });

  it("puts pending requests in the chain after the accepted stops", async () => {
    shifts.push({ id: "s1", vanId: "v1", lastLat: 1, lastLng: 1 });
    acceptedRows.push(row({ queuePosition: 1 }), row({ queuePosition: 2 }));
    pendingRows.push(row(), row());

    const quote = await quoteBestVan(patient, NOW);

    expect(quote.kind).toBe("best");
    const chain = (etaSecondsToNewPatient as jest.Mock).mock.calls[0][1];
    expect(chain).toHaveLength(4);
    // Accepted first, in queue order; then the pending ones.
    chain.forEach((stop: { lat: number }, i: number) => expect(stop.lat).toBeCloseTo(53.801 + i / 1000, 6));
    if (quote.kind === "best") expect(quote.best.queueLength).toBe(4);
  });

  it("counts pending requests toward the queue limit", async () => {
    shifts.push({ id: "s1", vanId: "v1", lastLat: 1, lastLng: 1 });
    acceptedRows.push(row({ queuePosition: 1 }), row({ queuePosition: 2 }), row({ queuePosition: 3 }));
    pendingRows.push(row(), row());

    expect(await quoteBestVan(patient, NOW)).toEqual({ kind: "none_available" });
  });

  it("skips a shift with no position yet", async () => {
    shifts.push({ id: "s1", vanId: "v1", lastLat: null, lastLng: null });
    expect(await quoteBestVan(patient, NOW)).toEqual({ kind: "none_available" });
  });

  it("picks the van with the shortest wait when two cover the address", async () => {
    shifts.push({ id: "far", vanId: "v1", lastLat: 5, lastLng: 1 }, { id: "near", vanId: "v2", lastLat: 2, lastLng: 1 });

    const quote = await quoteBestVan(patient, NOW);

    expect(quote.kind === "best" && quote.best.shift.id).toBe("near");
  });

  it("asks only for requests still within their time limit", async () => {
    shifts.push({ id: "s1", vanId: "v1", lastLat: 1, lastLng: 1 });
    await quoteBestVan(patient, NOW);
    const calls = (prisma.vanServiceRequest.findMany as jest.Mock).mock.calls.map((c) => c[0].where);
    const pendingWhere = calls.find((w) => w.status === "pending");
    expect(pendingWhere.expiresAt).toEqual({ gt: NOW });
  });
});

describe("stopsAheadOf", () => {
  async function queue() {
    acceptedRows.push(row({ queuePosition: 1 }), row({ queuePosition: 2 }), row({ queuePosition: 3 }));
    pendingRows.push(row({ id: "p1" }), row({ id: "p2" }), row({ id: "p3" }));
    return loadShiftQueue(prisma, "s1", NOW);
  }

  it("for an accepted stop is the accepted stops before its place", async () => {
    const q = await queue();
    expect(stopsAheadOf(q, { id: "x", status: "accepted", queuePosition: 1 })).toHaveLength(0);
    expect(stopsAheadOf(q, { id: "x", status: "accepted", queuePosition: 3 })).toHaveLength(2);
  });

  it("for a pending request is every accepted stop and the pending requests made before it", async () => {
    const q = await queue();
    expect(stopsAheadOf(q, { id: "p1", status: "pending", queuePosition: null })).toHaveLength(3);
    expect(stopsAheadOf(q, { id: "p3", status: "pending", queuePosition: null })).toHaveLength(5);
  });

  it("treats a pending request the list does not hold (just expired) as last", async () => {
    const q = await queue();
    expect(stopsAheadOf(q, { id: "gone", status: "pending", queuePosition: null })).toHaveLength(6);
  });
});
