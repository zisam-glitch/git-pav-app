import http from "http";
import crypto from "crypto";
import express from "express";
import "express-async-errors";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import consentsRouter from "../routes/consents";
import patientsRouter from "../routes/patients";
import { errorHandler } from "../middleware/error-handler";
import {
  verifyModelCoverage,
  PATIENT_DATA_EXTRACTORS,
  NON_PATIENT_DATA_MODELS,
  buildSubjectAccessRequestBundle,
} from "../lib/sar-registry";
import { communicationService } from "../lib/communication-service";
import { objectStorage } from "../lib/object-storage";

describe("CS-24: Complete GDPR Subject Access Request (SAR-1, SAR-2, OS-3)", () => {
  let appServer: http.Server;
  let appUrl: string;
  let patientToken: string;
  let otherPatientToken: string;
  let patientUserId: string;
  let patientProfileId: string;
  let otherUserId: string;
  let otherProfileId: string;
  let lastSentEmail: any = null;

  // Track created entities for clean teardown
  const created = {
    userIds: [] as string[],
    profileIds: [] as string[],
    dependantIds: [] as string[],
    appointmentIds: [] as string[],
    prescriptionIds: [] as string[],
    treatmentPlanIds: [] as string[],
    toothRecordIds: [] as string[],
    documentIds: [] as string[],
    messageThreadIds: [] as string[],
    vanRequestIds: [] as string[],
    shiftIds: [] as string[],
    vanIds: [] as string[],
    operatorIds: [] as string[],
    paymentMethodIds: [] as string[],
    financingIds: [] as string[],
    rewardAwardIds: [] as string[],
    rewardRedeemIds: [] as string[],
    waitlistIds: [] as string[],
    metricIds: [] as string[],
    erasureIds: [] as string[],
    consentIds: [] as string[],
  };

  beforeAll(async () => {
    // Intercept communicationService.sendEmail to inspect SAR notification emails
    const originalSendEmail = communicationService.sendEmail.bind(communicationService);
    jest.spyOn(communicationService, "sendEmail").mockImplementation(async (payload: any) => {
      lastSentEmail = payload;
      return originalSendEmail(payload);
    });

    const app = express();
    app.use(express.json());
    app.use("/api/consents", consentsRouter);
    app.use("/api/patients", patientsRouter);
    app.use(errorHandler);

    appServer = http.createServer(app);
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    const port = (appServer.address() as any).port;
    appUrl = `http://localhost:${port}`;

    const tag = crypto.randomUUID().slice(0, 8);

    // 1. Create primary patient with XSS chars in firstName to test SAR-2 escaping
    const user1 = await prisma.user.create({
      data: {
        email: `sar-pt1-${tag}@example.test`,
        passwordHash: "synthetic_hash",
        role: "patient",
      },
    });
    patientUserId = user1.id;
    created.userIds.push(user1.id);

    const profile1 = await prisma.patientProfile.create({
      data: {
        userId: user1.id,
        firstName: "Alice <script>alert(1)</script> & Co",
        lastName: "Smith",
        dob: new Date("1990-05-15"),
        gender: "female",
        postcode: "SW1A 1AA",
        medicalHistory: { hasAllergies: true, allergies: ["Penicillin"] },
      },
    });
    patientProfileId = profile1.id;
    created.profileIds.push(profile1.id);

    patientToken = signAccessToken({
      sub: user1.id,
      role: "patient",
      sessionId: crypto.randomUUID(),
    });

    // 2. Create other patient
    const user2 = await prisma.user.create({
      data: {
        email: `sar-pt2-${tag}@example.test`,
        passwordHash: "synthetic_hash",
        role: "patient",
      },
    });
    otherUserId = user2.id;
    created.userIds.push(user2.id);

    const profile2 = await prisma.patientProfile.create({
      data: {
        userId: user2.id,
        firstName: "Bob",
        lastName: "Jones",
      },
    });
    otherProfileId = profile2.id;
    created.profileIds.push(profile2.id);

    otherPatientToken = signAccessToken({
      sub: user2.id,
      role: "patient",
      sessionId: crypto.randomUUID(),
    });

    // 3. Seed entities for patient 1 across models
    const service = await prisma.service.findFirstOrThrow();
    const clinic = await prisma.clinic.findFirstOrThrow();
    const clinician = await prisma.clinicianProfile.findFirstOrThrow();

    // Dependant
    const dep = await prisma.dependant.create({
      data: {
        guardianId: profile1.id,
        firstName: "Charlie",
        lastName: "Smith",
        dob: "2018-02-10",
        relationship: "child",
      },
    });
    created.dependantIds.push(dep.id);

    // Appointment with triage data
    const apt = await prisma.appointment.create({
      data: {
        patientId: profile1.id,
        serviceId: service.id,
        clinicId: clinic.id,
        clinicianId: clinician.id,
        channel: "clinic",
        startTimeUtc: new Date(Date.now() + 86400000),
        endTimeUtc: new Date(Date.now() + 86400000 + 30 * 60000),
        status: "confirmed",
        triageData: { symptoms: ["toothache"], painLevel: 7 },
        totalPricePence: 5000,
        depositPaidPence: 2000,
      },
    });
    created.appointmentIds.push(apt.id);

    // ToothRecord
    const tooth = await prisma.toothRecord.create({
      data: {
        patientId: profile1.id,
        toothNumber: 14,
        arch: "upper",
        quadrant: "upper_left",
        condition: "filled",
      },
    });
    created.toothRecordIds.push(tooth.id);

    // Treatment plan with item
    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId: profile1.id,
        clinicianId: clinician.id,
        title: "Comprehensive Restorative Plan",
        status: "proposed",
        totalCostPence: 8500,
        items: {
          create: [{ code: "FILL-01", description: "Composite Filling", costPence: 8500 }],
        },
      },
    });
    created.treatmentPlanIds.push(plan.id);

    // Prescription
    const rx = await prisma.prescription.create({
      data: {
        appointmentId: apt.id,
        clinicianId: clinician.id,
        medicationName: "Amoxicillin 500mg",
        dosageInstructions: "Take one capsule 3 times daily for 5 days",
        dispensingPharmacy: "Boots Pharmacy Central",
        dispatchedAt: new Date(),
        reference: "RX-CS24-TEST",
      },
    });
    created.prescriptionIds.push(rx.id);

    // MessageThread & Message
    const thread = await prisma.messageThread.create({
      data: {
        patientUserId: user1.id,
        senderName: "Support Desk",
        subject: "Pre-appointment query",
        preview: "Do I need to fast before visit?",
        messages: {
          create: [{ senderRole: "patient", senderName: "Alice", body: "Do I need to fast before visit?" }],
        },
      },
    });
    created.messageThreadIds.push(thread.id);

    // VanServiceRequest
    // Its own operator, van and shift. This used to borrow whatever van and
    // shift were first in the shared test database, so the request below could
    // end up pointing at another suite's shift, and that suite's cleanup then
    // failed on the foreign key. The shift is already ended, so nothing treats
    // it as a van that is out.
    const operatorUser = await prisma.user.create({
      data: { email: `cs24-operator-${tag}@example.test`, passwordHash: "x", role: "operator" },
    });
    const operator = await prisma.operatorProfile.create({ data: { userId: operatorUser.id, fullName: "Synthetic SAR Operator" } });
    created.operatorIds.push(operator.id);
    const van = await prisma.van.create({
      data: { name: `Synthetic SAR Van ${tag}`, registrationPlate: `SAR${tag}`, vehicleModel: "Synthetic" },
    });
    created.vanIds.push(van.id);
    const shift = await prisma.vanShift.create({
      data: {
        vanId: van.id,
        operatorId: operator.id,
        status: "offline",
        startedAt: new Date(Date.now() - 3_600_000),
        endedAt: new Date(),
      },
    });
    created.shiftIds.push(shift.id);

    const vanReq = await prisma.vanServiceRequest.create({
      data: {
        patientId: profile1.id,
        vanId: van.id,
        shiftId: shift.id,
        serviceId: service.id,
        patientLat: 51.5014,
        patientLng: -0.1419,
        accessDetails: { notes: "10 Downing St, London" },
        status: "pending",
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    created.vanRequestIds.push(vanReq.id);

    // SavedPaymentMethod
    const spm = await prisma.savedPaymentMethod.create({
      data: {
        userId: user1.id,
        stripePaymentMethodId: `pm_cs24_${tag}`,
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2028,
        isDefault: true,
      },
    });
    created.paymentMethodIds.push(spm.id);

    // FinancingApplication
    const fa = await prisma.financingApplication.create({
      data: {
        userId: user1.id,
        treatmentCostPence: 8500,
        durationMonths: 12,
        monthlyPence: 750,
        agreementRef: `AGREE-${tag}`,
        status: "approved",
      },
    });
    created.financingIds.push(fa.id);

    // RewardPointsAward & Redemption
    const award = await prisma.rewardPointsAward.create({
      data: {
        userId: user1.id,
        appointmentId: apt.id,
        points: 500,
      },
    });
    created.rewardAwardIds.push(award.id);

    const redeem = await prisma.rewardRedemption.create({
      data: {
        userId: user1.id,
        rewardId: "deposit_voucher",
        rewardTitle: "£5 Deposit Voucher",
        pointsCost: 500,
        voucherCode: `VOUCHER-${tag}`,
        discountPence: 500,
      },
    });
    created.rewardRedeemIds.push(redeem.id);

    // WaitlistEntry
    const waitlist = await prisma.waitlistEntry.create({
      data: {
        userId: user1.id,
        serviceId: service.id,
        preferredDate: "2026-11-01",
        position: 1,
      },
    });
    created.waitlistIds.push(waitlist.id);

    // OralHealthMetric
    const metric = await prisma.oralHealthMetric.create({
      data: {
        userId: user1.id,
        pointsBalance: 100,
        streakDays: 5,
      },
    });
    created.metricIds.push(metric.id);

    // ConsentRecord
    const consent = await prisma.consentRecord.create({
      data: {
        patientProfileId: profile1.id,
        consentType: "clinical_records",
        version: 1,
        lawfulBasis: "consent",
        isGranted: true,
        grantedAt: new Date(),
      },
    });
    created.consentIds.push(consent.id);
  });

  afterAll(async () => {
    // Teardown created records
    if (created.consentIds.length) await prisma.consentRecord.deleteMany({ where: { id: { in: created.consentIds } } }).catch(() => {});
    if (created.metricIds.length) await prisma.oralHealthMetric.deleteMany({ where: { id: { in: created.metricIds } } }).catch(() => {});
    if (created.waitlistIds.length) await prisma.waitlistEntry.deleteMany({ where: { id: { in: created.waitlistIds } } }).catch(() => {});
    if (created.rewardRedeemIds.length) await prisma.rewardRedemption.deleteMany({ where: { id: { in: created.rewardRedeemIds } } }).catch(() => {});
    if (created.rewardAwardIds.length) await prisma.rewardPointsAward.deleteMany({ where: { id: { in: created.rewardAwardIds } } }).catch(() => {});
    if (created.financingIds.length) await prisma.financingApplication.deleteMany({ where: { id: { in: created.financingIds } } }).catch(() => {});
    if (created.paymentMethodIds.length) await prisma.savedPaymentMethod.deleteMany({ where: { id: { in: created.paymentMethodIds } } }).catch(() => {});
    if (created.vanRequestIds.length) await prisma.vanServiceRequest.deleteMany({ where: { id: { in: created.vanRequestIds } } }).catch(() => {});
    if (created.shiftIds.length) await prisma.vanShift.deleteMany({ where: { id: { in: created.shiftIds } } }).catch(() => {});
    if (created.vanIds.length) await prisma.van.deleteMany({ where: { id: { in: created.vanIds } } }).catch(() => {});
    if (created.operatorIds.length) await prisma.operatorProfile.deleteMany({ where: { id: { in: created.operatorIds } } }).catch(() => {});
    if (created.messageThreadIds.length) {
      await prisma.message.deleteMany({ where: { threadId: { in: created.messageThreadIds } } }).catch(() => {});
      await prisma.messageThread.deleteMany({ where: { id: { in: created.messageThreadIds } } }).catch(() => {});
    }
    if (created.prescriptionIds.length) await prisma.prescription.deleteMany({ where: { id: { in: created.prescriptionIds } } }).catch(() => {});
    if (created.appointmentIds.length) await prisma.appointment.deleteMany({ where: { id: { in: created.appointmentIds } } }).catch(() => {});
    if (created.treatmentPlanIds.length) {
      await prisma.treatmentPlanItem.deleteMany({ where: { treatmentPlanId: { in: created.treatmentPlanIds } } }).catch(() => {});
      await prisma.treatmentPlan.deleteMany({ where: { id: { in: created.treatmentPlanIds } } }).catch(() => {});
    }
    if (created.toothRecordIds.length) await prisma.toothRecord.deleteMany({ where: { id: { in: created.toothRecordIds } } }).catch(() => {});
    if (created.dependantIds.length) await prisma.dependant.deleteMany({ where: { id: { in: created.dependantIds } } }).catch(() => {});
    await prisma.documentVault.deleteMany({ where: { patientId: { in: created.profileIds } } }).catch(() => {});
    await new Promise<void>((resolve) => appServer.close(() => resolve()));
  });

  describe("SAR-1: Model Registry & Entity Completeness", () => {
    it("fails when any schema model is not classified in the SAR registry", () => {
      const coverage = verifyModelCoverage();
      expect(coverage.totalModels).toBeGreaterThan(30);
      expect(coverage.coveredModels.length + coverage.excludedModels.length).toBe(coverage.totalModels);
    });

    it("extracts all personal data entities into the SAR bundle", async () => {
      const bundle = await buildSubjectAccessRequestBundle(prisma, {
        userId: patientUserId,
        profileId: patientProfileId,
      });

      expect(bundle.user).toBeDefined();
      expect(bundle.profile).toBeDefined();
      expect(bundle.dependants).toHaveLength(1);
      expect((bundle.dependants[0] as any).firstName).toBe("Charlie");

      expect(bundle.appointments).toHaveLength(1);
      expect((bundle.appointments[0] as any).triageData).toEqual({ symptoms: ["toothache"], painLevel: 7 });

      expect(bundle.odontogram).toHaveLength(1);
      expect((bundle.odontogram[0] as any).toothNumber).toBe(14);

      expect(bundle.treatmentPlans).toHaveLength(1);
      expect((bundle.treatmentPlans[0] as any).items).toHaveLength(1);

      expect(bundle.prescriptions).toHaveLength(1);
      expect((bundle.prescriptions[0] as any).medicationName).toBe("Amoxicillin 500mg");

      expect(bundle.messageThreads).toHaveLength(1);
      expect(bundle.messages).toHaveLength(1);
      expect((bundle.messages[0] as any).body).toBe("Do I need to fast before visit?");

      expect(bundle.vanServiceRequests).toHaveLength(1);
      expect((bundle.vanServiceRequests[0] as any).accessDetails).toEqual({ notes: "10 Downing St, London" });

      expect(bundle.savedPaymentMethods).toHaveLength(1);
      expect((bundle.savedPaymentMethods[0] as any).last4).toBe("4242");

      expect(bundle.financingApplications).toHaveLength(1);
      expect(bundle.rewardPointsAwards).toHaveLength(1);
      expect(bundle.rewardRedemptions).toHaveLength(1);
      expect(bundle.waitlistEntries).toHaveLength(1);
      expect(bundle.oralHealthMetrics).toHaveLength(1);
      expect(bundle.consents.length).toBeGreaterThanOrEqual(1);
    });

    it("includes clinical and personal data in the CSV export variant", async () => {
      const res = await fetch(`${appUrl}/api/consents/data-access-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${patientToken}`,
        },
        body: JSON.stringify({ format: "csv" }),
      });

      expect(res.status).toBe(202);
      const data = (await res.json()) as any;
      expect(data.documentId).toBeDefined();
      expect(data.recordCounts.appointments).toBeGreaterThanOrEqual(1);
      expect(data.recordCounts.prescriptions).toBeGreaterThanOrEqual(1);
      expect(data.recordCounts.dependants).toBeGreaterThanOrEqual(1);

      // Verify the generated CSV file contains clinical sections
      const doc = await prisma.documentVault.findUniqueOrThrow({
        where: { id: data.documentId },
      });
      const file = await objectStorage.download(doc.fileKey);
      const csvContent = file.buffer.toString("utf8");

      expect(csvContent).toContain('"prescription"');
      expect(csvContent).toContain("Amoxicillin 500mg");
      expect(csvContent).toContain('"appointment"');
      expect(csvContent).toContain('"odontogram"');
      expect(csvContent).toContain('"dependant"');
      expect(csvContent).toContain("Charlie");
    });
  });

  describe("SAR-2 & OS-3: Email Safety & Bearer URL Elimination", () => {
    it("escapes user firstName in HTML and eliminates 15-minute bearer download links from email", async () => {
      lastSentEmail = null;

      const res = await fetch(`${appUrl}/api/consents/data-access-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${patientToken}`,
        },
        body: JSON.stringify({ format: "json" }),
      });

      expect(res.status).toBe(202);
      expect(lastSentEmail).not.toBeNull();

      // SAR-2: HTML escaping
      expect(lastSentEmail.html).not.toContain("<script>alert(1)</script>");
      expect(lastSentEmail.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");

      // OS-3 / SAR-2: No raw expiring bearer URL in email
      expect(lastSentEmail.html).not.toContain("?expires=");
      expect(lastSentEmail.html).not.toContain("Download URL (expires in 15 minutes)");
      expect(lastSentEmail.html).toContain("Document Vault");
    });
  });

  describe("OS-3: Authenticated Document Download (Permanent Access)", () => {
    it("allows authenticated patient to download SAR bundle at any time", async () => {
      // 1. Generate SAR bundle
      const res = await fetch(`${appUrl}/api/consents/data-access-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${patientToken}`,
        },
        body: JSON.stringify({ format: "json" }),
      });
      const data = (await res.json()) as any;
      const documentId = data.documentId;

      // 2. Patient downloads document via authenticated route
      const downloadRes = await fetch(
        `${appUrl}/api/patients/${patientProfileId}/documents/${documentId}/download`,
        {
          headers: { Authorization: `Bearer ${patientToken}` },
        }
      );

      expect(downloadRes.status).toBe(200);
      expect(downloadRes.headers.get("Content-Type")).toBe("application/json");
      expect(downloadRes.headers.get("X-Content-Type-Options")).toBe("nosniff");
      const bundle = (await downloadRes.json()) as any;
      expect(bundle.standard).toBe("UK GDPR Article 15 Subject Access Request (DSAR)");
      expect(bundle.prescriptions).toHaveLength(1);
    });

    it("denies access to document download without authentication or for another patient", async () => {
      // Fetch documents of patient 1
      const doc = await prisma.documentVault.findFirstOrThrow({
        where: { patientId: patientProfileId },
      });

      // No auth
      const noAuthRes = await fetch(
        `${appUrl}/api/patients/${patientProfileId}/documents/${doc.id}/download`
      );
      expect(noAuthRes.status).toBe(401);

      // Other patient
      const otherAuthRes = await fetch(
        `${appUrl}/api/patients/${patientProfileId}/documents/${doc.id}/download`,
        {
          headers: { Authorization: `Bearer ${otherPatientToken}` },
        }
      );
      expect(otherAuthRes.status).toBe(403);
    });

    it("keeps the SAR bundle from a clinician who can see the rest of the record", async () => {
      const sar = await prisma.documentVault.findFirstOrThrow({
        where: { patientId: patientProfileId, docType: "gdpr_sar_export" },
      });
      // The seeded clinician has an appointment with this patient, so a care relationship.
      const clinician = await prisma.clinicianProfile.findFirstOrThrow();
      const clinicianToken = signAccessToken({
        sub: clinician.userId,
        role: "clinician",
        sessionId: crypto.randomUUID(),
      });
      const headers = { Authorization: `Bearer ${clinicianToken}` };

      const list = await fetch(`${appUrl}/api/patients/${patientProfileId}/documents`, { headers });
      expect(list.status).toBe(200);
      const docs = (await list.json()) as Array<{ id: string; docType: string }>;
      expect(docs.some((d) => d.docType === "gdpr_sar_export")).toBe(false);

      const download = await fetch(
        `${appUrl}/api/patients/${patientProfileId}/documents/${sar.id}/download`,
        { headers }
      );
      expect(download.status).toBe(404);
    });
  });
});
