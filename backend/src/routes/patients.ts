import crypto from "crypto";
import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { requirePatientRecordAccess, requireActiveAppointmentContext } from "../middleware/patient-access";
import { ageInYears, DEPENDANT_MAX_AGE, parseIsoDate } from "../lib/age";
import { validateParams, validateBody } from "../middleware/validate";
import {
  patientIdParamsSchema,
  patientDocParamsSchema,
  updatePatientProfileSchema,
  updateOdontogramSchema,
  createTreatmentPlanSchema,
  planActionParamsSchema,
  signTreatmentPlanSchema,
  requestPhoneChangeSchema,
  verifyPhoneChangeSchema,
} from "../schemas/patients";
import { otpService, phoneChangePurpose, rateLimiter } from "../lib/otp-service";
import { objectStorage } from "../lib/object-storage";
import { pseudonymiseIp } from "../lib/audit-security";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { encryptField, decryptField, decryptString, isEncryptedEnvelope } from "../lib/encryption";

const router = Router();

function pid(req: AuthRequest) {
  return String(req.params.id);
}

// CS-09 (PT-1, PT-2): a patient's own details, and their answer to a treatment
// plan, are the patient's alone. A clinician with access to the record can
// read them but can't change the login phone or accept a plan on their behalf.
function requirePatientSelf(req: AuthRequest, res: Response, action: string): boolean {
  if (req.user!.role === "patient") return true;
  res.status(403).json({ error: `Only the patient can ${action}` });
  return false;
}

// A patient's own copy of their data (SAR bundle) is theirs alone, even for
// clinicians who may otherwise see the record.
const PATIENT_ONLY_DOC_TYPES = ["gdpr_sar_export"];

function visibleDocTypes(req: AuthRequest) {
  return req.user!.role === "patient" ? {} : { docType: { notIn: PATIENT_ONLY_DOC_TYPES } };
}

// A plan can be accepted or declined once, while it's waiting for an answer.
const OPEN_PLAN_STATUSES = ["pending_acceptance", "proposed"];

// ─── GET /api/patients/:id/profile ───────────────────────────────────────────
router.get("/:id/profile", requireAuth, validateParams(patientIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const requestedId = pid(req);
  const profile = await requirePatientRecordAccess(req, res);
  if (!profile) return;

  const user = await prisma.user.findUnique({
    where: { id: profile.userId },
    select: { email: true, phone: true },
  });

  // PT-4: Single source of truth for consent — read from ConsentRecord
  const consentRecords = await prisma.consentRecord.findMany({
    where: { patientProfileId: profile.id, isGranted: true },
    select: {
      consentType: true,
      version: true,
      grantedAt: true,
      lawfulBasis: true,
    },
  });
  const activeConsentsMap: Record<string, boolean> = {};
  for (const c of consentRecords) {
    activeConsentsMap[c.consentType] = true;
  }
  const resolvedConsents = consentRecords.length > 0
    ? activeConsentsMap
    : (profile.consents as Record<string, unknown> | null) ?? {};

  return res.json({
    id: requestedId,
    profileId: profile.id,
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dob: profile.dob,
    gender: profile.gender,
    email: user?.email,
    phone: user?.phone,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    city: profile.city,
    postcode: profile.postcode,
    address: {
      line1: profile.addressLine1,
      line2: profile.addressLine2,
      city: profile.city,
      postcode: profile.postcode,
    },
    emergencyContact: {
      name: profile.emergencyContactName,
      phone: profile.emergencyContactPhone,
    },
    medicalHistory: await decryptField(profile.medicalHistory),
    consents: resolvedConsents,
    consentRecords,
  });
});

