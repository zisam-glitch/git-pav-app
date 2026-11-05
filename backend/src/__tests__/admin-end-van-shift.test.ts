import http from "http";
import crypto from "crypto";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import app from "../server";

// A shift left running blocks its van and operator from starting another, and
// only the operator could end it. Staff can now end it from the dashboard, with
// the same rules as the operator. Synthetic data only.
describe("staff ending a van shift", () => {
  jest.setTimeout(30_000);
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const profileIds: string[] = [];
  const operatorIds: string[] = [];
  const vanIds: string[] = [];
  const shiftIds: string[] = [];
  const requestIds: string[] = [];
  let adminId = "";
  let adminToken = "";
  let patientToken = "";
  let operatorToken = "";
  let serviceId = "";

  const end = (id: string, token = adminToken) =>
    fetch(`${baseUrl}/api/admin/van-shifts/${id}/end`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).then(async (r) => ({
      status: r.status,
      body: (await r.json()) as { [key: string]: unknown },
    }));

  async function makeVanWithShift(label: string) {
    const user = await prisma.user.create({ data: { email: `endshift-op-${label}-${tag}@example.test`, passwordHash: "x", role: "operator" } });
    userIds.push(user.id);
    const operator = await prisma.operatorProfile.create({ data: { userId: user.id, fullName: `Synthetic Driver ${label}` } });
    operatorIds.push(operator.id);
    const van = await prisma.van.create({ data: { name: `Synthetic Van ${label} ${tag}`, registrationPlate: `ES${label}${tag}`.slice(0, 20), vehicleModel: "Synthetic" } });
    vanIds.push(van.id);
    const shift = await prisma.vanShift.create({ data: { vanId: van.id, operatorId: operator.id, status: "online" } });
    shiftIds.push(shift.id);
    return { user, operator, van, shift };
  }

  async function makeRequest(shiftId: string, vanId: string, label: string, status: "pending" | "accepted") {
    const user = await prisma.user.create({ data: { email: `endshift-pt-${label}-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    userIds.push(user.id);
    const profile = await prisma.patientProfile.create({ data: { userId: user.id, firstName: "Synthetic", lastName: label } });
    profileIds.push(profile.id);
    const request = await prisma.vanServiceRequest.create({
      data: { shiftId, vanId, patientId: profile.id, serviceId, status, patientLat: 51.5, patientLng: -0.12, accessDetails: {}, expiresAt: new Date(Date.now() + 3600_000) },
    });
    requestIds.push(request.id);
    return request;
  }

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3036, resolve));
    baseUrl = "http://localhost:3036";

    const admin = await prisma.user.create({ data: { email: `endshift-admin-${tag}@example.test`, passwordHash: "x", role: "admin" } });
    const patient = await prisma.user.create({ data: { email: `endshift-patient-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    userIds.push(admin.id, patient.id);
    adminId = admin.id;
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });
    serviceId = (await prisma.service.findFirstOrThrow()).id;
  });

  afterAll(async () => {
    await prisma.vanServiceRequest.deleteMany({ where: { id: { in: requestIds } } });
    await prisma.vanShift.deleteMany({ where: { vanId: { in: vanIds } } });
    await prisma.van.deleteMany({ where: { id: { in: vanIds } } });
    await prisma.operatorProfile.deleteMany({ where: { id: { in: operatorIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    // Users stay: audit_logs has a foreign key to users with ON DELETE SET NULL,
    // which would change rows already hashed into the audit chain.
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("ends a forgotten shift, expires what was waiting, records it, and frees the van and operator", async () => {
    const { shift, van, operator, user } = await makeVanWithShift("stuck");
    operatorToken = signAccessToken({ sub: user.id, role: "operator", sessionId: crypto.randomUUID() });
    const waiting = await makeRequest(shift.id, van.id, "waiting", "pending");

    // Still running, so the van can't take a second shift.
    await expect(prisma.vanShift.create({ data: { vanId: van.id, operatorId: operator.id } })).rejects.toMatchObject({ code: "P2002" });

    const res = await end(shift.id);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: shift.id, status: "offline", expiredRequests: 1, depositReleasesFailed: 0 });
    expect(res.body.endedAt).toEqual(expect.any(String));

    const after = await prisma.vanShift.findUniqueOrThrow({ where: { id: shift.id } });
    expect(after).toMatchObject({ status: "offline" });
    expect(after.endedAt).not.toBeNull();
    expect((await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: waiting.id } })).status).toBe("expired");

    const audit = await prisma.auditLog.findFirst({ where: { action: "admin.van_shift.ended", resourceId: shift.id } });
    expect(audit).toMatchObject({ actorId: adminId });
    expect(audit?.metadata).toMatchObject({ vanId: van.id, operatorId: operator.id, expiredRequests: 1, depositReleasesFailed: 0 });

    // The point of it: the van and the operator can start again.
    const next = await prisma.vanShift.create({ data: { vanId: van.id, operatorId: operator.id, status: "online" } });
    shiftIds.push(next.id);
    expect(next.endedAt).toBeNull();
  });

  it("refuses while a stop is accepted, and changes nothing", async () => {
    const { shift, van } = await makeVanWithShift("open");
    const stop = await makeRequest(shift.id, van.id, "accepted", "accepted");

    const res = await end(shift.id);
    expect(res.status).toBe(409);
    expect(res.body.openStops).toBe(1);
    expect(res.body.error).toMatch(/1 accepted or in-progress stop\(s\) are still open/);
    expect(res.body.error).toMatch(/cancel or complete those visits first/i);

    expect((await prisma.vanShift.findUniqueOrThrow({ where: { id: shift.id } })).endedAt).toBeNull();
    expect((await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: stop.id } })).status).toBe("accepted");
    expect(await prisma.auditLog.count({ where: { action: "admin.van_shift.ended", resourceId: shift.id } })).toBe(0);
  });

  it("says so when the shift has already ended, or doesn't exist", async () => {
    const { shift } = await makeVanWithShift("done");
    expect((await end(shift.id)).status).toBe(200);
    const again = await end(shift.id);
    expect(again.status).toBe(409);
    expect(again.body.error).toBe("That shift has already ended");

    expect((await end(crypto.randomUUID())).status).toBe(404);
  });

  it("rejects a bad id and anyone who isn't staff", async () => {
    const { shift } = await makeVanWithShift("guard");
    expect((await end("not-an-id")).status).toBe(400);
    expect((await end(shift.id, patientToken)).status).toBe(403);
    expect((await end(shift.id, operatorToken)).status).toBe(403);
    const anon = await fetch(`${baseUrl}/api/admin/van-shifts/${shift.id}/end`, { method: "POST" });
    expect(anon.status).toBe(401);
    // None of those touched it.
    expect((await prisma.vanShift.findUniqueOrThrow({ where: { id: shift.id } })).endedAt).toBeNull();
  });
});
