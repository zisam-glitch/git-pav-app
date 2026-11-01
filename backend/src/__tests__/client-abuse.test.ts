import http from "http";
import crypto from "crypto";
import { postcodeSector, sanitizeIncomingRequest } from "../routes/van";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";

// CS-09, the rest: the app can't send itself notifications or fake receipts
// (NT-1), can't write server-looking audit entries or archive recent ones
// (AR-1); a van patient further back in the queue still gets an ETA (VR-4),
// and an operator sees only the area of a request before accepting it
// (VR-5). Synthetic data only.
describe("client-reachable abuse paths", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const cleanup: (() => Promise<unknown>)[] = [];

  async function makeUser(role: "patient" | "operator" | "admin", label: string) {
    const user = await prisma.user.create({ data: { email: `abuse-${label}-${tag}@example.test`, passwordHash: "x", role } });
    userIds.push(user.id);
    return { user, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  const call = (method: string, path: string, token: string, body?: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: (await r.json().catch(() => null)) as any }));

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3024, resolve));
    baseUrl = "http://localhost:3024";
  });

  afterAll(async () => {
    for (const fn of cleanup.reverse()) await fn();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("has no client-callable send, schedule or receipt routes", async () => {
    const { token } = await makeUser("patient", "notify");
    expect((await call("POST", "/api/notifications/send", token, { title: "x", body: "y" })).status).toBe(404);
    expect((await call("POST", "/api/notifications/schedule", token, { title: "x", body: "y", scheduledFor: new Date(Date.now() + 60000).toISOString() })).status).toBe(404);
    expect((await call("POST", "/api/notifications/send-receipt", token, { appointmentId: crypto.randomUUID(), amountPence: 100, paymentMethod: "card" })).status).toBe(404);
  });

  it("has no client-callable audit write route", async () => {
    // Only the server writes audit entries; clients can't add their own.
    const { token } = await makeUser("patient", "audit");
    expect((await call("POST", "/api/audit/log", token, { action: "UNAUTHORIZED_ACCESS_ATTEMPT" })).status).toBe(404);
  });

  it("never archives audit entries less than a year old", async () => {
    const { user, token } = await makeUser("admin", "archive");
    await createAuditLogWithIntegrity({ action: "test.archive-probe", actorId: user.id });
    expect((await call("POST", "/api/audit/retention", token, { retentionDays: 1 })).status).toBe(200);
    const entry = await prisma.auditLog.findFirstOrThrow({ where: { actorId: user.id, action: "test.archive-probe" } });
    expect(entry.archived).toBe(false);
  });

  it("shows an operator only the area of a request before it's accepted", () => {
    expect(postcodeSector("sw1a 1aa")).toBe("SW1A 1");
    expect(postcodeSector("M11AE")).toBe("M1 1");
    expect(postcodeSector("")).toBeNull();
    const shown = sanitizeIncomingRequest({
      id: "r1",
      patientLat: 51.501364,
      patientLng: -0.14189,
      accessDetails: { parkingType: "street", city: "London", postcode: "SW1A 1AA", gateCode: "1234", notes: "Synthetic" },
    });
    expect(shown).toMatchObject({ patientLat: 51.5, patientLng: -0.14 });
    expect(shown.accessDetails).toEqual({ parkingType: "street", city: "London", postcode: "SW1A 1" });
  });

  it("gives a patient further back in the queue an ETA but not the van's position", async () => {
    const operatorUser = await makeUser("operator", "operator");
    const operator = await prisma.operatorProfile.create({ data: { userId: operatorUser.user.id, fullName: "Synthetic Operator" } });
    const van = await prisma.van.create({ data: { name: `Synthetic Van ${tag}`, registrationPlate: `ZY${tag}`, vehicleModel: "Test" } });
    const shift = await prisma.vanShift.create({
      data: { vanId: van.id, operatorId: operator.id, lastLat: 51.5, lastLng: -0.12, lastLocationAt: new Date() },
    });
    const serviceId = (await prisma.service.findFirstOrThrow()).id;

    const makeRequest = async (label: string, queuePosition: number, lat: number) => {
      const { user, token } = await makeUser("patient", label);
      const profile = await prisma.patientProfile.create({ data: { userId: user.id, firstName: "Synthetic", lastName: label } });
      const request = await prisma.vanServiceRequest.create({
        data: {
          shiftId: shift.id,
          vanId: van.id,
          patientId: profile.id,
          serviceId,
          status: "accepted",
          queuePosition,
          patientLat: lat,
          patientLng: -0.12,
          accessDetails: {},
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      return { token, request, profileId: profile.id };
    };
    const first = await makeRequest("first", 1, 51.51);
    const second = await makeRequest("second", 2, 51.52);
    cleanup.push(async () => {
      await prisma.vanServiceRequest.deleteMany({ where: { shiftId: shift.id } });
      await prisma.patientProfile.deleteMany({ where: { id: { in: [first.profileId, second.profileId] } } });
      await prisma.vanShift.delete({ where: { id: shift.id } });
      await prisma.van.delete({ where: { id: van.id } });
      await prisma.operatorProfile.delete({ where: { id: operator.id } });
    });

    for (const path of ["/api/van/requests/mine/active", `/api/van/requests/${second.request.id}`]) {
      const res = await call("GET", path, second.token);
      expect(res.status).toBe(200);
      expect(res.body.etaSeconds).toEqual(expect.any(Number));
      expect(res.body.shift.lastLat).toBeNull();
    }
    const next = await call("GET", "/api/van/requests/mine/active", first.token);
    expect(next.body.shift.lastLat).toBe(51.5);
  });
});
