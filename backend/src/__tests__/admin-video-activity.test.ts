import http from "http";
import crypto from "crypto";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { encryptField } from "../lib/encryption";
import app from "../server";

// V41: staff can see, for one video visit, whether the call took place and which
// notices went to the patient. Synthetic data only.
describe("admin: video visit activity", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  let serviceId = "";
  let adminToken = "";
  let patientToken = "";
  let patientUserId = "";
  let videoId = "";
  let clinicId = "";

  const get = (path: string, token = adminToken) =>
    fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(async (r) => ({
      status: r.status,
      body: (await r.json()) as Record<string, any>,
    }));

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;

    const admin = await prisma.user.create({ data: { email: `va-admin-${tag}@example.test`, passwordHash: "x", role: "admin" } });
    const patient = await prisma.user.create({ data: { email: `va-patient-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    userIds.push(admin.id, patient.id);
    patientUserId = patient.id;
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });
    const profile = await prisma.patientProfile.create({ data: { userId: patient.id, firstName: "Vera", lastName: `Activity${tag}` } });

    serviceId = `srv_va_${tag}`;
    await prisma.service.create({
      data: { id: serviceId, name: `Synthetic activity ${tag}`, category: "checkup", description: "Synthetic.", durationMinutes: 30, pricePence: 5000, depositPence: 0, supportedChannels: ["video", "clinic"] },
    });

    const start = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60000);
    const waiting = new Date(start.getTime() - 2 * 60000);
    const triage = await encryptField({
      admittedAt: new Date(start.getTime() + 3 * 60000).toISOString(),
      completedAt: end.toISOString(),
      symptoms: "private answers",
    });
    const video = await prisma.appointment.create({
      data: {
        patientId: profile.id, serviceId, channel: "video", startTimeUtc: start, endTimeUtc: end,
        status: "completed", totalPricePence: 5000, patientWaitingSince: waiting, triageData: triage as never,
      },
    });
    videoId = video.id;

    await prisma.notificationHistory.create({
      data: { userId: patient.id, type: "push", title: "Booking confirmed", body: "x", data: { type: "appointment_confirmed", appointmentId: video.id } },
    });
    await prisma.scheduledNotification.create({
      data: {
        userId: patient.id, title: "Video consultation in 1 hour", body: "x", data: { appointmentId: video.id },
        scheduledFor: new Date(start.getTime() - 60 * 60000), sentAt: new Date(start.getTime() - 60 * 60000), status: "sent",
      },
    });
    // A notice about some other visit must not appear.
    await prisma.notificationHistory.create({
      data: { userId: patient.id, type: "push", title: "Other visit", body: "x", data: { appointmentId: crypto.randomUUID() } },
    });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { serviceId } });
    await prisma.notificationHistory.deleteMany({ where: { userId: patientUserId } });
    await prisma.scheduledNotification.deleteMany({ where: { userId: patientUserId } });
    await prisma.service.deleteMany({ where: { id: serviceId } });
    await prisma.patientProfile.deleteMany({ where: { userId: { in: userIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("shows the call outcome, the wait and the notices for that visit only", async () => {
    const res = await get(`/api/admin/appointments/${videoId}/video-activity`);
    expect(res.status).toBe(200);
    expect(res.body.call.outcome).toBe("took_place");
    expect(res.body.call.waitedMinutes).toBe(5);
    const titles = (res.body.notices as { title: string }[]).map((n) => n.title);
    expect([...titles].sort()).toEqual(["Booking confirmed", "Video consultation in 1 hour"]);
    expect(res.body.conversation).toBeNull();
  });

  it("carries no triage answers", async () => {
    const res = await get(`/api/admin/appointments/${videoId}/video-activity`);
    expect(JSON.stringify(res.body)).not.toContain("private answers");
  });

  it("is for staff only", async () => {
    expect((await get(`/api/admin/appointments/${videoId}/video-activity`, patientToken)).status).toBe(403);
  });

  it("says no for a visit that is not video, or does not exist", async () => {
    const clinic = await prisma.clinic.findFirst({ select: { id: true } });
    clinicId = clinic?.id ?? "";
    if (clinicId) {
      const profile = await prisma.patientProfile.findFirstOrThrow({ where: { userId: patientUserId } });
      const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const inClinic = await prisma.appointment.create({
        data: { patientId: profile.id, serviceId, channel: "clinic", clinicId, startTimeUtc: start, endTimeUtc: new Date(start.getTime() + 30 * 60000), status: "confirmed", totalPricePence: 5000 },
      });
      expect((await get(`/api/admin/appointments/${inClinic.id}/video-activity`)).status).toBe(409);
    }
    expect((await get(`/api/admin/appointments/${crypto.randomUUID()}/video-activity`)).status).toBe(404);
  });
});
