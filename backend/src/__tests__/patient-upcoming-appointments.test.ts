import http from "http";
import crypto from "crypto";
import type { AddressInfo } from "net";
import type { AppointmentStatus } from "@prisma/client";
import app from "../server";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";

// The app's Home screen asks for ?scope=upcoming. The route used to ignore it,
// so a cancelled visit could show as the patient's next one.
describe("GET /api/booking/appointments?scope=upcoming (patient)", () => {
  let server: http.Server;
  let baseUrl: string;
  let token = "";
  let patientUserId = "";
  let clinicianUserId = "";
  let patientProfileId = "";
  let clinicianProfileId = "";
  const tag = crypto.randomUUID().slice(0, 8);
  const appointmentIds: Record<string, string> = {};

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;

    const patientUser = await prisma.user.create({
      data: { email: `upcoming-pt-${tag}@example.test`, passwordHash: "mock-hash", role: "patient" },
    });
    patientUserId = patientUser.id;
    const patientProfile = await prisma.patientProfile.create({
      data: {
        userId: patientUser.id,
        firstName: "Upcoming",
        lastName: "Patient",
        dob: new Date("1992-04-10"),
        gender: "male",
        postcode: "W1D 3QU",
      },
    });
    patientProfileId = patientProfile.id;

    const clinicianUser = await prisma.user.create({
      data: { email: `upcoming-dr-${tag}@example.test`, passwordHash: "mock-hash", role: "clinician" },
    });
    clinicianUserId = clinicianUser.id;
    const clinicianProfile = await prisma.clinicianProfile.create({
      data: {
        userId: clinicianUser.id,
        fullName: "Dr. Upcoming Test",
        gdcNumber: String(830000 + crypto.randomInt(1, 99999)),
        roleTitle: "Dentist",
      },
    });
    clinicianProfileId = clinicianProfile.id;

    const service = await prisma.service.findFirstOrThrow();
    token = signAccessToken({ sub: patientUser.id, role: "patient", sessionId: crypto.randomUUID() });

    const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
    const seed = async (name: string, startTimeUtc: Date, status: AppointmentStatus) => {
      const row = await prisma.appointment.create({
        data: {
          patientId: patientProfile.id,
          clinicianId: clinicianProfile.id,
          serviceId: service.id,
          channel: "clinic",
          startTimeUtc,
          endTimeUtc: new Date(startTimeUtc.getTime() + 30 * 60 * 1000),
          status,
          totalPricePence: service.pricePence,
          depositPaidPence: 2000,
        },
      });
      appointmentIds[name] = row.id;
    };

    await seed("later", days(10), "confirmed");
    await seed("soonest", days(5), "confirmed");
    await seed("cancelled", days(2), "cancelled");
    await seed("hold", days(3), "draft_hold");
    await seed("past", days(-2), "confirmed");
    await seed("underWay", days(-1), "in_progress");
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { patientId: patientProfileId } });
    await prisma.patientProfile.deleteMany({ where: { id: patientProfileId } });
    await prisma.clinicianProfile.deleteMany({ where: { id: clinicianProfileId } });
    await prisma.user.deleteMany({ where: { id: { in: [patientUserId, clinicianUserId] } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const list = async (query: string) => {
    const res = await fetch(`${baseUrl}/api/booking/appointments${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    return ((await res.json()) as Array<{ id: string }>).map((a) => a.id);
  };

  it("returns only visits still to come, soonest first", async () => {
    expect(await list("?scope=upcoming")).toEqual([
      appointmentIds.underWay,
      appointmentIds.soonest,
      appointmentIds.later,
    ]);
  });

  it("still returns everything, newest first, without a scope", async () => {
    const all = await list("");
    expect(all).toHaveLength(6);
    expect(all[0]).toBe(appointmentIds.later);
    expect(all).toContain(appointmentIds.cancelled);
  });
});
