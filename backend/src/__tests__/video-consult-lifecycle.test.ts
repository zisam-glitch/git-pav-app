import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { decryptField } from "../lib/encryption";
import { uniqueGdc } from "../../test/unique-gdc";

describe("CS-27: Video Consultation Lifecycle (VD-2, VD-3, VD-4, MC-3)", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const ids = {
    patientUserId: "",
    clinicianUserId: "",
    patientProfileId: "",
    clinicianProfileId: "",
    serviceId: "",
    appointmentId: "",
  };
  let patientToken = "";
  let clinicianToken = "";

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    baseUrl = `http://localhost:${port}`;

    // Setup users & profiles
    const patientUser = await prisma.user.create({
      data: {
        email: `video-patient-${tag}@example.test`,
        passwordHash: "mock-hash",
        role: "patient",
      },
    });
    ids.patientUserId = patientUser.id;

    const patientProfile = await prisma.patientProfile.create({
      data: {
        userId: patientUser.id,
        firstName: "Video",
        lastName: "Patient",
        dob: new Date("1995-05-15"),
        gender: "female",
        postcode: "W1D 3QU",
      },
    });
    ids.patientProfileId = patientProfile.id;

    const clinicianUser = await prisma.user.create({
      data: {
        email: `video-clinician-${tag}@example.test`,
        passwordHash: "mock-hash",
        role: "clinician",
      },
    });
    ids.clinicianUserId = clinicianUser.id;

    const clinicianProfile = await prisma.clinicianProfile.create({
      data: {
        userId: clinicianUser.id,
        fullName: "Dr. Sarah Dental",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    ids.clinicianProfileId = clinicianProfile.id;

    const service = await prisma.service.findFirstOrThrow();
    ids.serviceId = service.id;

    patientToken = signAccessToken({ sub: patientUser.id, role: "patient", sessionId: crypto.randomUUID() });
    clinicianToken = signAccessToken({ sub: clinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });

    // Create video appointment
    const startTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const appt = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        clinicianId: clinicianProfile.id,
        serviceId: service.id,
        channel: "video",
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        status: "confirmed",
        totalPricePence: service.pricePence,
        depositPaidPence: 0,
      },
    });
    ids.appointmentId = appt.id;
  });

  afterAll(async () => {
    if (ids.appointmentId) {
      await prisma.appointment.deleteMany({ where: { id: ids.appointmentId } });
    }
    if (ids.patientProfileId) {
      await prisma.patientProfile.deleteMany({ where: { id: ids.patientProfileId } });
    }
    if (ids.clinicianProfileId) {
      await prisma.clinicianProfile.deleteMany({ where: { id: ids.clinicianProfileId } });
    }
    // Keep user records so audit logs created during tests maintain their foreign key and actorId integrity
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  it("VD-2 & VD-3: runs red flags check on triage and merges triageData without overwriting", async () => {
    // 1. Submit initial triage with red flag symptoms (difficulty breathing)
    const res = await fetch(`${baseUrl}/api/video/submit-triage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${patientToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId: ids.appointmentId,
        chiefComplaint: "Severe pain and breathing trouble",
        painLevel: 9,
        duration: "2 days",
        symptoms: ["difficulty breathing", "facial swelling"],
      }),
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.redFlag).toBeDefined();
    expect(body.redFlag.isRedFlag).toBe(true);
    expect(body.redFlag.flagType).toBe("airway_or_breathing");
    expect(body.redFlag.emergencyInstructions).toContain("999");

    // Check DB directly: triageData is encrypted envelope at rest and contains merged fields
    const apptInDb = await prisma.appointment.findUniqueOrThrow({
      where: { id: ids.appointmentId },
    });
    const decryptedTriage = await decryptField<any>(apptInDb.triageData);
    expect(decryptedTriage.chiefComplaint).toBe("Severe pain and breathing trouble");
    expect(decryptedTriage.redFlag.isRedFlag).toBe(true);

    // 2. Submit second triage with photo update, ensure previous chiefComplaint is preserved (VD-3 merge)
    const res2 = await fetch(`${baseUrl}/api/video/submit-triage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${patientToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId: ids.appointmentId,
        chiefComplaint: "Severe pain and breathing trouble",
        painLevel: 9,
        photos: ["https://example.com/photo1.jpg"],
      }),
    });

    expect(res2.status).toBe(200);
    const apptInDb2 = await prisma.appointment.findUniqueOrThrow({
      where: { id: ids.appointmentId },
    });
    const decrypted2 = await decryptField<any>(apptInDb2.triageData);
    expect(decrypted2.photos).toEqual(["https://example.com/photo1.jpg"]);
    expect(decrypted2.chiefComplaint).toBe("Severe pain and breathing trouble");
  });

  it("VD-4: clinician queue returns ongoing video consultations within 60min window", async () => {
    const res = await fetch(`${baseUrl}/api/video/clinician-queue`, {
      headers: {
        Authorization: `Bearer ${clinicianToken}`,
      },
    });

    expect(res.status).toBe(200);
    const queue: any = await res.json();
    expect(Array.isArray(queue)).toBe(true);
    const found = queue.find((item: any) => item.id === ids.appointmentId);
    expect(found).toBeDefined();
    expect(found.patient.firstName).toBe("Video");
  });

  it("VD-4 & lifecycle: clinician admits patient, transitions status to in_progress", async () => {
    const res = await fetch(`${baseUrl}/api/video/admit-patient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clinicianToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId: ids.appointmentId,
      }),
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.appointment.status).toBe("in_progress");

    // Patient checks status: admitted is now true
    const statusRes = await fetch(`${baseUrl}/api/video/status/${ids.appointmentId}`, {
      headers: {
        Authorization: `Bearer ${patientToken}`,
      },
    });
    expect(statusRes.status).toBe(200);
    const statusBody: any = await statusRes.json();
    expect(statusBody.admitted).toBe(true);
    expect(statusBody.status).toBe("in_progress");
  });

  it("VD-4 & MC-3: clinician ends consult and patient retrieves real recorded summary", async () => {
    // Clinician ends consult
    const endRes = await fetch(`${baseUrl}/api/video/end-consult`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clinicianToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId: ids.appointmentId,
        notes: "Patient advised on warm saltwater rinses and prescribed non-steroidal anti-inflammatory.",
        diagnosis: "Acute pericoronitis LR8",
        treatmentPlan: "Review in 1 week if symptoms persist. Possible extraction.",
        followUpRecommended: "clinic",
      }),
    });

    expect(endRes.status).toBe(200);
    const endBody: any = await endRes.json();
    expect(endBody.status).toBe("completed");
    expect(endBody.summary.diagnosis).toBe("Acute pericoronitis LR8");
    expect(endBody.summary.completedBy).toBe("Dr. Sarah Dental");

    // Patient checks summary endpoint (MC-3)
    const summaryRes = await fetch(`${baseUrl}/api/video/summary/${ids.appointmentId}`, {
      headers: {
        Authorization: `Bearer ${patientToken}`,
      },
    });

    expect(summaryRes.status).toBe(200);
    const summaryBody: any = await summaryRes.json();
    expect(summaryBody.status).toBe("completed");
    expect(summaryBody.summary.diagnosis).toBe("Acute pericoronitis LR8");
    expect(summaryBody.summary.notes).toContain("warm saltwater rinses");
    expect(summaryBody.summary.followUpRecommended).toBe("clinic");
  });
});
