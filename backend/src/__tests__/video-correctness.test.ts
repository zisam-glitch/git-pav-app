import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { decryptField } from "../lib/encryption";
import { uniqueGdc } from "../../test/unique-gdc";
import { sniffImageMime } from "../lib/video-triage";

// A 1x1 PNG: real bytes, so the upload check sees a real image.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

describe("Video consult correctness (V25 to V30)", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  let patientToken = "";
  let clinicianToken = "";
  let patientProfileId = "";
  let clinicianProfileId = "";
  let serviceId = "";
  let pricePence = 0;
  const created: string[] = [];

  // One clinician cannot have overlapping appointments, so each test
  // appointment gets its own 40-minute slot.
  let slot = 0;
  const newAppointment = async (over: Record<string, unknown> = {}) => {
    slot += 1;
    const start = new Date(Date.now() - slot * 40 * 60 * 1000);
    const appt = await prisma.appointment.create({
      data: {
        patientId: patientProfileId,
        clinicianId: clinicianProfileId,
        serviceId,
        channel: "video",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 30 * 60 * 1000),
        status: "confirmed",
        totalPricePence: pricePence,
        depositPaidPence: 0,
        ...over,
      },
    });
    created.push(appt.id);
    return appt.id;
  };

  const post = (path: string, token: string, body: unknown) =>
    fetch(`${baseUrl}/api/video/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  const upload = (token: string, appointmentId: string | null, bytes: Buffer, type = "image/png") => {
    const form = new FormData();
    if (appointmentId) form.append("appointmentId", appointmentId);
    form.append("photo", new Blob([bytes], { type }), "photo.png");
    return fetch(`${baseUrl}/api/video/upload-triage-photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  };

  const triageOf = async (id: string) => {
    const row = await prisma.appointment.findUniqueOrThrow({ where: { id } });
    return (await decryptField<Record<string, unknown>>(row.triageData)) || {};
  };

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;

    const patientUser = await prisma.user.create({
      data: { email: `vc-patient-${tag}@example.test`, passwordHash: "mock-hash", role: "patient" },
    });
    const patientProfile = await prisma.patientProfile.create({
      data: { userId: patientUser.id, firstName: "Vee", lastName: "Patient", dob: new Date("1995-05-15"), gender: "female", postcode: "W1D 3QU" },
    });
    patientProfileId = patientProfile.id;
    const clinicianUser = await prisma.user.create({
      data: { email: `vc-clinician-${tag}@example.test`, passwordHash: "mock-hash", role: "clinician" },
    });
    const clinician = await prisma.clinicianProfile.create({
      data: { userId: clinicianUser.id, fullName: "Dr. Vee Dental", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    clinicianProfileId = clinician.id;
    const service = await prisma.service.findFirstOrThrow();
    serviceId = service.id;
    pricePence = service.pricePence;
    patientToken = signAccessToken({ sub: patientUser.id, role: "patient", sessionId: crypto.randomUUID() });
    clinicianToken = signAccessToken({ sub: clinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    await prisma.documentVault.deleteMany({ where: { patientId: patientProfileId } });
    await prisma.appointment.deleteMany({ where: { id: { in: created } } });
    await prisma.patientProfile.deleteMany({ where: { id: patientProfileId } });
    await prisma.clinicianProfile.deleteMany({ where: { id: clinicianProfileId } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  it("sniffs the real image type from the bytes", () => {
    expect(sniffImageMime(PNG)).toBe("image/png");
    expect(sniffImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("image/jpeg");
    expect(sniffImageMime(Buffer.from("not an image at all"))).toBeNull();
  });

  describe("end-consult (V26, V27)", () => {
    it("refuses to complete a consult nobody was let into", async () => {
      const id = await newAppointment();
      const res = await post("end-consult", clinicianToken, { appointmentId: id, notes: "x" });
      expect(res.status).toBe(409);
      const row = await prisma.appointment.findUniqueOrThrow({ where: { id } });
      expect(row.status).toBe("confirmed");
    });

    it("is safe to send twice: the second call returns the saved summary", async () => {
      const id = await newAppointment({ status: "in_progress" });
      const first = await post("end-consult", clinicianToken, { appointmentId: id, diagnosis: "Synthetic" });
      expect(first.status).toBe(200);
      const a = (await first.json()) as { completedAt: string };
      const second = await post("end-consult", clinicianToken, { appointmentId: id, diagnosis: "Different" });
      expect(second.status).toBe(200);
      const b = (await second.json()) as { completedAt: string; summary: { diagnosis: string } };
      expect(b.completedAt).toBe(a.completedAt);
      expect(b.summary.diagnosis).toBe("Synthetic");
    });
  });

  describe("submit-triage (V28)", () => {
    it("refuses a consultation that has already been completed", async () => {
      const id = await newAppointment({ status: "completed" });
      const res = await post("submit-triage", patientToken, { appointmentId: id, chiefComplaint: "Pain", painLevel: 2 });
      expect(res.status).toBe(409);
    });

    it("refuses an appointment that is not a video one", async () => {
      const id = await newAppointment({ channel: "clinic" });
      const res = await post("submit-triage", patientToken, { appointmentId: id, chiefComplaint: "Pain", painLevel: 2 });
      expect(res.status).toBe(409);
    });
  });

  describe("concurrent writes (V25)", () => {
    it("keeps both the admission and the answers when they arrive together", async () => {
      for (let i = 0; i < 5; i++) {
        const id = await newAppointment();
        const [admit, triage] = await Promise.all([
          post("admit-patient", clinicianToken, { appointmentId: id }),
          post("submit-triage", patientToken, { appointmentId: id, chiefComplaint: "Sore tooth", painLevel: 3 }),
        ]);
        expect(admit.status).toBe(200);
        expect(triage.status).toBe(200);
        const t = await triageOf(id);
        expect(t.admittedAt).toBeTruthy();
        expect(t.chiefComplaint).toBe("Sore tooth");
      }
    });

    it("admitting twice keeps the first admission time", async () => {
      const id = await newAppointment();
      await post("admit-patient", clinicianToken, { appointmentId: id });
      const first = (await triageOf(id)).admittedAt;
      await post("admit-patient", clinicianToken, { appointmentId: id });
      expect((await triageOf(id)).admittedAt).toBe(first);
    });

    it("does not lose photos uploaded in parallel", async () => {
      const id = await newAppointment();
      const results = await Promise.all([1, 2, 3, 4].map(() => upload(patientToken, id, PNG)));
      results.forEach((r) => expect(r.status).toBe(201));
      const row = await prisma.appointment.findUniqueOrThrow({ where: { id } });
      expect(row.intraoralPhotos).toHaveLength(4);
    });
  });

  describe("photo upload (V29, V30)", () => {
    it("requires an appointment", async () => {
      const res = await upload(patientToken, null, PNG);
      expect(res.status).toBe(400);
    });

    it("rejects a file that claims to be an image but is not", async () => {
      const id = await newAppointment();
      const res = await upload(patientToken, id, Buffer.from("<html>not a picture</html>"));
      expect(res.status).toBe(400);
    });

    it("caps the number of photos", async () => {
      const id = await newAppointment();
      for (let i = 0; i < 6; i++) {
        expect((await upload(patientToken, id, PNG)).status).toBe(201);
      }
      expect((await upload(patientToken, id, PNG)).status).toBe(409);
    });

    it("answers a malformed id on the photo links with 400", async () => {
      const res = await fetch(`${baseUrl}/api/video/triage-photos/not-a-uuid`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      expect(res.status).toBe(400);
    });
  });
});
