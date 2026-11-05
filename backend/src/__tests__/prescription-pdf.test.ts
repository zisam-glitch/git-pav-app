import http from "http";
import crypto from "crypto";
import { prescriptionDownloadToken } from "../lib/prescription-document";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-35 (decisions log #4): prescriptions are private, signed PDFs. Nothing
// claims to be NHS EPS, the PDF is only reachable by the patient or a
// clinician in their care, and a tampered record is never served.
// Synthetic data only.
describe("signed prescription PDFs", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const profileIds: string[] = [];
  const appointmentIds: string[] = [];
  const dependantIds: string[] = [];
  let serviceId = "";

  async function makeUser(role: "patient" | "clinician", label: string) {
    const user = await prisma.user.create({ data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role } });
    userIds.push(user.id);
    return { userId: user.id, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  async function makePatient(label: string) {
    const { userId, token } = await makeUser("patient", label);
    const profile = await prisma.patientProfile.create({
      data: { userId, firstName: "Synthetic", lastName: "Patient", addressLine1: "1 Example Street", city: "Testville" },
    });
    profileIds.push(profile.id);
    return { userId, profileId: profile.id, token };
  }

  async function makeClinician(label: string) {
    const { userId, token } = await makeUser("clinician", label);
    const profile = await prisma.clinicianProfile.create({
      data: { userId, fullName: "Synthetic Dentist", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    return { profileId: profile.id, token };
  }

  async function visit(patientId: string, clinicianId: string, dependantId?: string) {
    const start = new Date(Date.now() - 86400000 - appointmentIds.length * 3600000);
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        clinicianId,
        dependantId,
        serviceId,
        channel: "clinic",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 1800000),
        status: "completed",
        totalPricePence: 0,
      },
    });
    appointmentIds.push(appt.id);
    return appt.id;
  }

  const send = (method: string, path: string, token?: string, body?: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  const issue = (token: string, appointmentId: string) =>
    send("POST", "/api/prescriptions", token, {
      appointmentId,
      medicationName: "Synthetic medicine 100mg",
      dosageInstructions: "Synthetic directions",
      dispensingPharmacy: "Synthetic pharmacy",
    }).then(async (r) => ({ status: r.status, body: (await r.json()) as any }));

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3013, resolve));
    baseUrl = "http://localhost:3013";
    serviceId = (await prisma.service.findFirstOrThrow()).id;
  });

  afterAll(async () => {
    await prisma.prescription.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.dependant.deleteMany({ where: { id: { in: dependantIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("issues a signed private prescription the patient can open as a PDF", async () => {
    const patient = await makePatient("rx-patient");
    const clinician = await makeClinician("rx-dentist");
    const appointmentId = await visit(patient.profileId, clinician.profileId);

    const issued = await issue(clinician.token, appointmentId);
    expect(issued.status).toBe(201);
    expect(issued.body.reference).toMatch(/^PAV-RX-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    expect(issued.body.status).toBe("ISSUED");
    expect(JSON.stringify(issued.body)).not.toMatch(/EPS/);

    const list = (await (await send("GET", `/api/prescriptions/patient/${patient.userId}`, patient.token)).json()) as any[];
    expect(list[0]).toMatchObject({ id: issued.body.id, reference: issued.body.reference, hasPdf: true });
    expect(list[0].signature).toBeUndefined();

    const link = (await (await send("POST", `/api/prescriptions/${issued.body.id}/pdf-link`, patient.token)).json()) as any;
    const pdf = await fetch(`${baseUrl}${link.path}`);
    expect(pdf.status).toBe(200);
    expect(pdf.headers.get("content-type")).toBe("application/pdf");
    expect(Buffer.from(await pdf.arrayBuffer()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("keeps the PDF from other patients and from stale or forged links", async () => {
    const patient = await makePatient("rx-owner");
    const other = await makePatient("rx-other");
    const clinician = await makeClinician("rx-dentist-2");
    const { body } = await issue(clinician.token, await visit(patient.profileId, clinician.profileId));

    expect((await send("POST", `/api/prescriptions/${body.id}/pdf-link`, other.token)).status).toBe(404);
    expect((await fetch(`${baseUrl}/api/prescription-files/${body.id}.pdf`)).status).toBe(404);
    const expired = prescriptionDownloadToken(body.id, Date.now() - 10 * 60 * 1000);
    expect((await fetch(`${baseUrl}/api/prescription-files/${body.id}.pdf?token=${encodeURIComponent(expired)}`)).status).toBe(404);
    const forged = `${Date.now() + 60000}.AAAA`;
    expect((await fetch(`${baseUrl}/api/prescription-files/${body.id}.pdf?token=${encodeURIComponent(forged)}`)).status).toBe(404);
  });

  it("refuses to serve a record that no longer matches its seal", async () => {
    const patient = await makePatient("rx-tamper");
    const clinician = await makeClinician("rx-dentist-3");
    const { body } = await issue(clinician.token, await visit(patient.profileId, clinician.profileId));
    const stored = await prisma.prescription.findUniqueOrThrow({ where: { id: body.id } });
    const content = stored.content as any;
    await prisma.prescription.update({
      where: { id: body.id },
      data: { content: { ...content, item: { ...content.item, directions: "Changed after issue" } } },
    });
    const token = prescriptionDownloadToken(body.id);
    expect((await fetch(`${baseUrl}/api/prescription-files/${body.id}.pdf?token=${encodeURIComponent(token)}`)).status).toBe(409);
  });

  it("names the child as the patient when a guardian booked for them", async () => {
    const guardian = await makePatient("rx-guardian");
    const clinician = await makeClinician("rx-dentist-4");
    // Seven years and a month ago: age 7 whatever today's date.
    const dobDate = new Date();
    dobDate.setUTCFullYear(dobDate.getUTCFullYear() - 7);
    dobDate.setUTCDate(dobDate.getUTCDate() - 30);
    const childDob = dobDate.toISOString().slice(0, 10);
    const child = await prisma.dependant.create({
      data: { guardianId: guardian.profileId, firstName: "Synthetic", lastName: "Child", dob: childDob, relationship: "Son", consentSigned: true },
    });
    dependantIds.push(child.id);
    const { body } = await issue(clinician.token, await visit(guardian.profileId, clinician.profileId, child.id));
    const stored = await prisma.prescription.findUniqueOrThrow({ where: { id: body.id } });
    expect(stored.content).toMatchObject({
      patient: { name: "Synthetic Child", dob: childDob, ageUnder12: 7 },
      guardian: { name: "Synthetic Patient" },
    });
  });

  it("enforces role and GDC registration validation when issuing prescriptions (RX-1)", async () => {
    const patient = await makePatient("rx-role-pat");
    const clinician = await makeClinician("rx-role-dentist");
    const apptId = await visit(patient.profileId, clinician.profileId);

    // Patient cannot issue prescriptions
    const patIssue = await issue(patient.token, apptId);
    expect(patIssue.status).toBe(403);

    // Clinician with non-prescribing role (e.g. Dental Hygienist) cannot issue prescriptions (CS-35)
    const hygienistUser = await prisma.user.create({
      data: { email: `hygienist-${tag}@example.test`, passwordHash: "x", role: "clinician" },
    });
    userIds.push(hygienistUser.id);
    await prisma.clinicianProfile.create({
      data: { userId: hygienistUser.id, fullName: "Synthetic Hygienist", gdcNumber: "987654", roleTitle: "Dental Hygienist" },
    });
    const hygienistToken = signAccessToken({ sub: hygienistUser.id, role: "clinician", sessionId: crypto.randomUUID() });
    const hygienistIssue = await issue(hygienistToken, apptId);
    expect(hygienistIssue.status).toBe(403);
    expect(hygienistIssue.body.error).toContain("registered dentists");

    // Clinician with invalid GDC number cannot issue prescriptions
    const badGdcClinicianUser = await prisma.user.create({
      data: { email: `bad-gdc-${tag}@example.test`, passwordHash: "x", role: "clinician" },
    });
    userIds.push(badGdcClinicianUser.id);
    await prisma.clinicianProfile.create({
      data: { userId: badGdcClinicianUser.id, fullName: "Bad GDC Doc", gdcNumber: "123", roleTitle: "Dentist" },
    });
    const badGdcToken = signAccessToken({ sub: badGdcClinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });
    const badIssue = await issue(badGdcToken, apptId);
    expect(badIssue.status).toBe(422);
    expect(badIssue.body.error).toContain("GDC");
  });
});
