import http from "http";
import crypto from "crypto";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { uniqueGdc } from "../../test/unique-gdc";
import app from "../server";
import { VIDEO_QUEUE_LIMIT } from "../routes/video";

// B10: a malformed id is a 400, not a database error and a 500.
// B11: the clinician's video queue is bounded.
// B13: no invented clinician title when nobody is assigned.
// Synthetic data only.
describe("video status, summary and queue", () => {
  jest.setTimeout(30_000);

  let server: http.Server;
  let baseUrl = "";
  let patientToken = "";
  let clinicianToken = "";
  let patientProfileId = "";
  let clinicianProfileId = "";
  let serviceId = "";
  const tag = crypto.randomUUID().slice(0, 8);
  const appointmentIds: string[] = [];

  const get = <T = { clinicianName?: string | null }>(path: string, token: string) =>
    fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(async (r) => ({
      status: r.status,
      body: (await r.json()) as T,
    }));

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3039, resolve));
    baseUrl = "http://localhost:3039";

    const [patient, doctor] = await Promise.all(
      (["patient", "clinician"] as const).map((role) =>
        prisma.user.create({ data: { email: `video-q-${role}-${tag}@example.test`, passwordHash: "x", role } }),
      ),
    );
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });
    clinicianToken = signAccessToken({ sub: doctor.id, role: "clinician", sessionId: crypto.randomUUID() });
    patientProfileId = (await prisma.patientProfile.create({ data: { userId: patient.id, firstName: "Synthetic", lastName: `Video${tag}` } })).id;
    clinicianProfileId = (
      await prisma.clinicianProfile.create({ data: { userId: doctor.id, fullName: "Synthetic Video Dentist", gdcNumber: uniqueGdc(), roleTitle: "Dentist" } })
    ).id;
    serviceId = (await prisma.service.findFirstOrThrow({ where: { supportedChannels: { has: "video" } } })).id;
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { id: clinicianProfileId } });
    await prisma.patientProfile.deleteMany({ where: { id: patientProfileId } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function videoVisit(start: Date, clinicianId: string | null) {
    const a = await prisma.appointment.create({
      data: {
        patientId: patientProfileId,
        clinicianId,
        serviceId,
        channel: "video",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 15 * 60000),
        status: "confirmed",
        totalPricePence: 0,
        depositPaidPence: 0,
      },
    });
    appointmentIds.push(a.id);
    return a;
  }

  it("answers 400 for a malformed id on status and summary", async () => {
    for (const path of ["/api/video/status/not-a-uuid", "/api/video/summary/not-a-uuid"]) {
      const res = await get(path, patientToken);
      expect(res.status).toBe(400);
    }
  });

  it("gives no invented clinician name when nobody is assigned yet", async () => {
    const unassigned = await videoVisit(new Date(Date.now() + 30 * 86400000), null);
    const status = await get(`/api/video/status/${unassigned.id}`, patientToken);
    expect(status.status).toBe(200);
    expect(status.body.clinicianName).toBeNull();
    const summary = await get(`/api/video/summary/${unassigned.id}`, patientToken);
    expect(summary.status).toBe(200);
    expect(summary.body.clinicianName).toBeNull();
  });

  it("returns at most VIDEO_QUEUE_LIMIT visits, soonest first", async () => {
    const base = Date.now() + 2 * 86400000;
    for (let i = 0; i < VIDEO_QUEUE_LIMIT + 2; i++) {
      await videoVisit(new Date(base + i * 20 * 60000), clinicianProfileId);
    }
    const res = await get<Array<{ startTimeUtc: string }>>("/api/video/clinician-queue", clinicianToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(VIDEO_QUEUE_LIMIT);
    const starts = res.body.map((a) => Date.parse(a.startTimeUtc));
    expect([...starts].sort((x, y) => x - y)).toEqual(starts);
    expect(starts[0]).toBe(base);
  });
});
