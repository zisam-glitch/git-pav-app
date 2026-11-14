import http from "http";
import crypto from "crypto";

// Phase 1 of the van plan (docs/completion/16): the dispatch rules hold under
// repeated and concurrent taps. Stripe is an in-memory fake. Synthetic data
// only.
//   N2  reordering numbers the whole queue, stops under way stay ahead
//   N3  cancelling from the appointment screen renumbers the queue too
//   N5  a phase change is safe to repeat; only the first stop may set off
//   N6  the appointment follows the real treatment times
//   N16 the operator sees initials, not names, before accepting
//   N18 an impossible position report is refused
// Phase 2: accept and decline go through the rulebook (lib/van-dispatch.ts).

type FakeIntent = { id: string; status: string };
const intents = new Map<string, FakeIntent>();

jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    paymentIntents: {
      retrieve: jest.fn(async (id: string) => ({ ...intents.get(id)! })),
      capture: jest.fn(async (id: string) => {
        const intent = intents.get(id)!;
        if (intent.status === "requires_capture") intent.status = "succeeded";
        return { ...intent };
      }),
      cancel: jest.fn(async (id: string) => {
        const intent = intents.get(id)!;
        intent.status = "canceled";
        return { ...intent };
      }),
    },
    refunds: { create: jest.fn(async () => ({ id: "re_fake", amount: 0 })) },
  }))
);

jest.mock("../config/env", () => {
  const actual = jest.requireActual("../config/env");
  return { ...actual, env: { ...actual.env, isMockStripe: false } };
});

