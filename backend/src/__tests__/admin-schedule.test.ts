import http from "http";
import crypto from "crypto";
import { londonDate, londonTimeToUtc, weekdayOf } from "../lib/availability";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-31: the back office sets clinic hours, closures, the weekly rota and
// per-date changes. Admin only, validated, and a change reports the
// upcoming visits it leaves outside working hours instead of cancelling
// them. Synthetic data only.
describe("admin: opening hours and rota", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const clinicIds: string[] = [];
  let adminToken = "";
  let clinicianToken = "";
  let clinicianId = "";
  let clinicId = "";

  const call = (method: string, path: string, token: string, body?: unknown) =>
    fetch(`${baseUrl}/api/admin${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: r.status === 204 ? null : ((await r.json()) as any) }));

  function nextWeekday(weekday: number): string {
    for (let d = 3; d < 10; d++) {
      const date = londonDate(new Date(Date.now() + d * 86400000));
      if (weekdayOf(date) === weekday) return date;
    }
    throw new Error("unreachable");
  }

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3017, resolve));
    baseUrl = "http://localhost:3017";

    const admin = await prisma.user.create({ data: { email: `sched-admin-${tag}@example.test`, passwordHash: "x", role: "admin" } });
    userIds.push(admin.id);
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
    const clinicianUser = await prisma.user.create({ data: { email: `sched-dentist-${tag}@example.test`, passwordHash: "x", role: "clinician" } });
    userIds.push(clinicianUser.id);
    clinicianToken = signAccessToken({ sub: clinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });
    clinicianId = (
      await prisma.clinicianProfile.create({
        data: { userId: clinicianUser.id, fullName: "Synthetic Dentist", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
      })
    ).id;
    clinicId = (
      await prisma.clinic.create({
        data: { name: `Synthetic Clinic ${tag}`, address: "1 Example Street", postcode: "ZZ1 1ZZ", city: "Testville", phone: "000", operatingHours: "Test" },
      })
    ).id;
    clinicIds.push(clinicId);
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { clinicianId } });
    await prisma.patientProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.clinic.deleteMany({ where: { id: { in: clinicIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("is for admins only", async () => {
    expect((await call("GET", "/clinics", clinicianToken)).status).toBe(403);
    expect((await call("PUT", `/clinicians/${clinicianId}/rota`, clinicianToken, { blocks: [] })).status).toBe(403);
  });

  it("sets and reads clinic hours and closures", async () => {
    const hours = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, opensMinute: 540, closesMinute: 1050 }));
    expect((await call("PUT", `/clinics/${clinicId}/hours`, adminToken, { hours })).status).toBe(200);
    const monday = nextWeekday(1);
    expect((await call("POST", `/clinics/${clinicId}/closures`, adminToken, { date: monday, reason: "Synthetic closure" })).status).toBe(201);

    const clinic = (await call("GET", "/clinics", adminToken)).body.find((c: any) => c.id === clinicId);
    expect(clinic.openingHours).toHaveLength(5);
    expect(clinic.closures).toEqual([{ date: monday, reason: "Synthetic closure" }]);

    expect((await call("DELETE", `/clinics/${clinicId}/closures/${monday}`, adminToken)).status).toBe(204);
    expect((await call("DELETE", `/clinics/${clinicId}/closures/${monday}`, adminToken)).status).toBe(404);
  });

  it("refuses impossible hours and overlapping rota blocks", async () => {
    expect((await call("PUT", `/clinics/${clinicId}/hours`, adminToken, { hours: [{ weekday: 1, opensMinute: 600, closesMinute: 540 }] })).status).toBe(400);
    expect((await call("PUT", `/clinics/${clinicId}/hours`, adminToken, { hours: [{ weekday: 7, opensMinute: 540, closesMinute: 600 }] })).status).toBe(400);
    const overlapping = [
      { weekday: 1, startMinute: 540, endMinute: 720 },
      { weekday: 1, startMinute: 700, endMinute: 900 },
    ];
    expect((await call("PUT", `/clinicians/${clinicianId}/rota`, adminToken, { blocks: overlapping })).status).toBe(400);
    expect(
      (await call("PUT", `/clinicians/${clinicianId}/rota`, adminToken, { blocks: [{ weekday: 1, startMinute: 540, endMinute: 600, clinicId: crypto.randomUUID() }] })).status
    ).toBe(422);
  });

  it("reports booked visits a rota change leaves outside working hours", async () => {
    const tuesday = nextWeekday(2);
    const blocks = [{ weekday: 2, startMinute: 540, endMinute: 1020 }];
    expect((await call("PUT", `/clinicians/${clinicianId}/rota`, adminToken, { blocks })).status).toBe(200);

    const patientUser = await prisma.user.create({ data: { email: `sched-patient-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    userIds.push(patientUser.id);
    const patient = await prisma.patientProfile.create({ data: { userId: patientUser.id, firstName: "Synthetic", lastName: "Patient" } });
    const service = await prisma.service.findFirstOrThrow({ select: { id: true } });
    const start = londonTimeToUtc(tuesday, 600);
    const visit = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        clinicianId,
        serviceId: service.id,
        channel: "video",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 1800000),
        status: "confirmed",
        totalPricePence: 0,
      },
    });

    // A day off that Tuesday: the visit is reported, not cancelled.
    const dayOff = await call("PUT", `/clinicians/${clinicianId}/overrides/${tuesday}`, adminToken, { working: false, reason: "Synthetic leave" });
    expect(dayOff.status).toBe(200);
    expect(dayOff.body.outsideHours.map((a: any) => a.id)).toEqual([visit.id]);
    expect((await prisma.appointment.findUniqueOrThrow({ where: { id: visit.id } })).status).toBe("confirmed");

    const listed = await call("GET", `/clinicians/${clinicianId}/overrides`, adminToken);
    expect(listed.body).toEqual([expect.objectContaining({ date: tuesday, working: false, reason: "Synthetic leave" })]);

    // Different hours that still cover 10:00: nothing to report.
    const later = await call("PUT", `/clinicians/${clinicianId}/overrides/${tuesday}`, adminToken, { working: true, startMinute: 570, endMinute: 720 });
    expect(later.body.outsideHours).toEqual([]);

    expect((await call("DELETE", `/clinicians/${clinicianId}/overrides/${tuesday}`, adminToken)).status).toBe(204);
    const clinician = (await call("GET", "/clinicians", adminToken)).body.find((c: any) => c.id === clinicianId);
    expect(clinician.rota).toEqual([{ weekday: 2, startMinute: 540, endMinute: 1020, clinicId: null }]);
  });
});
