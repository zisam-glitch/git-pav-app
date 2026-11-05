import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { verifyAuditIntegrity } from "../lib/audit-integrity";
import { londonDate, londonTimeToUtc } from "../lib/availability";
import { uniqueGdc } from "../../test/unique-gdc";

describe("CS-28: Clinician Portal (PT-3, MB-4)", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const ids = {
    appointmentTomorrowId: "",
    patientUserId: "",
    clinicianUserId: "",
    otherClinicianUserId: "",
    patientProfileId: "",
    clinicianProfileId: "",
    otherClinicianProfileId: "",
    serviceId: "",
    appointmentTodayId: "",
    appointmentFutureId: "",
  };
  let patientToken = "";
  let clinicianToken = "";
  let otherClinicianToken = "";

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    baseUrl = `http://localhost:${port}`;

    // Create patient
    const patientUser = await prisma.user.create({
      data: {
        email: `clinician-pt-${tag}@example.test`,
        passwordHash: "mock-hash",
        role: "patient",
      },
    });
    ids.patientUserId = patientUser.id;

    const patientProfile = await prisma.patientProfile.create({
      data: {
        userId: patientUser.id,
        firstName: "Portal",
        lastName: "Patient",
        dob: new Date("1992-04-10"),
        gender: "male",
        postcode: "W1D 3QU",
      },
    });
    ids.patientProfileId = patientProfile.id;

    // Create clinician
    const clinicianUser = await prisma.user.create({
      data: {
        email: `clinician-dr-${tag}@example.test`,
        passwordHash: "mock-hash",
        role: "clinician",
      },
    });
    ids.clinicianUserId = clinicianUser.id;

    const clinicianProfile = await prisma.clinicianProfile.create({
      data: {
        userId: clinicianUser.id,
        fullName: "Dr. Jonathan Smith",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    ids.clinicianProfileId = clinicianProfile.id;

    // Create second clinician (for access control test)
    const otherClinicianUser = await prisma.user.create({
      data: {
        email: `clinician-other-${tag}@example.test`,
        passwordHash: "mock-hash",
        role: "clinician",
      },
    });
    ids.otherClinicianUserId = otherClinicianUser.id;

    const otherClinicianProfile = await prisma.clinicianProfile.create({
      data: {
        userId: otherClinicianUser.id,
        fullName: "Dr. Other Clinician",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    ids.otherClinicianProfileId = otherClinicianProfile.id;

    const service = await prisma.service.findFirstOrThrow();
    ids.serviceId = service.id;

    patientToken = signAccessToken({ sub: patientUser.id, role: "patient", sessionId: crypto.randomUUID() });
    clinicianToken = signAccessToken({ sub: clinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });
    otherClinicianToken = signAccessToken({ sub: otherClinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });

    // 1. Create today's appointment. "Today" is the UK calendar day, as the API scopes it.
    const startTimeToday = londonTimeToUtc(londonDate(new Date()), 11 * 60);
    const endTimeToday = new Date(startTimeToday.getTime() + 30 * 60 * 1000);

    const apptToday = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        clinicianId: clinicianProfile.id,
        serviceId: service.id,
        channel: "clinic",
        startTimeUtc: startTimeToday,
        endTimeUtc: endTimeToday,
        status: "confirmed",
        totalPricePence: service.pricePence,
        depositPaidPence: 2000,
      },
    });
    ids.appointmentTodayId = apptToday.id;

    // 2. Create future appointment (3 days from now)
    const startTimeFuture = londonTimeToUtc(londonDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), 14 * 60);
    const endTimeFuture = new Date(startTimeFuture.getTime() + 30 * 60 * 1000);

    const apptFuture = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        clinicianId: clinicianProfile.id,
        serviceId: service.id,
        channel: "clinic",
        startTimeUtc: startTimeFuture,
        endTimeUtc: endTimeFuture,
        status: "confirmed",
        totalPricePence: service.pricePence,
        depositPaidPence: 2000,
      },
    });
    ids.appointmentFutureId = apptFuture.id;

    // 3. Tomorrow at 09:00 UK time, which a UTC-based check let through.
    const startTimeTomorrow = londonTimeToUtc(londonDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), 9 * 60);
    const apptTomorrow = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        clinicianId: clinicianProfile.id,
        serviceId: service.id,
        channel: "clinic",
        startTimeUtc: startTimeTomorrow,
        endTimeUtc: new Date(startTimeTomorrow.getTime() + 30 * 60 * 1000),
        status: "confirmed",
        totalPricePence: service.pricePence,
        depositPaidPence: 2000,
      },
    });
    ids.appointmentTomorrowId = apptTomorrow.id;
  });

  afterAll(async () => {
    if (ids.appointmentTodayId || ids.appointmentFutureId || ids.appointmentTomorrowId) {
      await prisma.appointment.deleteMany({
        where: { id: { in: [ids.appointmentTodayId, ids.appointmentFutureId, ids.appointmentTomorrowId].filter(Boolean) } },
      });
    }
    if (ids.patientProfileId) {
      await prisma.toothHistory.deleteMany({ where: { patientId: ids.patientProfileId } });
      await prisma.toothRecord.deleteMany({ where: { patientId: ids.patientProfileId } });
      await prisma.treatmentPlanItem.deleteMany({ where: { treatmentPlan: { patientId: ids.patientProfileId } } });
      await prisma.treatmentPlan.deleteMany({ where: { patientId: ids.patientProfileId } });
      await prisma.patientProfile.deleteMany({ where: { id: ids.patientProfileId } });
    }
    if (ids.clinicianProfileId || ids.otherClinicianProfileId) {
      await prisma.clinicianProfile.deleteMany({
        where: { id: { in: [ids.clinicianProfileId, ids.otherClinicianProfileId] } },
      });
    }
    // Users kept to maintain audit log HMAC FK integrity
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  it("MB-4: scopes clinician schedule to today with date/scope filter without mixing in future days", async () => {
    // GET /api/booking/appointments?scope=today as clinician
    const res = await fetch(`${baseUrl}/api/booking/appointments?scope=today`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(res.status).toBe(200);
    const schedule: any = await res.json();
    expect(Array.isArray(schedule)).toBe(true);

    // Today's appointment should be present
    const todayFound = schedule.find((a: any) => a.id === ids.appointmentTodayId);
    expect(todayFound).toBeDefined();

    // Future appointment should NOT be present in today's scoped view
    const futureFound = schedule.find((a: any) => a.id === ids.appointmentFutureId);
    expect(futureFound).toBeUndefined();

    // Querying without scope filter returns all future appointments (backward compatible)
    const allRes = await fetch(`${baseUrl}/api/booking/appointments`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(allRes.status).toBe(200);
    const allSchedule: any = await allRes.json();
    expect(allSchedule.find((a: any) => a.id === ids.appointmentTodayId)).toBeDefined();
    expect(allSchedule.find((a: any) => a.id === ids.appointmentFutureId)).toBeDefined();
  });

  it("PT-3: updates odontogram with append-only tooth history and audits changes", async () => {
    // Update tooth #11 to 'decay'
    const res1 = await fetch(`${baseUrl}/api/patients/${ids.patientProfileId}/odontogram`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${clinicianToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teeth: [
          {
            toothNumber: 11,
            arch: "upper",
            quadrant: "upper_right",
            condition: "decay",
            notes: "Incipient caries mesial surface",
          },
        ],
      }),
    });
    expect(res1.status).toBe(200);

    // Update tooth #11 to 'filled' (treatment done)
    const res2 = await fetch(`${baseUrl}/api/patients/${ids.patientProfileId}/odontogram`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${clinicianToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teeth: [
          {
            toothNumber: 11,
            arch: "upper",
            quadrant: "upper_right",
            condition: "filled",
            notes: "Composite resin filling completed",
          },
        ],
      }),
    });
    expect(res2.status).toBe(200);

    // Check current odontogram: shows latest status 'filled'
    const getRes = await fetch(`${baseUrl}/api/patients/${ids.patientProfileId}/odontogram`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(getRes.status).toBe(200);
    const teeth: any = await getRes.json();
    const tooth11 = teeth.find((t: any) => t.toothNumber === 11);
    expect(tooth11).toBeDefined();
    expect(tooth11.condition).toBe("filled");

    // PT-3: Check append-only history: shows BOTH events (decay then filled)
    const historyRes = await fetch(`${baseUrl}/api/patients/${ids.patientProfileId}/odontogram/history`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(historyRes.status).toBe(200);
    const history: any = await historyRes.json();
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[0].condition).toBe("filled");
    expect(history[1].condition).toBe("decay");
  });

  it("PT-3: records treatment plan and creates verifiable audit entry", async () => {
    const res = await fetch(`${baseUrl}/api/patients/${ids.patientProfileId}/plans`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clinicianToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Standard Hygiene & Restoration Plan",
        items: [
          { code: "HYG01", description: "Scale and Polish", costPence: 7500 },
          { code: "FIL02", description: "Composite Restoration UR1", toothNumber: 11, costPence: 12000 },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const plan: any = await res.json();
    expect(plan.title).toBe("Standard Hygiene & Restoration Plan");
    expect(plan.totalCostPence).toBe(19500);
    expect(plan.items).toHaveLength(2);

    // Verify audit log exists
    const auditRes = await prisma.auditLog.findFirst({
      where: {
        action: "treatment_plan.created",
        resourceId: plan.id,
      },
    });
    expect(auditRes).toBeDefined();
    expect(auditRes?.actorId).toBe(ids.clinicianUserId);
  });

  it("gaps §2: clinician records examination notes and retrieves them", async () => {
    // 1. Unassigned clinician cannot record notes
    const forbiddenRes = await fetch(`${baseUrl}/api/booking/appointments/${ids.appointmentTodayId}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${otherClinicianToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes: "Attempt by unassigned clinician",
      }),
    });
    expect(forbiddenRes.status).toBe(403);

    // 2. Assigned clinician saves notes
    const saveRes = await fetch(`${baseUrl}/api/booking/appointments/${ids.appointmentTodayId}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clinicianToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes: "Patient attended routine checkup. Plaque score 15%. Gingival health good.",
        diagnosis: "Mild localized marginal gingivitis LR4-5",
        treatmentPlan: "Encouraged interdental flossing daily. Recall in 6 months.",
      }),
    });

    expect(saveRes.status).toBe(200);
    const saved: any = await saveRes.json();
    expect(saved.notes).toContain("Plaque score 15%");
    expect(saved.diagnosis).toContain("Mild localized marginal gingivitis");

    // 3. Clinician and patient can read notes
    const readClinicianRes = await fetch(`${baseUrl}/api/booking/appointments/${ids.appointmentTodayId}/notes`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(readClinicianRes.status).toBe(200);
    const readNotes: any = await readClinicianRes.json();
    expect(readNotes.diagnosis).toContain("Mild localized marginal gingivitis");

    const readPatientRes = await fetch(`${baseUrl}/api/booking/appointments/${ids.appointmentTodayId}/notes`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    expect(readPatientRes.status).toBe(200);
  });

  it("gaps §2: clinician marks appointment completed and no-show", async () => {
    // Cannot complete a future appointment (CS-28 time check)
    const futureCompleteRes = await fetch(`${baseUrl}/api/booking/appointments/${ids.appointmentFutureId}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(futureCompleteRes.status).toBe(400);
    const futureCompleteBody: any = await futureCompleteRes.json();
    expect(futureCompleteBody.error).toContain("future date");

    const tomorrowCompleteRes = await fetch(`${baseUrl}/api/booking/appointments/${ids.appointmentTomorrowId}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(tomorrowCompleteRes.status).toBe(400);

    // Complete today's appointment
    const completeRes = await fetch(`${baseUrl}/api/booking/appointments/${ids.appointmentTodayId}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(completeRes.status).toBe(200);
    const completeBody: any = await completeRes.json();
    expect(completeBody.status).toBe("completed");

    // Mark future appointment as no-show
    const noShowRes = await fetch(`${baseUrl}/api/booking/appointments/${ids.appointmentFutureId}/no-show`, {
      method: "POST",
      headers: { Authorization: `Bearer ${clinicianToken}` },
    });
    expect(noShowRes.status).toBe(200);
    const noShowBody: any = await noShowRes.json();
    expect(noShowBody.status).toBe("no_show");
  });
});
