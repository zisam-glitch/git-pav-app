import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { decryptField } from "../lib/encryption";
import { uniqueGdc } from "../../test/unique-gdc";

describe("Triage answers are saved as a draft (V31)", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  let patientToken = "";
  let otherToken = "";
  let appointmentId = "";

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;

    const pu = await prisma.user.create({ data: { email: `td-pat-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    const ou = await prisma.user.create({ data: { email: `td-other-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    const cu = await prisma.user.create({ data: { email: `td-clin-${tag}@example.test`, passwordHash: "x", role: "clinician" } });
    const patient = await prisma.patientProfile.create({
      data: { userId: pu.id, firstName: "Dee", lastName: "Draft", dob: new Date("1995-05-15"), gender: "female", postcode: "W1D 3QU" },
    });
    await prisma.patientProfile.create({ data: { userId: ou.id, firstName: "Oz", lastName: "Other" } });
    const clinician = await prisma.clinicianProfile.create({ data: { userId: cu.id, fullName: "Dr. Draft", gdcNumber: uniqueGdc(), roleTitle: "Dentist" } });
    const service = await prisma.service.findFirstOrThrow();
    const start = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000);
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
    patientToken = signAccessToken({ sub: pu.id, role: "patient", sessionId: crypto.randomUUID() });
    otherToken = signAccessToken({ sub: ou.id, role: "patient", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  const call = (method: string, token: string, path: string, body?: unknown) =>
    fetch(`${baseUrl}/api/video/${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

  it("has no draft at first, then keeps what was saved and merges later steps", async () => {
    const none = (await (await call("GET", patientToken, `triage-draft/${appointmentId}`)).json()) as { draft: unknown };
    expect(none.draft).toBeNull();

    expect((await call("PUT", patientToken, `triage-draft/${appointmentId}`, { symptomText: "Toothache", painLevel: 4 })).status).toBe(200);
    expect((await call("PUT", patientToken, `triage-draft/${appointmentId}`, { duration: "1 to 2 days" })).status).toBe(200);

    const saved = (await (await call("GET", patientToken, `triage-draft/${appointmentId}`)).json()) as { draft: Record<string, unknown> };
    expect(saved.draft).toMatchObject({ symptomText: "Toothache", painLevel: 4, duration: "1 to 2 days" });

    // Encrypted at rest.
    const row = await prisma.appointment.findUniqueOrThrow({ where: { id: appointmentId } });
    expect(JSON.stringify(row.triageData)).not.toContain("Toothache");
    expect(((await decryptField<Record<string, any>>(row.triageData)) ?? {}).draft.symptomText).toBe("Toothache"); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  it("belongs to the patient alone", async () => {
    expect((await call("GET", otherToken, `triage-draft/${appointmentId}`)).status).toBe(404);
    expect((await call("PUT", otherToken, `triage-draft/${appointmentId}`, { symptomText: "x" })).status).toBe(404);
  });

  it("rejects unknown fields and out-of-range pain", async () => {
    expect((await call("PUT", patientToken, `triage-draft/${appointmentId}`, { painLevel: 11 })).status).toBe(400);
    expect((await call("PUT", patientToken, `triage-draft/${appointmentId}`, { bogus: true })).status).toBe(400);
  });

  it("is removed once the real answers are submitted", async () => {
    const submit = await call("POST", patientToken, "submit-triage", { appointmentId, chiefComplaint: "Toothache", painLevel: 4 });
    expect(submit.status).toBe(200);
    const after = (await (await call("GET", patientToken, `triage-draft/${appointmentId}`)).json()) as { draft: unknown };
    expect(after.draft).toBeNull();
  });
});
