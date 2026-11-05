import http from "http";
import crypto from "crypto";
import { uniqueGdc } from "../../test/unique-gdc";

// GET /api/booking/appointments/:id/clinical-context feeds the prescribing
// screen (MC-1): only the appointment's own clinician may read the patient's
// recorded allergies, and the read is audited. Synthetic data only.
describe("GET /api/booking/appointments/:id/clinical-context", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const ids = { users: [] as string[], appointment: "", patientProfile: "" };
  let ownToken = "";
  let otherToken = "";
  let patientToken = "";

  async function makeUser(role: "patient" | "clinician", label: string) {
    const user = await prisma.user.create({
      data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role },
    });
    ids.users.push(user.id);
    return user;
  }

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3005, resolve));
    baseUrl = "http://localhost:3005";

    const patientUser = await makeUser("patient", "ctx-patient");
    const patient = await prisma.patientProfile.create({
      data: {
        userId: patientUser.id,
        firstName: "Synthetic",
        lastName: "Patient",
        medicalHistory: { hasAllergies: true, allergies: ["Test-allergen"] },
      },
    });
    ids.patientProfile = patient.id;

    const own = await makeUser("clinician", "ctx-own");
    const other = await makeUser("clinician", "ctx-other");
    const gdc = () => uniqueGdc();
    const ownProfile = await prisma.clinicianProfile.create({
      data: { userId: own.id, fullName: "Own Clinician", gdcNumber: gdc(), roleTitle: "Dentist" },
    });
    await prisma.clinicianProfile.create({
      data: { userId: other.id, fullName: "Other Clinician", gdcNumber: gdc(), roleTitle: "Dentist" },
    });
    const service = await prisma.service.findFirstOrThrow();
    const start = new Date(Date.now() + 86400000);
    const appt = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        clinicianId: ownProfile.id,
        serviceId: service.id,
        channel: "clinic",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 1800000),
        status: "confirmed",
        totalPricePence: 0,
        depositPaidPence: 0,
      },
    });
    ids.appointment = appt.id;

    ownToken = signAccessToken({ sub: own.id, role: "clinician", sessionId: crypto.randomUUID() });
    otherToken = signAccessToken({ sub: other.id, role: "clinician", sessionId: crypto.randomUUID() });
    patientToken = signAccessToken({ sub: patientUser.id, role: "patient", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    if (ids.appointment) await prisma.appointment.deleteMany({ where: { id: ids.appointment } });
    if (ids.users.length) await prisma.clinicianProfile.deleteMany({ where: { userId: { in: ids.users } } });
    if (ids.patientProfile) await prisma.patientProfile.deleteMany({ where: { id: ids.patientProfile } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const get = (token: string) =>
    fetch(`${baseUrl}/api/booking/appointments/${ids.appointment}/clinical-context`, {
      headers: { Authorization: `Bearer ${token}` },
    });

  it("returns the patient and their recorded allergies to the appointment's clinician", async () => {
    const res = await get(ownToken);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.patient.firstName).toBe("Synthetic");
    expect(body.medicalHistory.allergies).toEqual(["Test-allergen"]);

    const audit = await prisma.auditLog.findFirst({
      where: { action: "clinical_record.read.appointment_context", resourceId: ids.patientProfile },
    });
    expect(audit).not.toBeNull();
  });

  it("hides the appointment from other clinicians", async () => {
    expect((await get(otherToken)).status).toBe(404);
  });

  it("is not available to patients", async () => {
    expect((await get(patientToken)).status).toBe(403);
  });
});