describe("van dispatch rules", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const vanIds: string[] = [];
  const operatorIds: string[] = [];
  let serviceId = "";

  const call = (method: string, path: string, token: string, body?: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: (await r.json().catch(() => null)) as any }));

  async function makeUser(role: "patient" | "operator", label: string) {
    const user = await prisma.user.create({ data: { email: `rules-${label}-${tag}@example.test`, passwordHash: "x", role } });
    userIds.push(user.id);
    return { user, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  async function makeOperator(label: string) {
    const { user, token } = await makeUser("operator", label);
    const operator = await prisma.operatorProfile.create({ data: { userId: user.id, fullName: "Synthetic Operator" } });
    operatorIds.push(operator.id);
    const van = await prisma.van.create({ data: { name: `Synthetic Van ${label} ${tag}`, registrationPlate: `DR${label}${tag}`.slice(0, 20), vehicleModel: "Test" } });
    vanIds.push(van.id);
    await prisma.vanOperatorAssignment.create({ data: { operatorId: operator.id, vanId: van.id, startsAt: new Date(Date.now() - 60_000) } });
    return { token, operator, van };
  }

  /** A pending request with an authorised fake hold, for a patient who gets a signed-in token. */
  async function makePendingRequest(shift: { id: string; vanId: string }, label: string, where = { lat: 51.5, lng: -0.12 }) {
    const { user, token } = await makeUser("patient", `pt-${label}`);
    const profile = await prisma.patientProfile.create({ data: { userId: user.id, firstName: "Synthetic", lastName: label } });
    const paymentIntentId = `pi_fake_${label}_${tag}`;
    intents.set(paymentIntentId, { id: paymentIntentId, status: "requires_capture" });
    const request = await prisma.vanServiceRequest.create({
      data: {
        shiftId: shift.id,
        vanId: shift.vanId,
        patientId: profile.id,
        serviceId,
        patientLat: where.lat,
        patientLng: where.lng,
        accessDetails: {},
        expiresAt: new Date(Date.now() + 3_600_000),
        etaSecondsSnapshot: 600,
        paymentIntentId,
      },
    });
    return { request, patientToken: token };
  }

  /** An operator on shift with `count` accepted stops, in order. */
  async function shiftWithStops(label: string, count: number) {
    const { token } = await makeOperator(label);
    const shift = (await call("POST", "/api/van/shift/start", token, {})).body;
    const stops = [];
    for (let i = 0; i < count; i++) {
      const { request, patientToken } = await makePendingRequest(shift, `${label}${i}`);
      const accepted = await call("POST", `/api/van/requests/${request.id}/accept`, token);
      expect(accepted.status).toBe(200);
      stops.push({ id: request.id, patientToken, appointmentId: accepted.body.appointmentId as string });
    }
    return { token, shift, stops };
  }

  const positions = async (shiftId: string) =>
    (await prisma.vanServiceRequest.findMany({ where: { shiftId, status: { in: ["accepted", "in_progress"] } }, orderBy: { queuePosition: "asc" }, select: { id: true, queuePosition: true } }));

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3040, resolve));
    baseUrl = "http://localhost:3040";
    serviceId = (await prisma.service.findFirstOrThrow()).id;
  });

  afterAll(async () => {
    const profiles = await prisma.patientProfile.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
    const patientIds = profiles.map((p) => p.id);
    await prisma.vanServiceRequest.deleteMany({ where: { vanId: { in: vanIds } } });
    await prisma.appointment.deleteMany({ where: { patientId: { in: patientIds } } });
    await prisma.vanShift.deleteMany({ where: { vanId: { in: vanIds } } });
    await prisma.vanOperatorAssignment.deleteMany({ where: { vanId: { in: vanIds } } });
    await prisma.van.deleteMany({ where: { id: { in: vanIds } } });
    await prisma.operatorProfile.deleteMany({ where: { id: { in: operatorIds } } });
    await prisma.patientProfile.deleteMany({ where: { userId: { in: userIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("moves a stop once however many times set-off is tapped, and not out of order (N5)", async () => {
    const { token, stops } = await shiftWithStops("phase", 2);

    // The second stop cannot set off while the first is still ahead of it.
    const early = await call("POST", `/api/van/requests/${stops[1].id}/phase`, token, { phase: "en_route" });
    expect(early.status).toBe(409);

    const taps = await Promise.all(Array.from({ length: 4 }, () => call("POST", `/api/van/requests/${stops[0].id}/phase`, token, { phase: "en_route" })));
    expect(taps.map((t) => t.status)).toEqual([200, 200, 200, 200]);
    const after = await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: stops[0].id } });
    expect(after.phase).toBe("en_route");
    expect(after.status).toBe("in_progress");

    // Skipping a step is still refused.
    const skip = await call("POST", `/api/van/requests/${stops[0].id}/phase`, token, { phase: "in_treatment" });
    expect(skip.status).toBe(409);
  });

  it("writes the visit's history in order, once per change, in the same transaction as the change", async () => {
    const { token, stops } = await shiftWithStops("history", 1);
    const phase = (p: string) => call("POST", `/api/van/requests/${stops[0].id}/phase`, token, { phase: p });
    await Promise.all([phase("en_route"), phase("en_route")]);
    expect((await phase("on_site")).status).toBe(200);
    expect((await phase("on_site")).status).toBe(200);

    const events = await prisma.vanRequestEvent.findMany({ where: { requestId: stops[0].id }, orderBy: { at: "asc" } });
    expect(events.map((e) => [e.type, e.fromPhase, e.toPhase, e.actorRole])).toEqual([
      ["accepted", "queued", "queued", "operator"],
      ["phase_changed", "queued", "en_route", "operator"],
      ["phase_changed", "en_route", "on_site", "operator"],
    ]);
  });

  it("checks in once however many times it is tapped, with the same push and history as a phase change", async () => {
    const { token, stops } = await shiftWithStops("checkin", 1);
    const taps = await Promise.all(Array.from({ length: 3 }, () => call("POST", `/api/van/stops/${stops[0].id}/check-in`, token)));
    expect(taps.map((t) => t.status)).toEqual([200, 200, 200]);
    expect(taps.every((t) => t.body.phase === "on_site")).toBe(true);
    expect((await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: stops[0].id } })).phase).toBe("on_site");
    expect(await prisma.vanRequestEvent.count({ where: { requestId: stops[0].id, type: "checked_in" } })).toBe(1);
  });

  it("declines once however many times it is tapped: one release, one history entry, the same answer", async () => {
    const { token } = await makeOperator("decline");
    const shift = (await call("POST", "/api/van/shift/start", token, {})).body;
    const { request } = await makePendingRequest(shift, "decline");

    const taps = await Promise.all(Array.from({ length: 3 }, () => call("POST", `/api/van/requests/${request.id}/decline`, token)));
    expect(taps.map((t) => t.status)).toEqual([200, 200, 200]);
    expect(taps.every((t) => t.body.status === "declined" && t.body.releaseStatus === "released")).toBe(true);
    expect(await prisma.vanRequestEvent.count({ where: { requestId: request.id, type: "declined" } })).toBe(1);
    expect(intents.get(request.paymentIntentId!)!.status).toBe("canceled");
    expect((await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: request.id } })).depositReleasedAt).not.toBeNull();

    // Declined is final: it cannot then be accepted.
    const accept = await call("POST", `/api/van/requests/${request.id}/accept`, token);
    expect(accept.status).toBe(409);
    expect(await prisma.appointment.count({ where: { patientId: request.patientId } })).toBe(0);
  });

  it("gives one answer when accept and decline are tapped at once", async () => {
    const { token } = await makeOperator("both");
    const shift = (await call("POST", "/api/van/shift/start", token, {})).body;
    const { request } = await makePendingRequest(shift, "both");

    const [accept, decline] = await Promise.all([
      call("POST", `/api/van/requests/${request.id}/accept`, token),
      call("POST", `/api/van/requests/${request.id}/decline`, token),
    ]);
    expect([accept.status, decline.status].sort()).toEqual([200, 409]);
    const after = await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: request.id } });
    const events = await prisma.vanRequestEvent.findMany({ where: { requestId: request.id, type: { in: ["accepted", "declined"] } } });
    expect(events.map((e) => e.type)).toEqual([after.status]);
    expect(await prisma.appointment.count({ where: { patientId: request.patientId } })).toBe(after.status === "accepted" ? 1 : 0);
  });

  it("does not accept on a paused shift, and accepts once it is resumed", async () => {
    const { token } = await makeOperator("paused");
    const shift = (await call("POST", "/api/van/shift/start", token, {})).body;
    const { request } = await makePendingRequest(shift, "paused");

    expect((await call("POST", "/api/van/shift/pause", token)).status).toBe(200);
    const refused = await call("POST", `/api/van/requests/${request.id}/accept`, token);
    expect(refused.status).toBe(409);
    expect(intents.get(request.paymentIntentId!)!.status).toBe("requires_capture");

    expect((await call("POST", "/api/van/shift/resume", token)).status).toBe(200);
    expect((await call("POST", `/api/van/requests/${request.id}/accept`, token)).status).toBe(200);
  });

  it("never ends a shift with an accepted stop on it, however accept and end-shift interleave", async () => {
    for (const round of ["a", "b", "c"]) {
      const { token } = await makeOperator(`end${round}`);
      const shift = (await call("POST", "/api/van/shift/start", token, {})).body;
      const { request } = await makePendingRequest(shift, `end${round}`);

      const [accept, end] = await Promise.all([
        call("POST", `/api/van/requests/${request.id}/accept`, token),
        call("POST", "/api/van/shift/end", token),
      ]);
      const shiftAfter = await prisma.vanShift.findUniqueOrThrow({ where: { id: shift.id } });
      const requestAfter = await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: request.id } });
      if (end.status === 200) {
        expect(accept.status).not.toBe(200);
        expect(shiftAfter.endedAt).not.toBeNull();
        expect(requestAfter.status).toBe("expired");
        expect(intents.get(request.paymentIntentId!)!.status).toBe("canceled");
        expect(await prisma.vanRequestEvent.count({ where: { requestId: request.id, type: "shift_ended" } })).toBe(1);
      } else {
        expect(end.status).toBe(409);
        expect(accept.status).toBe(200);
        expect(shiftAfter.endedAt).toBeNull();
        expect(requestAfter.status).toBe("accepted");
      }
    }
  });

  it("times a request out once: one release, one history entry, and leaves one still in time alone", async () => {
    const { processExpiredVanRequests } = require("../lib/background-jobs");
    const { token } = await makeOperator("expiry");
    const shift = (await call("POST", "/api/van/shift/start", token, {})).body;
    const { request: late } = await makePendingRequest(shift, "late");
    const { request: inTime } = await makePendingRequest(shift, "intime");
    await prisma.vanServiceRequest.update({ where: { id: late.id }, data: { expiresAt: new Date(Date.now() - 1000) } });

    await processExpiredVanRequests();
    await processExpiredVanRequests();

    const after = await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: late.id } });
    expect(after.status).toBe("expired");
    expect(after.depositReleaseStatus).toBe("released");
    expect(after.depositReleasedAt).not.toBeNull();
    expect(intents.get(late.paymentIntentId!)!.status).toBe("canceled");
    expect(await prisma.vanRequestEvent.count({ where: { requestId: late.id, type: "expired" } })).toBe(1);

    expect((await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: inTime.id } })).status).toBe("pending");
    expect(intents.get(inTime.paymentIntentId!)!.status).toBe("requires_capture");

    // Timed out is final.
    expect((await call("POST", `/api/van/requests/${late.id}/accept`, token)).status).toBe(409);
  });

  it("stamps the appointment with the real treatment times (N6)", async () => {
    const { token, stops } = await shiftWithStops("times", 1);
    const phase = (p: string) => call("POST", `/api/van/requests/${stops[0].id}/phase`, token, { phase: p });
    for (const p of ["en_route", "on_site"]) expect((await phase(p)).status).toBe(200);

    const before = Date.now();
    expect((await phase("in_treatment")).status).toBe(200);
    const treating = await prisma.appointment.findUniqueOrThrow({ where: { id: stops[0].appointmentId } });
    expect(treating.status).toBe("in_progress");
    expect(Math.abs(treating.startTimeUtc.getTime() - before)).toBeLessThan(10_000);

    expect((await phase("completed")).status).toBe(200);
    const done = await prisma.appointment.findUniqueOrThrow({ where: { id: stops[0].appointmentId } });
    expect(done.status).toBe("completed");
    expect(done.endTimeUtc.getTime()).toBeGreaterThanOrEqual(done.startTimeUtc.getTime());
  });

  it("numbers the whole queue when it is reordered, keeping a stop under way first (N2)", async () => {
    const { token, shift, stops } = await shiftWithStops("reorder", 3);
    expect((await call("POST", `/api/van/requests/${stops[0].id}/phase`, token, { phase: "en_route" })).status).toBe(200);

    const reordered = await call("POST", "/api/van/shift/queue/reorder", token, { order: [stops[2].id, stops[1].id] });
    expect(reordered.status).toBe(200);
    expect(await positions(shift.id)).toEqual([
      { id: stops[0].id, queuePosition: 1 },
      { id: stops[2].id, queuePosition: 2 },
      { id: stops[1].id, queuePosition: 3 },
    ]);

    // An order that leaves a stop out is refused and changes nothing.
    const bad = await call("POST", "/api/van/shift/queue/reorder", token, { order: [stops[1].id] });
    expect(bad.status).toBe(409);
    expect((await positions(shift.id)).map((p) => p.queuePosition)).toEqual([1, 2, 3]);
  });

  it("closes the gap in the queue when the patient cancels from the appointment screen (N3)", async () => {
    const { shift, stops } = await shiftWithStops("cancel", 2);

    const cancelled = await call("POST", `/api/booking/appointments/${stops[0].appointmentId}/cancel`, stops[0].patientToken);
    expect(cancelled.status).toBe(200);

    expect(await positions(shift.id)).toEqual([{ id: stops[1].id, queuePosition: 1 }]);
    expect((await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: stops[0].id } })).status).toBe("cancelled");
    // The hold is released the same way as from the tracking screen.
    expect(await prisma.vanRequestEvent.count({ where: { requestId: stops[0].id, type: "cancelled" } })).toBe(1);
    const intent = intents.get(`pi_fake_cancel0_${tag}`)!;
    expect(["canceled", "succeeded"]).toContain(intent.status);
  });

  it("cancels once however many times the patient taps: the same answer, one history entry, the appointment cancelled", async () => {
    const { shift, stops } = await shiftWithStops("recancel", 2);

    const taps = await Promise.all(Array.from({ length: 3 }, () => call("POST", `/api/van/requests/${stops[0].id}/cancel`, stops[0].patientToken)));
    expect(taps.map((t) => t.status)).toEqual([200, 200, 200]);
    expect(new Set(taps.map((t) => t.body.depositOutcome)).size).toBe(1);
    expect(taps.every((t) => t.body.status === "cancelled" && t.body.depositRetained === false)).toBe(true);
    expect(await prisma.vanRequestEvent.count({ where: { requestId: stops[0].id, type: "cancelled" } })).toBe(1);
    expect((await prisma.appointment.findUniqueOrThrow({ where: { id: stops[0].appointmentId } })).status).toBe("cancelled");
    expect(await positions(shift.id)).toEqual([{ id: stops[1].id, queuePosition: 1 }]);
  });

  it("shows the operator initials, not names, before a request is accepted (N16)", async () => {
    const { token } = await makeOperator("initials");
    const shift = (await call("POST", "/api/van/shift/start", token, {})).body;
    await makePendingRequest(shift, "Initials");

    const current = await call("GET", "/api/van/shift/current", token);
    expect(current.status).toBe(200);
    expect(current.body.incoming).toHaveLength(1);
    expect(current.body.incoming[0].patient).toEqual({ firstName: "S.", lastName: "I." });
  });

  it("counts requests still waiting for an answer in the next patient's quote and in the queue limit (N7)", async () => {
    const { token, van } = await makeOperator("pending");
    // A box around central London, so the shift covers the point asked about.
    await prisma.vanServicePolygon.create({
      data: {
        vanId: van.id,
        sectorName: `Synthetic ${tag}`,
        polygonGeoJson: { type: "Polygon", coordinates: [[[-0.2, 51.4], [0.0, 51.4], [0.0, 51.6], [-0.2, 51.6], [-0.2, 51.4]]] },
      },
    });
    const shift = (await call("POST", "/api/van/shift/start", token, { lat: 51.5, lng: -0.12 })).body;
    const asker = await makeUser("patient", "asker");
    await prisma.patientProfile.create({ data: { userId: asker.user.id, firstName: "Synthetic", lastName: "Asker" } });
    const ask = () => call("GET", "/api/van/availability?lat=51.51&lng=-0.11", asker.token);

    const empty = await ask();
    expect(empty.body).toMatchObject({ available: true, queueLength: 0 });

    for (let i = 0; i < 4; i++) await makePendingRequest(shift, `wait${i}`);
    const busy = await ask();
    expect(busy.body).toMatchObject({ available: true, queueLength: 4 });
    expect(busy.body.etaSeconds).toBeGreaterThan(empty.body.etaSeconds);

    await makePendingRequest(shift, "wait4");
    const full = await ask();
    expect(full.body.available).toBe(false);
  });

  describe("where a newly accepted stop goes in the queue (N8)", () => {
    // Three addresses on a line north of the van: A near, B far, C between them.
    const near = { lat: 51.52, lng: -0.12 };
    const far = { lat: 51.56, lng: -0.12 };
    const between = { lat: 51.54, lng: -0.12 };

    async function acceptInOrder(label: string, promisedForSeconds: number | null) {
      const { token } = await makeOperator(label);
      const shift = (await call("POST", "/api/van/shift/start", token, { lat: 51.5, lng: -0.12 })).body;
      const ids: Record<string, string> = {};
      for (const [name, where] of [["a", near], ["b", far], ["c", between]] as const) {
        const { request } = await makePendingRequest(shift, `${label}${name}`, where);
        if (promisedForSeconds !== null) {
          // What the patient last heard, as if an ETA push had gone out just now.
          await prisma.vanServiceRequest.update({ where: { id: request.id }, data: { lastEtaSeconds: promisedForSeconds, lastEtaPushedAt: new Date() } });
        }
        expect((await call("POST", `/api/van/requests/${request.id}/accept`, token)).status).toBe(200);
        ids[name] = request.id;
      }
      const order = (await positions(shift.id)).map((p) => p.id);
      return { order, ids };
    }

    it("goes between two stops when its address is on the way and nobody is made later than they were told", async () => {
      const { order, ids } = await acceptInOrder("placeok", 36_000);
      expect(order).toEqual([ids.a, ids.c, ids.b]);
    });

    it("goes to the back when going earlier would make a patient later than they were told", async () => {
      const { order, ids } = await acceptInOrder("placelate", null);
      expect(order).toEqual([ids.a, ids.b, ids.c]);
    });
  });

  it("refuses a position report no van could make, and takes an ordinary one (N18)", async () => {
    const { token } = await makeOperator("ping");
    const started = await call("POST", "/api/van/shift/start", token, { lat: 51.5, lng: -0.12 });
    expect(started.status).toBe(201);

    const jump = await call("POST", "/api/van/shift/location", token, { lat: 51.7, lng: -0.12 });
    expect(jump.status).toBe(200);
    expect(jump.body).toMatchObject({ accepted: false, reason: "impossible_speed" });
    expect((await prisma.vanShift.findUniqueOrThrow({ where: { id: started.body.id } })).lastLat).toBe(51.5);

    const rough = await call("POST", "/api/van/shift/location", token, { lat: 51.5001, lng: -0.12, accuracyM: 900 });
    expect(rough.body).toMatchObject({ accepted: false, reason: "inaccurate" });
  });
});
