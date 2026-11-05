import http from "http";
import crypto from "crypto";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-08 (decisions log #10): a clinician reads a patient's record, messages
// and prescriptions only with a booked or recent visit, up to 12 months after
// the last one. Synthetic data only.
describe("clinician access window", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const appointmentIds: string[] = [];
  let serviceId = "";

  const MONTH = 30 * 86400000;

  async function makeUser(role: "patient" | "clinician", label: string) {
    const user = await prisma.user.create({
      data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role },
    });
    userIds.push(user.id);
    const token = signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() });
    return { user, token };
  }

  async function makePatient(label: string) {
    const { user, token } = await makeUser("patient", label);
    const profile = await prisma.patientProfile.create({
      data: { userId: user.id, firstName: "Synthetic", lastName: "Patient" },
    });
    return { userId: user.id, profileId: profile.id, token };
  }

  async function makeClinician(label: string) {
    const { user, token } = await makeUser("clinician", label);
    const profile = await prisma.clinicianProfile.create({
      data: {
        userId: user.id,
        fullName: "Synthetic Clinician",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    return { profileId: profile.id, token };
  }

  async function visit(patientId: string, clinicianId: string, startOffsetMs: number, status: "completed" | "cancelled" | "confirmed") {
    const start = new Date(Date.now() + startOffsetMs);
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        clinicianId,
        serviceId,
        channel: "clinic",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 1800000),
        status,
        totalPricePence: 0,
        depositPaidPence: 0,
      },
    });
    appointmentIds.push(appt.id);
    return appt.id;
  }

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3010, resolve));
    baseUrl = "http://localhost:3010";
    serviceId = (await prisma.service.findFirstOrThrow()).id;
  });

  afterAll(async () => {
    await prisma.prescription.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.messageThread.deleteMany({ where: { patientUserId: { in: userIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { userId: { in: userIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const get = (path: string, token: string) =>
    fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });

  it("allows a clinician with a visit in the last 12 months", async () => {
    const patient = await makePatient("recent-patient");
    const clinician = await makeClinician("recent-clinician");
    await visit(patient.profileId, clinician.profileId, -11 * MONTH, "completed");
    expect((await get(`/api/patients/${patient.profileId}/plans`, clinician.token)).status).toBe(200);
    expect((await get(`/api/prescriptions/patient/${patient.userId}`, clinician.token)).status).toBe(200);
  });

  it("allows a clinician with an upcoming visit", async () => {
    const patient = await makePatient("upcoming-patient");
    const clinician = await makeClinician("upcoming-clinician");
    await visit(patient.profileId, clinician.profileId, 7 * 86400000, "confirmed");
    expect((await get(`/api/patients/${patient.profileId}/plans`, clinician.token)).status).toBe(200);
  });

  it("refuses once the last visit is more than 12 months ago", async () => {
    const patient = await makePatient("lapsed-patient");
    const clinician = await makeClinician("lapsed-clinician");
    await visit(patient.profileId, clinician.profileId, -13 * MONTH, "completed");
    expect((await get(`/api/patients/${patient.profileId}/plans`, clinician.token)).status).toBe(403);
    expect((await get(`/api/prescriptions/patient/${patient.userId}`, clinician.token)).status).toBe(403);
  });

  it("does not count a cancelled booking as care", async () => {
    const patient = await makePatient("cancelled-patient");
    const clinician = await makeClinician("cancelled-clinician");
    await visit(patient.profileId, clinician.profileId, -1 * MONTH, "cancelled");
    expect((await get(`/api/patients/${patient.profileId}/plans`, clinician.token)).status).toBe(403);
  });

  it("refuses prescriptions for another clinician's appointment", async () => {
    const patient = await makePatient("rx-patient");
    const own = await makeClinician("rx-own");
    const other = await makeClinician("rx-other");
    const appointmentId = await visit(patient.profileId, own.profileId, -1 * MONTH, "completed");
    const prescribe = (token: string) =>
      fetch(`${baseUrl}/api/prescriptions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          medicationName: "Synthetic medicine",
          dosageInstructions: "Synthetic dose",
          dispensingPharmacy: "Synthetic pharmacy",
        }),
      });
    expect((await prescribe(other.token)).status).toBe(404);
    expect((await prescribe(own.token)).status).toBe(201);
    expect((await get(`/api/prescriptions/patient/${patient.userId}`, other.token)).status).toBe(403);
  });

  it("shows a clinician only the messages of patients in their care", async () => {
    const mine = await makePatient("msg-mine");
    const notMine = await makePatient("msg-not-mine");
    const clinician = await makeClinician("msg-clinician");
    await visit(mine.profileId, clinician.profileId, -1 * MONTH, "completed");
    const thread = (patientUserId: string) =>
      prisma.messageThread.create({
        data: {
          patientUserId,
          senderName: "Pav Dental Clinical Team",
          subject: "Synthetic",
          preview: "synthetic",
          messages: { create: [{ senderRole: "patient", senderName: "You", body: "synthetic" }] },
        },
      });
    const mineThread = await thread(mine.userId);
    const otherThread = await thread(notMine.userId);

    const list = (await (await get("/api/messages", clinician.token)).json()) as any[];
    const ids = list.map((t) => t.id);
    expect(ids).toContain(mineThread.id);
    expect(ids).not.toContain(otherThread.id);

    const reply = await fetch(`${baseUrl}/api/messages/${otherThread.id}/reply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${clinician.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Synthetic reply" }),
    });
    expect(reply.status).toBe(404);
  });
});
