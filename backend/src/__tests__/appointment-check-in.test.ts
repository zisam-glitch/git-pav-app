import http from "http";
import crypto from "crypto";
import { uniqueGdc } from "../../test/unique-gdc";

// POST /api/booking/appointments/:id/check-in records only the pre-visit tasks
// the patient actually ticked (BK-7): nothing defaults to done. Synthetic data only.
describe("POST /api/booking/appointments/:id/check-in", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  const tag = crypto.randomUUID().slice(0, 8);
  const ids = { users: [] as string[], patientProfile: "", appointments: [] as string[] };
  let token = "";
  let clinicianId = "";
  let serviceId = "";

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    const { signAccessToken } = require("../lib/jwt");
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3006, resolve));
    baseUrl = "http://localhost:3006";

    const patientUser = await prisma.user.create({
      data: { email: `checkin-patient-${tag}@example.test`, passwordHash: "x", role: "patient" },
    });
    const clinicianUser = await prisma.user.create({
      data: { email: `checkin-clinician-${tag}@example.test`, passwordHash: "x", role: "clinician" },
    });
    ids.users.push(patientUser.id, clinicianUser.id);
    const patient = await prisma.patientProfile.create({
      data: { userId: patientUser.id, firstName: "Synthetic", lastName: "Patient" },
    });
    ids.patientProfile = patient.id;
    const clinician = await prisma.clinicianProfile.create({
      data: {
        userId: clinicianUser.id,
        fullName: "Synthetic Clinician",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    clinicianId = clinician.id;
    serviceId = (await prisma.service.findFirstOrThrow()).id;
    token = signAccessToken({ sub: patientUser.id, role: "patient", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { id: { in: ids.appointments } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: ids.users } } });
    await prisma.patientProfile.deleteMany({ where: { id: ids.patientProfile } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // Each fixture gets its own half hour: one clinician can't have two live
  // appointments at once (CS-16).
  let fixtureSlot = 0;
  async function makeAppointment(
    status: "confirmed" | "cancelled" = "confirmed",
    offsetMs: number = 86400000
  ) {
    const start = new Date(Date.now() + offsetMs + fixtureSlot++ * 1800000);
    const appt = await prisma.appointment.create({
      data: {
        patientId: ids.patientProfile,
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
    ids.appointments.push(appt.id);
    return appt.id;
  }

  const checkIn = (id: string, body: unknown) =>
    fetch(`${baseUrl}/api/booking/appointments/${id}/check-in`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  const recordedTasks = async (id: string) => {
    const appt = await prisma.appointment.findUniqueOrThrow({ where: { id } });
    return (appt.accessDetails as { completedTasks?: string[] } | null)?.completedTasks;
  };

  it("records no tasks when the patient ticked none", async () => {
    const id = await makeAppointment();
    expect((await checkIn(id, {})).status).toBe(200);
    expect(await recordedTasks(id)).toEqual([]);
  });

  it("records only the tasks the patient ticked", async () => {
    const id = await makeAppointment();
    expect((await checkIn(id, { completedTasks: ["form", "consent"] })).status).toBe(200);
    expect(await recordedTasks(id)).toEqual(["form", "consent"]);
  });

  it("rejects unknown tasks and the old boolean payload", async () => {
    const id = await makeAppointment();
    expect((await checkIn(id, { completedTasks: ["xray"] })).status).toBe(400);
    expect((await checkIn(id, { medicalHistoryConfirmed: true })).status).toBe(400);
    expect(await recordedTasks(id)).toBeUndefined();
  });

  it("refuses to check in a cancelled appointment", async () => {
    const id = await makeAppointment("cancelled");
    expect((await checkIn(id, { completedTasks: ["form"] })).status).toBe(409);
  });

  it("refuses check-in when appointment is more than 48 hours in the future (BK-7)", async () => {
    const farFutureOffset = 5 * 24 * 60 * 60 * 1000; // 5 days ahead
    const id = await makeAppointment("confirmed", farFutureOffset);
    const res = await checkIn(id, { completedTasks: ["form"] });
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toContain("not yet open");
  });

  it("refuses check-in when appointment ended more than 2 hours ago (BK-7)", async () => {
    const pastOffset = -24 * 60 * 60 * 1000; // 24 hours ago
    const id = await makeAppointment("confirmed", pastOffset);
    const res = await checkIn(id, { completedTasks: ["form"] });
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toContain("closed");
  });
});
