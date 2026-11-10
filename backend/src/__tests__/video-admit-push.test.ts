import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import * as patientPush from "../lib/patient-push";
import { uniqueGdc } from "../../test/unique-gdc";

describe("Admitting a patient tells their phone, once (V4)", () => {
  let server: http.Server;
  let baseUrl: string;
  let pushSpy: jest.SpyInstance;
  const tag = crypto.randomUUID().slice(0, 8);
  let clinicianToken = "";
  let appointmentId = "";
  let patientProfileId = "";
  let clinicianProfileId = "";

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;
    pushSpy = jest.spyOn(patientPush, "sendPatientNotification").mockResolvedValue(undefined as never);

    const patientUser = await prisma.user.create({
      data: { email: `ap-patient-${tag}@example.test`, passwordHash: "x", role: "patient" },
    });
    const patient = await prisma.patientProfile.create({
      data: { userId: patientUser.id, firstName: "Pia", lastName: "Push", dob: new Date("1995-05-15"), gender: "female", postcode: "W1D 3QU" },
    });
    patientProfileId = patient.id;
    const clinicianUser = await prisma.user.create({
      data: { email: `ap-clinician-${tag}@example.test`, passwordHash: "x", role: "clinician" },
    });
    const clinician = await prisma.clinicianProfile.create({
      data: { userId: clinicianUser.id, fullName: "Dr. Push", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    clinicianProfileId = clinician.id;
    const service = await prisma.service.findFirstOrThrow();
    // A month back, so suites that count today's visits never see it.
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const appt = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        clinicianId: clinician.id,
        serviceId: service.id,
        channel: "video",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 30 * 60 * 1000),
        status: "confirmed",
        totalPricePence: service.pricePence,
        depositPaidPence: 0,
      },
    });
    appointmentId = appt.id;
    clinicianToken = signAccessToken({ sub: clinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    pushSpy.mockRestore();
    await prisma.appointment.deleteMany({ where: { id: appointmentId } });
    await prisma.patientProfile.deleteMany({ where: { id: patientProfileId } });
    await prisma.clinicianProfile.deleteMany({ where: { id: clinicianProfileId } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  const admit = () =>
    fetch(`${baseUrl}/api/video/admit-patient`, {
      method: "POST",
      headers: { Authorization: `Bearer ${clinicianToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId }),
    });

  it("sends one neutral push the first time, and none on a repeat", async () => {
    expect((await admit()).status).toBe(200);
    expect(pushSpy).toHaveBeenCalledTimes(1);
    const [patientId, title, body, data] = pushSpy.mock.calls[0];
    expect(patientId).toBe(patientProfileId);
    expect(title).toBe("Your clinician is ready");
    expect(String(body)).not.toMatch(/dentist|pain|tooth|triage/i);
    expect(data).toEqual({ appointmentId });

    expect((await admit()).status).toBe(200);
    expect(pushSpy).toHaveBeenCalledTimes(1);
  });
});