// ─── PUT /api/patients/:id/profile ───────────────────────────────────────────
router.put("/:id/profile", requireAuth, validateParams(patientIdParamsSchema), validateBody(updatePatientProfileSchema), async (req: AuthRequest, res: Response) => {
  const requestedId = pid(req);
  const profile = await requirePatientRecordAccess(req, res);
  if (!profile) return;
  if (!requirePatientSelf(req, res, "change their own details")) return;

  const {
    firstName, lastName, dob, gender,
    addressLine1, addressLine2, city, postcode,
    phone, phoneOtp,
    emergencyContactName, emergencyContactPhone,
    medicalHistory,
  } = req.body;

  if (dob) {
    const parsed = parseIsoDate(dob);
    if (!parsed || parsed.getTime() > Date.now()) {
      return res.status(400).json({ error: "Enter a valid date of birth" });
    }
    // Under-16s are added by a parent or guardian (decisions log #17).
    if (ageInYears(parsed) < DEPENDANT_MAX_AGE) {
      return res.status(422).json({
        error: "Patients under 16 need a parent or guardian to add them from the guardian's account.",
      });
    }
  }

  // DB-3: Encrypt medicalHistory at rest
  let storedMedicalHistory: any = undefined;
  if (medicalHistory !== undefined) {
    storedMedicalHistory = medicalHistory !== null
      ? (isEncryptedEnvelope(medicalHistory) ? medicalHistory : await encryptField(medicalHistory))
      : null;
  }

  // CS-54 (CS-08): Check phone change verification
  const existingUser = await prisma.user.findUnique({
    where: { id: profile.userId },
    select: { phone: true, phoneVerified: true },
  });

  let newPhoneVerified = existingUser?.phoneVerified ?? false;
  if (phone !== undefined && phone !== existingUser?.phone) {
    if (phoneOtp) {
      const valid = await otpService.verifyOTP(profile.userId, phoneOtp, phoneChangePurpose(phone));
      if (!valid) {
        return res.status(400).json({ error: "Invalid or expired phone verification code" });
      }
      newPhoneVerified = true;
    } else {
      // Changing phone without OTP verification resets phoneVerified to false
      newPhoneVerified = false;
    }
  }

  // PT-4: Consents are NOT mutable via profile PUT. One source of truth in ConsentRecord.
  const [updated] = await prisma.$transaction([
    prisma.patientProfile.update({
      where: { id: profile.id },
      data: {
        firstName, lastName,
        dob: dob ? new Date(dob) : undefined,
        gender,
        addressLine1, addressLine2: addressLine2 ?? null, city, postcode,
        emergencyContactName, emergencyContactPhone,
        medicalHistory: storedMedicalHistory,
      },
    }),
    ...(phone !== undefined ? [prisma.user.update({
      where: { id: profile.userId },
      data: { phone, phoneVerified: newPhoneVerified },
    })] : []),
  ]);

  return res.json({
    id: requestedId,
    profileId: updated.id,
    userId: updated.userId,
    firstName: updated.firstName,
    lastName: updated.lastName,
    dob: updated.dob,
    gender: updated.gender,
    addressLine1: updated.addressLine1,
    addressLine2: updated.addressLine2,
    city: updated.city,
    postcode: updated.postcode,
    address: {
      line1: updated.addressLine1,
      line2: updated.addressLine2,
      city: updated.city,
      postcode: updated.postcode,
    },
    emergencyContact: {
      name: updated.emergencyContactName,
      phone: updated.emergencyContactPhone,
    },
    updatedAt: updated.updatedAt,
  });
});

// ─── POST /api/patients/:id/phone/request ────────────────────────────────────
// CS-54: Request OTP to verify a new phone number before updating
router.post("/:id/phone/request", requireAuth, validateParams(patientIdParamsSchema), validateBody(requestPhoneChangeSchema), async (req: AuthRequest, res: Response) => {
  const profile = await requirePatientRecordAccess(req, res);
  if (!profile) return;
  if (!requirePatientSelf(req, res, "request a phone number change")) return;

  const { newPhone } = req.body;
  const rateLimitKey = `phone-change-req:${profile.userId}`;
  if (await rateLimiter.isRateLimited(rateLimitKey, 5, 3600)) {
    return res.status(429).json({ error: "Too many phone change requests. Please try again later." });
  }

  const { delivered } = await otpService.createAndSendOTP({
    userId: profile.userId,
    phone: newPhone,
    purpose: phoneChangePurpose(newPhone),
    deliveryMethod: "sms",
  });

  if (!delivered) {
    return res.status(502).json({ error: "Could not send verification code to the new phone number" });
  }

  return res.json({ message: "Verification code sent to new phone number" });
});

// ─── POST /api/patients/:id/phone/verify ─────────────────────────────────────
// CS-54: Verify OTP for the new phone and update user phone + phoneVerified: true
router.post("/:id/phone/verify", requireAuth, validateParams(patientIdParamsSchema), validateBody(verifyPhoneChangeSchema), async (req: AuthRequest, res: Response) => {
  const profile = await requirePatientRecordAccess(req, res);
  if (!profile) return;
  if (!requirePatientSelf(req, res, "verify a phone number change")) return;

  const { newPhone, code } = req.body;
  const rateLimitKey = `phone-change-ver:${profile.userId}`;
  if (await rateLimiter.isRateLimited(rateLimitKey, 5, 900)) {
    return res.status(429).json({ error: "Too many attempts. Please try again later." });
  }

  // The code only verifies the number it was sent to.
  const valid = await otpService.verifyOTP(profile.userId, code, phoneChangePurpose(newPhone));
  if (!valid) {
    return res.status(400).json({ error: "Invalid or expired verification code" });
  }

  await prisma.user.update({
    where: { id: profile.userId },
    data: { phone: newPhone, phoneVerified: true },
  });

  return res.json({
    message: "Phone number updated and verified",
    phone: newPhone,
    phoneVerified: true,
  });
});

