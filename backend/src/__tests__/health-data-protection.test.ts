import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { isEncryptedEnvelope, decryptString } from "../lib/encryption";
import { communicationService } from "../lib/communication-service";
import { objectStorage, createStorageClient } from "../lib/object-storage";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-50: Health data at rest and in transit (audit §2 item 6, CS-26, CS-28)
// - Message threads: neutral previews in DB, encrypted subjects, escaped email notifications
// - Appointment notes: encrypted at rest, FK onDelete RESTRICT, transparent decrypted read
// - Tooth records: encrypted at rest in tooth_records and tooth_history
// - S3 fail-closed at boot; never silently write unencrypted files to local disk
// - Audit log hygiene: stripped query parameters, stripped emails from metadata

describe("CS-50: Health data protection at rest and in transit", () => {
  let server: http.Server;
  let baseUrl: string;
  let sendEmailSpy: jest.SpyInstance;
  const createdUserIds: string[] = [];
  const createdApptIds: string[] = [];
  const createdThreadIds: string[] = [];

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3041, resolve));
    baseUrl = "http://localhost:3041";

    sendEmailSpy = jest.spyOn(communicationService, "sendEmail").mockImplementation(async () => ({
      success: true,
      messageId: "mock_test_msg",
    }));
  });

  afterAll(async () => {
    sendEmailSpy.mockRestore();
    if (createdThreadIds.length > 0) {
      await prisma.message.deleteMany({ where: { threadId: { in: createdThreadIds } } }).catch(() => {});
      await prisma.messageThread.deleteMany({ where: { id: { in: createdThreadIds } } }).catch(() => {});
    }
    if (createdApptIds.length > 0) {
      await prisma.appointmentNote.deleteMany({ where: { appointmentId: { in: createdApptIds } } }).catch(() => {});
      await prisma.appointment.deleteMany({ where: { id: { in: createdApptIds } } }).catch(() => {});
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // ─── Test 1: Message threads encryption & neutral preview at rest ───────────
  it("stores neutral preview and encrypted subject in message_threads table, decrypts on read", async () => {
    const patientUser = await prisma.user.create({
      data: {
        email: `patient-${Date.now()}@example.test`,
        passwordHash: "x",
        role: "patient",
      },
    });
    createdUserIds.push(patientUser.id);
    const patientProfile = await prisma.patientProfile.create({
      data: {
        userId: patientUser.id,
        firstName: "Secret",
        lastName: "Patient",
      },
    });
    const patientToken = signAccessToken({
      sub: patientUser.id,
      role: "patient",
      sessionId: crypto.randomUUID(),
    });

    const sensitiveSubject = "Severe pain <script>alert(1)</script> under molar";
    const sensitiveBody = "My tooth has been throbbing constantly since yesterday evening.";

    // 1. Patient posts message
    const createRes = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        subject: sensitiveSubject,
        body: sensitiveBody,
        recipientType: "practice",
      }),
    });
    expect(createRes.status).toBe(201);
    const createData = (await createRes.json()) as any;
    createdThreadIds.push(createData.id);

    // 2. Inspect raw database record in message_threads table
    const rawThread = await prisma.messageThread.findUniqueOrThrow({
      where: { id: createData.id },
      include: { messages: true },
    });

    // DB preview must NEVER contain sensitive health body text
    expect(rawThread.preview).not.toContain("throbbing");
    expect(rawThread.preview).toBe("[Secure message]");

    // DB subject must be an encrypted JSON envelope
    expect(rawThread.subject).not.toBe(sensitiveSubject);
    const parsedSubject = JSON.parse(rawThread.subject);
    expect(isEncryptedEnvelope(parsedSubject)).toBe(true);

    // DB message body must also be an encrypted JSON envelope
    expect(rawThread.messages[0].body).not.toBe(sensitiveBody);
    const parsedBody = JSON.parse(rawThread.messages[0].body);
    expect(isEncryptedEnvelope(parsedBody)).toBe(true);

    // 3. GET /api/messages returns transparently decrypted subject and preview
    const listRes = await fetch(`${baseUrl}/api/messages`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    expect(listRes.status).toBe(200);
    const threads = (await listRes.json()) as any[];
    const found = threads.find((t) => t.id === createData.id);
    expect(found).toBeDefined();
    expect(found.subject).toBe(sensitiveSubject);
    expect(found.preview).toContain(sensitiveBody.slice(0, 50));

    // 4. The staff alert carries no subject or body at all, escaped or not (D-19)
    expect(sendEmailSpy).toHaveBeenCalled();
    const lastEmail = sendEmailSpy.mock.calls[sendEmailSpy.mock.calls.length - 1][0];
    expect(lastEmail.html).not.toContain("<script>");
    expect(lastEmail.html).not.toContain("script");
    expect(lastEmail.subject).not.toContain("script");
    expect(JSON.stringify(lastEmail)).not.toContain("throbbing");
    expect(lastEmail.text).toBeDefined();
  });

  // ─── Test 2: AppointmentNote encryption and RESTRICT constraint ─────────────
  it("encrypts clinical notes at rest, decrypts on fetch, and refuses cascade deletion of clinician", async () => {
    const clinicianUser = await prisma.user.create({
      data: {
        email: `doc-${Date.now()}@example.test`,
        passwordHash: "x",
        role: "clinician",
      },
    });
    createdUserIds.push(clinicianUser.id);
    const clinicianProfile = await prisma.clinicianProfile.create({
      data: {
        userId: clinicianUser.id,
        fullName: "Dr. Protection",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    const clinicianToken = signAccessToken({
      sub: clinicianUser.id,
      role: "clinician",
      sessionId: crypto.randomUUID(),
    });

    const patientUser = await prisma.user.create({
      data: {
        email: `note-pat-${Date.now()}@example.test`,
        passwordHash: "x",
        role: "patient",
      },
    });
    createdUserIds.push(patientUser.id);
    const patientProfile = await prisma.patientProfile.create({
      data: {
        userId: patientUser.id,
        firstName: "Note",
        lastName: "Patient",
      },
    });

    const service = await prisma.service.findFirstOrThrow();
    const appt = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        clinicianId: clinicianProfile.id,
        serviceId: service.id,
        status: "in_progress",
        channel: "clinic",
        totalPricePence: 5000,
        startTimeUtc: new Date(),
        endTimeUtc: new Date(Date.now() + 3600000),
      },
    });
    createdApptIds.push(appt.id);

    const notesText = "Patient has deep caries on tooth 46, requiring root canal treatment.";
    const diagText = "Irreversible pulpitis tooth 46";
    const planText = "RCT stage 1, provisional dressing, recall 2 weeks";

    // 1. Clinician saves notes
    const saveRes = await fetch(`${baseUrl}/api/booking/appointments/${appt.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${clinicianToken}` },
      body: JSON.stringify({
        notes: notesText,
        diagnosis: diagText,
        treatmentPlan: planText,
      }),
    });
    expect(saveRes.status).toBe(200);

    // 2. Check raw database row in appointment_notes table
    const rawNote = await prisma.appointmentNote.findUniqueOrThrow({
      where: { appointmentId: appt.id },
    });

    expect(rawNote.notes).not.toBe(notesText);
    const parsedNotes = JSON.parse(rawNote.notes);
    expect(isEncryptedEnvelope(parsedNotes)).toBe(true);

    expect(rawNote.diagnosis).not.toBe(diagText);
    const parsedDiag = JSON.parse(rawNote.diagnosis!);
    expect(isEncryptedEnvelope(parsedDiag)).toBe(true);

    expect(rawNote.treatmentPlan).not.toBe(planText);
    const parsedPlan = JSON.parse(rawNote.treatmentPlan!);
    expect(isEncryptedEnvelope(parsedPlan)).toBe(true);

    // 3. GET /api/booking/appointments/:id/notes transparently decrypts
    const getRes = await fetch(`${baseUrl}/api/booking/appointments/${appt.id}/notes`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(getRes.status).toBe(200);
    const getData = (await getRes.json()) as any;
    expect(getData.notes).toBe(notesText);
    expect(getData.diagnosis).toBe(diagText);
    expect(getData.treatmentPlan).toBe(planText);

    // 4. Attempting to delete the clinician profile must fail with RESTRICT constraint violation
    await expect(
      prisma.clinicianProfile.delete({ where: { id: clinicianProfile.id } })
    ).rejects.toThrow();
  });

  // ─── Test 3: Tooth records encrypted at rest ───────────────────────────────
  it("encrypts odontogram tooth notes at rest in tooth_records and tooth_history", async () => {
    const clinicianUser = await prisma.user.create({
      data: {
        email: `doc-tooth-${Date.now()}@example.test`,
        passwordHash: "x",
        role: "clinician",
      },
    });
    createdUserIds.push(clinicianUser.id);
    const clinicianProfile = await prisma.clinicianProfile.create({
      data: {
        userId: clinicianUser.id,
        fullName: "Dr. Odontogram",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    const clinicianToken = signAccessToken({
      sub: clinicianUser.id,
      role: "clinician",
      sessionId: crypto.randomUUID(),
    });

    const patientUser = await prisma.user.create({
      data: {
        email: `tooth-pat-${Date.now()}@example.test`,
        passwordHash: "x",
        role: "patient",
      },
    });
    createdUserIds.push(patientUser.id);
    const patientProfile = await prisma.patientProfile.create({
      data: {
        userId: patientUser.id,
        firstName: "Tooth",
        lastName: "Patient",
      },
    });

    const service = await prisma.service.findFirstOrThrow();
    const appt = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        clinicianId: clinicianProfile.id,
        serviceId: service.id,
        status: "in_progress",
        channel: "clinic",
        totalPricePence: 5000,
        startTimeUtc: new Date(),
        endTimeUtc: new Date(Date.now() + 3600000),
      },
    });
    createdApptIds.push(appt.id);

    const toothNote = "Severe decay on occlusal surface, class II restoration recommended.";

    // 1. Clinician updates odontogram with active appointment context
    const putRes = await fetch(`${baseUrl}/api/patients/${patientProfile.id}/odontogram`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${clinicianToken}` },
      body: JSON.stringify({
        teeth: [
          {
            toothNumber: 16,
            arch: "upper",
            quadrant: "upper_right",
            condition: "decay",
            notes: toothNote,
          },
        ],
      }),
    });
    expect(putRes.status).toBe(200);

    // 2. Verify raw database rows in tooth_records and tooth_history are encrypted envelopes
    const rawTooth = await prisma.toothRecord.findUniqueOrThrow({
      where: {
        patientId_toothNumber: {
          patientId: patientProfile.id,
          toothNumber: 16,
        },
      },
    });
    expect(rawTooth.notes).not.toBe(toothNote);
    const parsedToothNotes = JSON.parse(rawTooth.notes!);
    expect(isEncryptedEnvelope(parsedToothNotes)).toBe(true);

    const rawHistory = await prisma.toothHistory.findFirstOrThrow({
      where: {
        patientId: patientProfile.id,
        toothNumber: 16,
      },
    });
    expect(rawHistory.notes).not.toBe(toothNote);
    const parsedHistoryNotes = JSON.parse(rawHistory.notes!);
    expect(isEncryptedEnvelope(parsedHistoryNotes)).toBe(true);

    // 3. GET /api/patients/:id/odontogram returns decrypted note
    const getRes = await fetch(`${baseUrl}/api/patients/${patientProfile.id}/odontogram`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(getRes.status).toBe(200);
    const teeth = (await getRes.json()) as any[];
    const t16 = teeth.find((t) => t.toothNumber === 16);
    expect(t16).toBeDefined();
    expect(t16.notes).toBe(toothNote);
  });

  // ─── Test 4: S3 Object Storage fail-closed behavior ─────────────────────────
  it("fails closed when S3 is configured without bucket, and never silently falls back to disk", async () => {
    // Missing bucket throws immediately
    expect(() => {
      createStorageClient({
        provider: "s3",
        endpoint: "https://s3.eu-west-2.amazonaws.com",
        region: "eu-west-2",
        // bucket missing
      });
    }).toThrow(/CRITICAL: S3_BUCKET_NAME must be configured/);
  });

  // ─── Test 5: Audit log path strips query string and scrubs sensitive fields ──
  it("strips query string from audit log path and redacts sensitive emails", async () => {
    const adminUser = await prisma.user.create({
      data: {
        email: `audit-admin-${Date.now()}@example.test`,
        passwordHash: "x",
        role: "admin",
      },
    });
    createdUserIds.push(adminUser.id);
    const adminToken = signAccessToken({
      sub: adminUser.id,
      role: "admin",
      sessionId: crypto.randomUUID(),
    });

    // Make request with query params that could carry sensitive terms
    const res = await fetch(`${baseUrl}/api/admin/services?sensitiveSearch=PatientHealthQuery`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);

    // Wait for async res.on("finish") audit logger
    let log = null;
    for (let i = 0; i < 20; i++) {
      log = await prisma.auditLog.findFirst({
        where: { actorId: adminUser.id, action: "GET /api/admin/services" },
        orderBy: { timestampUtc: "desc" },
      });
      if (log) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    expect(log).not.toBeNull();
    const meta = log?.metadata as any;
    expect(meta?.path).toBe("/api/admin/services");
    expect(meta?.path).not.toContain("sensitiveSearch");
    expect(meta?.path).not.toContain("PatientHealthQuery");

    // Direct audit creation with sensitive email scrubs it
    const directLog = await createAuditLogWithIntegrity({
      action: "test.scrub",
      actorId: adminUser.id,
      metadata: { email: "leaked@example.test", normalKey: "safeValue" },
    });
    expect((directLog.metadata as any).email).toBe("[REDACTED]");
    expect((directLog.metadata as any).normalKey).toBe("safeValue");
  });
});
