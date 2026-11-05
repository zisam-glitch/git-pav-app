import http from "http";
import crypto from "crypto";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import app from "../server";

// DB-05: staff can see which vans are out and recent shifts, without where a
// van is or who its requests are from. Synthetic data only.
describe("admin van shifts", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const vanIds: string[] = [];
  const operatorIds: string[] = [];
  const shiftIds: string[] = [];
  const requestIds: string[] = [];
  const patientProfileIds: string[] = [];
  let adminToken = "";
  let patientToken = "";
  let operatorToken = "";
  let liveShiftId = "";
  let endedShiftId = "";
  let vanA = "";
  let vanB = "";

  const get = <T = Record<string, unknown>>(path: string, token = adminToken) =>
    fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(async (r) => ({
      status: r.status,
      text: await r.clone().text(),
      body: (await r.json()) as T,
    }));

  type Shift = {
    id: string;
    vanName: string;
    operatorName: string;
    status: string;
    live: boolean;
    endedAt: string | null;
    lastSeenAt: string | null;
    openRequests: number;
  };

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3034, resolve));
    baseUrl = "http://localhost:3034";

    const roles = ["admin", "patient", "operator", "operator", "patient"] as const;
    const users = await Promise.all(
      roles.map((role, i) => prisma.user.create({ data: { email: `shift-${role}-${i}-${tag}@example.test`, passwordHash: "x", role } })),
    );
    users.forEach((u) => userIds.push(u.id));
    const [admin, patient, opUserA, opUserB, patient2] = users;
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });
    operatorToken = signAccessToken({ sub: opUserA.id, role: "operator", sessionId: crypto.randomUUID() });

    const profile = await prisma.patientProfile.create({ data: { userId: patient.id, firstName: "Synthetic", lastName: `Requester${tag}` } });
    const profile2 = await prisma.patientProfile.create({ data: { userId: patient2.id, firstName: "Synthetic", lastName: `Second${tag}` } });
    patientProfileIds.push(profile.id, profile2.id);

    const opA = await prisma.operatorProfile.create({ data: { userId: opUserA.id, fullName: `Synthetic Driver A ${tag}` } });
    const opB = await prisma.operatorProfile.create({ data: { userId: opUserB.id, fullName: `Synthetic Driver B ${tag}` } });
    operatorIds.push(opA.id, opB.id);

    const a = await prisma.van.create({ data: { name: `Synthetic Van A ${tag}`, registrationPlate: `SA${tag}`, vehicleModel: "Synthetic" } });
    const b = await prisma.van.create({ data: { name: `Synthetic Van B ${tag}`, registrationPlate: `SB${tag}`, vehicleModel: "Synthetic" } });
    vanA = a.id;
    vanB = b.id;
    vanIds.push(a.id, b.id);

    // Van A is out now, last seen at a place that must never reach staff.
    const live = await prisma.vanShift.create({
      data: { vanId: a.id, operatorId: opA.id, status: "online", startedAt: new Date("2031-03-11T08:00:00Z"), lastLat: 51.50123, lastLng: -0.12456, lastLocationAt: new Date("2031-03-11T09:59:00Z") },
    });
    // Van B finished earlier.
    const ended = await prisma.vanShift.create({
      data: { vanId: b.id, operatorId: opB.id, status: "offline", startedAt: new Date("2031-03-10T08:00:00Z"), endedAt: new Date("2031-03-10T16:00:00Z"), lastLat: 51.60999, lastLng: -0.22999 },
    });
    liveShiftId = live.id;
    endedShiftId = ended.id;
    shiftIds.push(live.id, ended.id);

    const service = await prisma.service.findFirstOrThrow();
    // A patient can only have one open request, so the second open one is from someone else.
    const requests = [
      { status: "pending", patientId: profile.id },
      { status: "accepted", patientId: profile2.id },
      { status: "completed", patientId: profile.id },
      { status: "cancelled", patientId: profile.id },
    ] as const;
    for (const { status, patientId } of requests) {
      const request = await prisma.vanServiceRequest.create({
        data: {
          shiftId: live.id,
          vanId: a.id,
          patientId,
          serviceId: service.id,
          status,
          patientLat: 51.70555,
          patientLng: -0.33555,
          accessDetails: { gateCode: `SECRET-GATE-${tag}` },
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      requestIds.push(request.id);
    }
  });

  afterAll(async () => {
    await prisma.vanServiceRequest.deleteMany({ where: { id: { in: requestIds } } });
    await prisma.vanShift.deleteMany({ where: { id: { in: shiftIds } } });
    await prisma.van.deleteMany({ where: { id: { in: vanIds } } });
    await prisma.operatorProfile.deleteMany({ where: { id: { in: operatorIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: patientProfileIds } } });
    // Users stay: audit_logs has a foreign key to users with ON DELETE SET NULL,
    // which would change rows already hashed into the audit chain.
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const ours = (rows: Shift[]) => rows.filter((s) => shiftIds.includes(s.id));

  it("lists live shifts first, then recent ones, with who, when and how many requests are open", async () => {
    const res = await get<{ shifts: Shift[]; total: number }>(`/api/admin/van-shifts?limit=100`);
    expect(res.status).toBe(200);
    const rows = ours(res.body.shifts);
    expect(rows.map((s) => s.id)).toEqual([liveShiftId, endedShiftId]);
    expect(rows[0]).toMatchObject({
      vanName: `Synthetic Van A ${tag}`,
      operatorName: `Synthetic Driver A ${tag}`,
      status: "online",
      live: true,
      endedAt: null,
      lastSeenAt: "2031-03-11T09:59:00.000Z",
      // pending and accepted are open; completed and cancelled are not.
      openRequests: 2,
    });
    expect(rows[1]).toMatchObject({ live: false, endedAt: "2031-03-10T16:00:00.000Z", lastSeenAt: null, openRequests: 0 });
  });

  it("never carries where a van is, or who or where its requests are from", async () => {
    const res = await get(`/api/admin/van-shifts?limit=100`);
    for (const secret of ["51.50123", "-0.12456", "51.60999", "51.70555", "-0.33555", `SECRET-GATE-${tag}`, `Requester${tag}`, "lastLat", "accessDetails", "patientId"]) {
      expect(res.text).not.toContain(secret);
    }
  });

  it("filters by live or ended, and by van", async () => {
    const live = await get<{ shifts: Shift[] }>(`/api/admin/van-shifts?state=live&limit=100`);
    expect(ours(live.body.shifts).map((s) => s.id)).toEqual([liveShiftId]);

    const ended = await get<{ shifts: Shift[] }>(`/api/admin/van-shifts?state=ended&limit=100`);
    expect(ours(ended.body.shifts).map((s) => s.id)).toEqual([endedShiftId]);

    const byVan = await get<{ shifts: Shift[]; total: number }>(`/api/admin/van-shifts?vanId=${vanB}`);
    expect(byVan.body.shifts.map((s) => s.id)).toEqual([endedShiftId]);
    expect(byVan.body.total).toBe(1);

    const none = await get<{ shifts: Shift[] }>(`/api/admin/van-shifts?vanId=${vanA}&state=ended`);
    expect(none.body.shifts).toEqual([]);
  });

  it("pages the list", async () => {
    const page = await get<{ shifts: Shift[]; total: number; page: number; limit: number }>(`/api/admin/van-shifts?vanId=${vanA}&limit=1&page=2`);
    expect(page.status).toBe(200);
    expect(page.body).toMatchObject({ shifts: [], total: 1, page: 2, limit: 1 });
  });

  it("rejects bad input and anyone who isn't staff", async () => {
    for (const path of [`/api/admin/van-shifts?state=sideways`, `/api/admin/van-shifts?vanId=not-an-id`, `/api/admin/van-shifts?surprise=1`]) {
      expect((await get(path)).status).toBe(400);
    }
    expect((await get(`/api/admin/van-shifts`, patientToken)).status).toBe(403);
    expect((await get(`/api/admin/van-shifts`, operatorToken)).status).toBe(403);
    expect((await fetch(`${baseUrl}/api/admin/van-shifts`)).status).toBe(401);
  });
});
