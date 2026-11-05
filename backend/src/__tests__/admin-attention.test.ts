import http from "http";
import crypto from "crypto";
import { londonTimeToUtc } from "../lib/availability";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import app from "../server";

// DB-04: the staff home page shows counts of what needs a person. Counts only,
// no names or amounts. Other test files share this database and run at the
// same time, so each check looks for a rise from a reading taken first, not an
// exact total. Synthetic data only.
describe("admin attention counts", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const appointmentIds: string[] = [];
  const threadIds: string[] = [];
  const erasureIds: string[] = [];
  const requestIds: string[] = [];
  const shiftIds: string[] = [];
  const vanIds: string[] = [];
  const operatorIds: string[] = [];
  const profileIds: string[] = [];
  let adminToken = "";
  let patientToken = "";
  let clinicianToken = "";
  let patientUserId = "";
  let profileId = "";
  let serviceId = "";

  type Attention = {
    visitsToday: number;
    visitsLeftToday: number;
    unreadThreads: number;
    erasureOpen: number;
    erasureOverdue: number;
    cardFailuresLastWeek: number;
    depositReleaseFailures: number;
    vansOut: number;
    asOf: string;
  };

  const read = async (token = adminToken) => {
    const res = await fetch(`${baseUrl}/api/admin/attention`, { headers: { Authorization: `Bearer ${token}` } });
    return { status: res.status, text: await res.clone().text(), body: (await res.json()) as Attention };
  };

  const ukToday = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const ukYesterday = new Date(Date.now() - 36 * 3600_000).toLocaleDateString("en-CA", { timeZone: "Europe/London" });

  const visit = async (day: string, minute: number, status: "confirmed" | "completed" | "cancelled") => {
    const start = londonTimeToUtc(day, minute);
    const appointment = await prisma.appointment.create({
      data: {
        patientId: profileId,
        serviceId,
        channel: "video",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 30 * 60000),
        status,
        totalPricePence: 5000,
      },
    });
    appointmentIds.push(appointment.id);
  };

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3035, resolve));
    baseUrl = "http://localhost:3035";

    const roles = ["admin", "patient", "clinician", "operator"] as const;
    const users = await Promise.all(
      roles.map((role, i) => prisma.user.create({ data: { email: `attn-${role}-${i}-${tag}@example.test`, passwordHash: "x", role } })),
    );
    users.forEach((u) => userIds.push(u.id));
    const [admin, patient, clinician, operator] = users;
    patientUserId = patient.id;
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });
    clinicianToken = signAccessToken({ sub: clinician.id, role: "clinician", sessionId: crypto.randomUUID() });

    const profile = await prisma.patientProfile.create({ data: { userId: patient.id, firstName: "Synthetic", lastName: `Attention${tag}` } });
    profileId = profile.id;
    profileIds.push(profile.id);

    serviceId = `srv_attn_${tag}`;
    await prisma.service.create({
      data: { id: serviceId, name: `Synthetic attention ${tag}`, category: "checkup", description: "Synthetic.", durationMinutes: 30, pricePence: 5000, depositPence: 0, supportedChannels: ["video"] },
    });

    const op = await prisma.operatorProfile.create({ data: { userId: operator.id, fullName: `Synthetic Driver ${tag}` } });
    operatorIds.push(op.id);
    const van = await prisma.van.create({ data: { name: `Synthetic Van ${tag}`, registrationPlate: `AT${tag}`, vehicleModel: "Synthetic" } });
    vanIds.push(van.id);
    const shift = await prisma.vanShift.create({ data: { vanId: van.id, operatorId: op.id, status: "online" } });
    shiftIds.push(shift.id);

    const before = await read();
    expect(before.status).toBe(200);
    (globalThis as { __attnBefore?: Attention }).__attnBefore = before.body;
  });

  afterAll(async () => {
    await prisma.vanServiceRequest.deleteMany({ where: { id: { in: requestIds } } });
    await prisma.vanShift.deleteMany({ where: { id: { in: shiftIds } } });
    await prisma.van.deleteMany({ where: { id: { in: vanIds } } });
    await prisma.operatorProfile.deleteMany({ where: { id: { in: operatorIds } } });
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.messageThread.deleteMany({ where: { id: { in: threadIds } } });
    await prisma.erasureRequest.deleteMany({ where: { id: { in: erasureIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await prisma.service.deleteMany({ where: { id: serviceId } });
    // Users stay: audit_logs has a foreign key to users with ON DELETE SET NULL,
    // which would change rows already hashed into the audit chain.
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("counts today's visits, and which are still to come", async () => {
    const before = (globalThis as { __attnBefore?: Attention }).__attnBefore!;
    await visit(ukToday, 10 * 60, "confirmed");
    await visit(ukToday, 11 * 60, "completed");
    const after = (await read()).body;
    expect(after.visitsToday).toBeGreaterThanOrEqual(before.visitsToday + 2);
    expect(after.visitsLeftToday).toBeGreaterThanOrEqual(before.visitsLeftToday + 1);

    // A cancelled visit today and a confirmed one yesterday are not today's work.
    await visit(ukToday, 12 * 60, "cancelled");
    await visit(ukYesterday, 12 * 60, "confirmed");
    const later = (await read()).body;
    expect(later.visitsToday - after.visitsToday).toBeLessThan(2);
    expect(later.visitsLeftToday - after.visitsLeftToday).toBeLessThan(2);
  });

  it("counts threads waiting for staff, and erasure requests, with those past their month apart", async () => {
    const before = (await read()).body;
    const thread = await prisma.messageThread.create({
      data: { patientUserId, senderName: "Synthetic", subject: `Synthetic subject ${tag}`, preview: "Synthetic preview", staffUnread: true },
    });
    threadIds.push(thread.id);
    const day = 24 * 3600_000;
    for (const request of [
      { status: "pending" as const, dueAt: new Date(Date.now() - 2 * day) },
      { status: "pending" as const, dueAt: new Date(Date.now() + 20 * day) },
      { status: "completed" as const, dueAt: new Date(Date.now() - 5 * day) },
    ]) {
      const row = await prisma.erasureRequest.create({ data: { userId: patientUserId, source: "app", ...request } });
      erasureIds.push(row.id);
    }
    const after = (await read()).body;
    expect(after.unreadThreads).toBeGreaterThanOrEqual(before.unreadThreads + 1);
    expect(after.erasureOpen).toBeGreaterThanOrEqual(before.erasureOpen + 2);
    expect(after.erasureOverdue).toBeGreaterThanOrEqual(before.erasureOverdue + 1);
    // The completed overdue one and the not-yet-due one aren't overdue.
    expect(after.erasureOverdue - before.erasureOverdue).toBeLessThan(3);
  });

  it("counts failed card payments, failed van deposit releases and vans out", async () => {
    const before = (await read()).body;
    await createAuditLogWithIntegrity({
      action: "stripe.payment_intent.payment_failed.appointment",
      resourceId: `synthetic-${tag}`,
      metadata: { synthetic: true },
    });
    const request = await prisma.vanServiceRequest.create({
      data: {
        shiftId: shiftIds[0],
        vanId: vanIds[0],
        patientId: profileId,
        serviceId,
        status: "cancelled",
        depositReleaseStatus: "failed",
        patientLat: 51.5,
        patientLng: -0.12,
        accessDetails: {},
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    requestIds.push(request.id);
    const after = (await read()).body;
    expect(after.cardFailuresLastWeek).toBeGreaterThanOrEqual(before.cardFailuresLastWeek + 1);
    expect(after.depositReleaseFailures).toBeGreaterThanOrEqual(before.depositReleaseFailures + 1);
    // The shift made in beforeAll is live, so it was already in the first reading.
    expect(after.vansOut).toBeGreaterThanOrEqual(1);
  });

  it("is counts only: no names, message text or ids", async () => {
    const res = await read();
    // The server adds requestId and timestamp to every JSON response.
    const keys = Object.keys(res.body).filter((key) => key !== "requestId" && key !== "timestamp");
    expect(keys.sort()).toEqual([
      "asOf",
      "cardFailuresLastWeek",
      "depositReleaseFailures",
      "erasureOpen",
      "erasureOverdue",
      "unreadThreads",
      "vansOut",
      "visitsLeftToday",
      "visitsToday",
    ]);
    for (const secret of [`Attention${tag}`, `Synthetic subject ${tag}`, "Synthetic preview", tag]) {
      expect(res.text).not.toContain(secret);
    }
  });

  it("is for staff only", async () => {
    expect((await read(patientToken)).status).toBe(403);
    expect((await read(clinicianToken)).status).toBe(403);
    expect((await fetch(`${baseUrl}/api/admin/attention`)).status).toBe(401);
  });
});
