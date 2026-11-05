import http from "http";
import crypto from "crypto";
import { readFileSync } from "fs";
import { z } from "zod";
import { clinicSchema, clinicianSchema, holdSlotResponseSchema, serviceSchema, slotSchema } from "../contracts/app-api";
import { APP_CONTRACT_PATH, renderAppContract } from "../contracts/app-contract-file";
import { londonDate, weekdayOf } from "../lib/availability";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import app from "../server";
import { uniqueGdc } from "../../test/unique-gdc";

// QA-07: the API sends what the app's types say it sends. Each response is
// parsed with the contract schema the app's types are generated from.
// Synthetic data only.
describe("app API contract", () => {
  let server: http.Server;
  let baseUrl: string;
  let token = "";
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  let clinicId = "";

  const get = async (path: string) => {
    const res = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    return res.json() as Promise<unknown>;
  };

  /** Parses, and on failure names the field that drifted. */
  function expectShape<T extends z.ZodTypeAny>(schema: T, value: unknown) {
    const result = schema.safeParse(value);
    if (!result.success) throw new Error(`Contract drift: ${JSON.stringify(result.error.issues, null, 2)}`);
  }

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3029, resolve));
    baseUrl = "http://localhost:3029";

    const patient = await prisma.user.create({ data: { email: `contract-patient-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    userIds.push(patient.id);
    await prisma.patientProfile.create({ data: { userId: patient.id, firstName: "Synthetic", lastName: "Patient" } });
    token = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });

    const clinic = await prisma.clinic.create({
      data: { name: `Synthetic Clinic ${tag}`, address: "1 Example Street", postcode: "ZZ1 1ZZ", city: "Testville", phone: "000", operatingHours: "Test hours" },
    });
    clinicId = clinic.id;
    await prisma.clinicOpeningHours.create({ data: { clinicId, weekday: 1, opensMinute: 540, closesMinute: 1050 } });
    await prisma.clinicClosure.create({ data: { clinicId, date: new Date(Date.now() + 20 * 86400000), reason: null } });
  });

  afterAll(async () => {
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.clinic.deleteMany({ where: { id: clinicId } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("keeps the app's generated types in step with the schemas", () => {
    // If this fails, run `npm run contract:app` in backend/ and commit the result.
    expect(readFileSync(APP_CONTRACT_PATH, "utf8")).toBe(renderAppContract());
  });

  it("matches the catalogue responses", async () => {
    const services = await get("/api/services");
    expect(Array.isArray(services) && services.length).toBeTruthy();
    expectShape(z.array(serviceSchema), services);

    const clinics = (await get("/api/services/clinics")) as { id: string }[];
    const ours = clinics.find((c) => c.id === clinicId);
    expect(ours).toMatchObject({ openingHours: [expect.anything()], closures: [expect.anything()] });
    expectShape(z.array(clinicSchema), clinics);

    const clinicians = await get("/api/services/clinicians");
    expectShape(z.array(clinicianSchema), clinicians);
  });

  it("matches the slot and hold responses", async () => {
    const clinician = await prisma.user.create({ data: { email: `contract-dentist-${tag}@example.test`, passwordHash: "x", role: "clinician" } });
    userIds.push(clinician.id);
    const profile = await prisma.clinicianProfile.create({
      data: { userId: clinician.id, fullName: "Dr Synthetic Contract", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    let date = "";
    for (let d = 3; d < 10 && !date; d++) {
      const candidate = londonDate(new Date(Date.now() + d * 86400000));
      if (weekdayOf(candidate) === 2) date = candidate;
    }
    await prisma.clinicianRotaBlock.create({ data: { clinicianId: profile.id, weekday: 2, startMinute: 540, endMinute: 600 } });

    const slots = (await get(`/api/booking/slots?date=${date}&channel=video&clinicianId=${profile.id}`)) as { id: string }[];
    expect(slots.length).toBeGreaterThan(0);
    expectShape(z.array(slotSchema), slots);

    const hold = await fetch(`${baseUrl}/api/booking/hold-slot`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slots[0].id }),
    });
    expect(hold.status).toBe(200);
    expectShape(holdSlotResponseSchema, await hold.json());
  });
});