// ─── GET /api/patients/:id/odontogram ────────────────────────────────────────
router.get("/:id/odontogram", requireAuth, validateParams(patientIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const profile = await requirePatientRecordAccess(req, res);
  if (!profile) return;

  const teeth = await prisma.toothRecord.findMany({
    where: { patientId: profile.id },
    orderBy: { toothNumber: "asc" },
  });

  const decryptedTeeth = await Promise.all(
    teeth.map(async (t) => ({
      ...t,
      notes: t.notes ? await decryptString(t.notes) : null,
    }))
  );

  return res.json(decryptedTeeth);
});

// ─── GET /api/patients/:id/odontogram/history ────────────────────────────────
// Append-only history of tooth record changes (PT-3)
router.get("/:id/odontogram/history", requireAuth, validateParams(patientIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const profile = await requirePatientRecordAccess(req, res);
  if (!profile) return;

  const history = await prisma.toothHistory.findMany({
    where: { patientId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const decryptedHistory = await Promise.all(
    history.map(async (h) => ({
      ...h,
      id: String(h.id),
      notes: h.notes ? await decryptString(h.notes) : null,
    }))
  );

  return res.json(decryptedHistory);
});

// ─── PUT /api/patients/:id/odontogram ────────────────────────────────────────
router.put("/:id/odontogram", requireAuth, validateParams(patientIdParamsSchema), validateBody(updateOdontogramSchema), async (req: AuthRequest, res: Response) => {
  const context = await requireActiveAppointmentContext(req, res);
  if (!context) return;

  const { profile, appointmentId } = context;
  const { teeth } = req.body;

  const clinician = await prisma.clinicianProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { id: true },
  });

  const encryptedTeeth = await Promise.all(
    teeth.map(async (t: { toothNumber: number; arch: string; quadrant: string; condition: string; notes?: string }) => {
      const encryptedNotes = t.notes ? JSON.stringify(await encryptField(t.notes)) : null;
      return { ...t, encryptedNotes };
    })
  );

  const upserts = encryptedTeeth.map((t) =>
    prisma.toothRecord.upsert({
      where: { patientId_toothNumber: { patientId: profile.id, toothNumber: t.toothNumber } },
      update: { condition: t.condition as any, notes: t.encryptedNotes },
      create: {
        patientId: profile.id,
        toothNumber: t.toothNumber,
        arch: t.arch,
        quadrant: t.quadrant,
        condition: t.condition as any,
        notes: t.encryptedNotes,
      },
    })
  );

  // PT-3: Append-only tooth history
  const historyInserts = encryptedTeeth.map((t) =>
    prisma.toothHistory.create({
      data: {
        patientId: profile.id,
        toothNumber: t.toothNumber,
        arch: t.arch,
        quadrant: t.quadrant,
        condition: t.condition as any,
        notes: t.encryptedNotes,
        appointmentId: appointmentId || null,
        recordedBy: clinician?.id || null,
      },
    })
  );

  await prisma.$transaction([...upserts, ...historyInserts]);

  // PT-3: Audit odontogram update with cryptographic integrity
  await createAuditLogWithIntegrity({
    action: "patient.odontogram.updated",
    actorId: req.user!.sub,
    resourceId: profile.id,
    metadata: {
      patientId: profile.id,
      appointmentId: appointmentId || null,
      teethUpdated: teeth.map((t: any) => ({ toothNumber: t.toothNumber, condition: t.condition })),
    },
  }).catch(() => {});

  return res.json({ message: "Odontogram updated", count: teeth.length, appointmentId });
});

// ─── GET /api/patients/:id/plans ──────────────────────────────────────────────
router.get("/:id/plans", requireAuth, validateParams(patientIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const profile = await requirePatientRecordAccess(req, res);
  if (!profile) return;

  const plans = await prisma.treatmentPlan.findMany({
    where: { patientId: profile.id },
    include: {
      items: true,
      clinician: { select: { fullName: true, roleTitle: true, gdcNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(plans);
});

// ─── POST /api/patients/:id/plans ────────────────────────────────────────────
router.post("/:id/plans", requireAuth, validateParams(patientIdParamsSchema), validateBody(createTreatmentPlanSchema), async (req: AuthRequest, res: Response) => {
  const context = await requireActiveAppointmentContext(req, res);
  if (!context) return;

  const { profile, appointmentId } = context;
  const clinician = await prisma.clinicianProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { id: true },
  });
  if (!clinician) return res.status(403).json({ error: "No clinician profile found" });

  const { title, items } = req.body;

  const totalCostPence = items.reduce((sum: number, i: { costPence: number }) => sum + i.costPence, 0);

  const plan = await prisma.treatmentPlan.create({
    data: {
      patientId: profile.id,
      clinicianId: clinician.id,
      title,
      totalCostPence,
      items: { create: items },
    },
    include: { items: true },
  });

  // PT-3: Audit treatment plan creation with cryptographic integrity
  await createAuditLogWithIntegrity({
    action: "treatment_plan.created",
    actorId: req.user!.sub,
    resourceId: plan.id,
    metadata: {
      patientId: profile.id,
      appointmentId,
      title,
      totalCostPence,
      itemCount: items.length,
    },
  }).catch(() => {});

  return res.status(201).json({ ...plan, appointmentId });
});

// ─── POST /api/patients/:id/plans/:planId/sign ──────────────────────────────
// Cryptographically signs & accepts a treatment plan (GDC Principle 2 compliance)
router.post(
  "/:id/plans/:planId/sign",
  requireAuth,
  validateParams(planActionParamsSchema),
  validateBody(signTreatmentPlanSchema),
  async (req: AuthRequest, res: Response) => {
    const profile = await requirePatientRecordAccess(req, res);
    if (!profile) return;
    if (!requirePatientSelf(req, res, "accept their treatment plan")) return;

    const planId = String(req.params.planId);
    const { signatureData } = req.body;
    // The signer is the signed-in patient, whatever name the client sends.
    const signerName = `${profile.firstName} ${profile.lastName}`.trim();

    const plan = await prisma.treatmentPlan.findFirst({
      where: { id: planId, patientId: profile.id },
      include: { items: true, clinician: { select: { fullName: true, gdcNumber: true } } },
    });

    if (!plan) {
      return res.status(404).json({ error: "Treatment plan not found" });
    }
    if (!OPEN_PLAN_STATUSES.includes(plan.status)) {
      return res.status(409).json({ error: "This plan has already been answered", code: "PLAN_NOT_OPEN" });
    }

    const device = String(req.headers["user-agent"] || "unknown").slice(0, 500);
    const signedAt = new Date();

    // Canonical representation of what was shown to the patient (plan version hash per BE-18)
    const planVersionPayload = JSON.stringify({
      planId: plan.id,
      title: plan.title,
      totalCostPence: plan.totalCostPence,
      items: plan.items.map((it) => ({
        code: it.code,
        description: it.description,
        toothNumber: it.toothNumber,
        costPence: it.costPence,
      })),
      createdAtIso: plan.createdAt.toISOString(),
    });
    const planVersionHash = crypto.createHash("sha256").update(planVersionPayload).digest("hex");

    const canonicalPayload = JSON.stringify({
      planId: plan.id,
      patientId: profile.id,
      signerName,
      device,
      planVersionHash,
      totalCostPence: plan.totalCostPence,
      items: plan.items.map((it) => ({ code: it.code, costPence: it.costPence, toothNumber: it.toothNumber })),
      signedAtIso: signedAt.toISOString(),
      acknowledgementText: "I've read this plan; consent to treatment is taken in person",
    });

    const signatureHash = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
    const storedSignature = JSON.stringify({
      signerName,
      signatureHash,
      planVersionHash,
      device,
      signatureData: signatureData || `ACKNOWLEDGED:${signerName}`,
      signedAtIso: signedAt.toISOString(),
      acknowledgementText: "I've read this plan; consent to treatment is taken in person",
    });

    // Conditional on the status, so two answers sent at once can't both apply.
    const { count } = await prisma.treatmentPlan.updateMany({
      where: { id: plan.id, status: { in: OPEN_PLAN_STATUSES } },
      data: {
        status: "accepted",
        patientSignature: storedSignature,
        patientSignedAt: signedAt,
      },
    });
    if (count === 0) {
      return res.status(409).json({ error: "This plan has already been answered", code: "PLAN_NOT_OPEN" });
    }
    const updatedPlan = await prisma.treatmentPlan.findUniqueOrThrow({
      where: { id: plan.id },
      include: { items: true, clinician: { select: { fullName: true, roleTitle: true, gdcNumber: true } } },
    });

    // Persist signed certificate in DocumentVault
    const certKey = `plans/${profile.id}/treatment-plan-${plan.id}-signed.json`;
    const uploadedCert = await objectStorage.upload(certKey, canonicalPayload, "application/json", {
      planId: plan.id,
      signatureHash,
      planVersionHash,
    });

    await prisma.documentVault.create({
      data: {
        patientId: profile.id,
        docType: "treatment_plan_acknowledgement",
        title: `Treatment Plan Acknowledgement — ${plan.title}`,
        fileKey: uploadedCert.key,
        fileSizeBytes: String(uploadedCert.size),
      },
    });

    await createAuditLogWithIntegrity({
      action: "treatment_plan.signed",
      actorId: req.user!.sub,
      resourceId: plan.id,
      sessionId: req.user!.sessionId,
      ipHash: pseudonymiseIp(req.ip || ""),
      metadata: {
        signatureHash,
        planVersionHash,
        device,
        totalCostPence: plan.totalCostPence,
      },
    });

    return res.json({
      ...updatedPlan,
      signatureHash: `SHA256:${signatureHash.slice(0, 16)}`,
      planVersionHash: `SHA256:${planVersionHash.slice(0, 16)}`,
      signerName,
      signedAt: signedAt.toISOString(),
      device,
    });
  }
);

// ─── POST /api/patients/:id/plans/:planId/decline ───────────────────────────
router.post(
  "/:id/plans/:planId/decline",
  requireAuth,
  validateParams(planActionParamsSchema),
  async (req: AuthRequest, res: Response) => {
    const profile = await requirePatientRecordAccess(req, res);
    if (!profile) return;
    if (!requirePatientSelf(req, res, "decline their treatment plan")) return;

    const planId = String(req.params.planId);
    const plan = await prisma.treatmentPlan.findFirst({
      where: { id: planId, patientId: profile.id },
    });

    if (!plan) {
      return res.status(404).json({ error: "Treatment plan not found" });
    }

    const { count } = await prisma.treatmentPlan.updateMany({
      where: { id: plan.id, status: { in: OPEN_PLAN_STATUSES } },
      data: { status: "declined" },
    });
    if (count === 0) {
      return res.status(409).json({ error: "This plan has already been answered", code: "PLAN_NOT_OPEN" });
    }
    const updatedPlan = await prisma.treatmentPlan.findUniqueOrThrow({
      where: { id: plan.id },
      include: { items: true },
    });

    await createAuditLogWithIntegrity({
      action: "treatment_plan.declined",
      actorId: req.user!.sub,
      resourceId: plan.id,
      sessionId: req.user!.sessionId,
      ipHash: pseudonymiseIp(req.ip || ""),
      metadata: {},
    });

    return res.json(updatedPlan);
  }
);

// ─── GET /api/patients/:id/documents ─────────────────────────────────────────
router.get("/:id/documents", requireAuth, validateParams(patientIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const profile = await requirePatientRecordAccess(req, res);
  if (!profile) return;

  const docs = await prisma.documentVault.findMany({
    where: { patientId: profile.id, ...visibleDocTypes(req) },
    orderBy: { createdAt: "desc" },
  });

  const result = await Promise.all(
    docs.map(async (d) => {
      const signed = await objectStorage.getSignedUrl(d.fileKey, 900); // 15-minute TTL
      return {
        id: d.id,
        docType: d.docType,
        title: d.title,
        fileSizeBytes: d.fileSizeBytes,
        createdAt: d.createdAt,
        downloadUrl: signed.url,
        expiresAt: signed.expiresAt.toISOString(),
      };
    })
  );

  return res.json(result);
});

// ─── GET /api/patients/:id/documents/:docId/download ─────────────────────────
// Authenticated stream download for Document Vault files (SAR exports, X-rays, etc.)
// Closes OS-3: allows patient to download anytime while authenticated.
router.get(
  "/:id/documents/:docId/download",
  requireAuth,
  validateParams(patientDocParamsSchema),
  async (req: AuthRequest, res: Response) => {
    const profile = await requirePatientRecordAccess(req, res);
    if (!profile) return;

    const docId = String(req.params.docId);
    const doc = await prisma.documentVault.findFirst({
      where: { id: docId, patientId: profile.id, ...visibleDocTypes(req) },
    });

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    try {
      const file = await objectStorage.download(doc.fileKey);
      const filename = doc.fileKey.split("/").pop() || "document";
      res.setHeader("Content-Type", file.contentType || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
      return res.send(file.buffer);
    } catch {
      return res.status(404).json({ error: "Document binary not found" });
    }
  }
);

export default router;
