import { Router, Response } from "express";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validate";
import { createPrescriptionSchema, prescriptionIdParamsSchema, userIdParamsSchema } from "../schemas/prescriptions";
import { pseudonymiseIp } from "../lib/audit-security";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { hasCareRelationship } from "../middleware/patient-access";
import { ageInYears, parseIsoDate } from "../lib/age";
import { LIST_CAPS } from "../lib/list-caps";
import {
  newPrescriptionReference,
  prescriptionDownloadToken,
  prescriptionSigningKey,
  PrescriptionContent,
  signPrescription,
} from "../lib/prescription-document";

/**
 * CS-35: Enforces prescribing role authorization.
 * Only registered dentists and dental surgeons may issue private prescriptions.
 * Non-prescribing roles (such as dental hygienists and nurses) are barred.
 */
export function isPrescribingRole(roleTitle?: string | null): boolean {
  if (!roleTitle) return false;
  const normalized = roleTitle.toLowerCase();
  if (/\b(nurse|hygienist|technician|receptionist|assistant)\b/.test(normalized)) {
    return false;
  }
  return /\b(dentist|dental surgeon|surgeon|practitioner|doctor|director|specialist|orthodontist|endodontist|periodontist|prosthodontist)\b/.test(normalized);
}

const router = Router();

// ─── POST /api/prescriptions ──────────────────────────────────────────────────
// Issues a private prescription as a signed PDF (decisions log #4). Nothing is
// sent to NHS EPS or to a pharmacy: the patient downloads the PDF.
router.post("/", requireAuth, validateBody(createPrescriptionSchema), async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "clinician") {
    return res.status(403).json({ error: "Only clinicians can issue prescriptions" });
  }

  const { appointmentId, patientId, medicationName, dosageInstructions, dispensingPharmacy } = req.body;

  const clinician = await prisma.clinicianProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { id: true, fullName: true, gdcNumber: true, roleTitle: true },
  });

  if (!clinician) {
    return res.status(403).json({ error: "Clinician profile not found" });
  }

  // Validate 6-digit General Dental Council (GDC) registration number
  if (!/^\d{6}$/.test(clinician.gdcNumber)) {
    return res.status(422).json({ error: "Invalid clinician GDC registration number" });
  }

  // CS-35: Enforce that only registered dentists may prescribe
  if (!isPrescribingRole(clinician.roleTitle)) {
    return res.status(403).json({ error: "Only registered dentists may issue prescriptions" });
  }

  const practiceAddress = env.practiceAddress ?? (env.isDevelopment || env.isTest ? "Practice address not configured (development)" : null);
  if (!practiceAddress || !prescriptionSigningKey()) {
    return res.status(503).json({ error: "Prescriptions can't be issued until the practice address and signing key are configured." });
  }

  // A prescription belongs to one of this clinician's own appointments, so it
  // always has a patient and a prescriber with a care relationship (CS-08).
  // With only a patientId, use the clinician's latest visit with that patient.
  let appointment: { id: string; patientId: string } | null = null;
  if (appointmentId) {
    appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clinicianId: clinician.id, status: { in: ["confirmed", "in_progress", "completed"] } },
      select: { id: true, patientId: true },
    });
  } else if (patientId) {
    const patient = await prisma.patientProfile.findFirst({
      where: { OR: [{ id: patientId }, { userId: patientId }] },
      select: { id: true },
    });
    if (patient) {
      appointment = await prisma.appointment.findFirst({
        where: { clinicianId: clinician.id, patientId: patient.id, status: { in: ["confirmed", "in_progress", "completed"] } },
        orderBy: { startTimeUtc: "desc" },
        select: { id: true, patientId: true },
      });
    }
  }
  if (!appointment || !(await hasCareRelationship(clinician.id, appointment.patientId))) {
    return res.status(404).json({ error: "No current appointment with this patient" });
  }

  const visit = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointment.id },
    select: {
      patient: { select: { firstName: true, lastName: true, dob: true, addressLine1: true, addressLine2: true, city: true, postcode: true } },
      dependant: { select: { firstName: true, lastName: true, dob: true } },
    },
  });
  const guardian = visit.patient;
  const address = [guardian.addressLine1, guardian.addressLine2, guardian.city, guardian.postcode].filter(Boolean).join(", ") || null;
  // When a guardian booked for their child, the child is the patient.
  const child = visit.dependant;
  const dob = child ? child.dob : guardian.dob ? guardian.dob.toISOString().slice(0, 10) : null;
  const parsedDob = dob ? parseIsoDate(dob) : null;
  const age = parsedDob ? ageInYears(parsedDob) : null;

  const content: PrescriptionContent = {
    version: 1,
    reference: newPrescriptionReference(),
    issuedAt: new Date().toISOString(),
    patient: {
      name: child ? `${child.firstName} ${child.lastName}` : `${guardian.firstName} ${guardian.lastName}`,
      dob,
      ageUnder12: age !== null && age < 12 ? age : null,
      address,
    },
    guardian: child ? { name: `${guardian.firstName} ${guardian.lastName}` } : null,
    prescriber: { name: clinician.fullName, roleTitle: clinician.roleTitle, gdcNumber: clinician.gdcNumber },
    practice: { name: env.practiceName, address: practiceAddress, phone: env.practicePhone ?? null },
    item: { medicine: medicationName, directions: dosageInstructions, pharmacy: dispensingPharmacy },
  };
  const signed = signPrescription(content)!;

  const rx = await prisma.prescription.create({
    data: {
      appointmentId: appointment.id,
      clinicianId: clinician.id,
      medicationName,
      dosageInstructions,
      dispensingPharmacy,
      reference: content.reference,
      content: content as unknown as Prisma.InputJsonValue,
      signature: signed.signature,
      signingKeyId: signed.keyId,
      dispatchedAt: null,
    },
  });

  await createAuditLogWithIntegrity({
    action: "prescription.issued",
    actorId: req.user!.sub,
    resourceId: rx.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { reference: content.reference, signingKeyId: signed.keyId },
  });

  return res.status(201).json({
    id: rx.id,
    reference: rx.reference,
    medicationName: rx.medicationName,
    dosageInstructions: rx.dosageInstructions,
    dispensingPharmacy: rx.dispensingPharmacy,
    issuedAt: content.issuedAt,
    prescriber: clinician.fullName,
    gdcNumber: clinician.gdcNumber,
    status: "ISSUED",
    hasPdf: true,
  });
});

// Who may open a prescription's PDF: the patient (or guardian) whose visit it
// was, or a clinician with a current care relationship (CS-08).
async function findReadablePrescription(req: AuthRequest, id: string) {
  const rx = await prisma.prescription.findUnique({
    where: { id },
    include: { appointment: { select: { patientId: true, patient: { select: { userId: true } } } } },
  });
  if (!rx?.appointment) return null;
  if (req.user!.role === "patient") {
    return rx.appointment.patient.userId === req.user!.sub ? rx : null;
  }
  if (req.user!.role === "clinician") {
    const clinician = await prisma.clinicianProfile.findUnique({ where: { userId: req.user!.sub }, select: { id: true } });
    return clinician && (await hasCareRelationship(clinician.id, rx.appointment.patientId)) ? rx : null;
  }
  return null;
}

// ─── POST /api/prescriptions/:id/pdf-link ─────────────────────────────────────
// A link to the signed PDF that works for five minutes, for opening in the
// phone's browser (which can't send the app's bearer token).
router.post("/:id/pdf-link", requireAuth, validateParams(prescriptionIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const rx = await findReadablePrescription(req, String(req.params.id));
  if (!rx) return res.status(404).json({ error: "Prescription not found" });
  if (!rx.content || !rx.signature) {
    return res.status(404).json({ error: "This prescription was recorded before signed PDFs, so there's no PDF for it." });
  }

  await createAuditLogWithIntegrity({
    action: "prescription.pdf_link_issued",
    actorId: req.user!.sub,
    resourceId: rx.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {},
  });

  const token = prescriptionDownloadToken(rx.id);
  return res.json({ path: `/api/prescription-files/${rx.id}.pdf?token=${encodeURIComponent(token)}`, expiresAt: Number(token.split(".")[0]) });
});

// ─── GET /api/prescriptions/patient/:userId ────────────────────────────────────
router.get("/patient/:userId", requireAuth, validateParams(userIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const requestedId = String(req.params.userId);

  if (req.user!.role !== "patient" && req.user!.role !== "clinician") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const profile = await prisma.patientProfile.findFirst({
    where: { OR: [{ userId: requestedId }, { id: requestedId }] },
    select: { id: true, userId: true },
  });

  if (req.user!.role === "patient" && req.user!.sub !== requestedId && req.user!.sub !== profile?.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!profile) return res.status(404).json({ error: "Patient profile not found" });

  if (req.user!.role === "clinician") {
    const clinician = await prisma.clinicianProfile.findUnique({ where: { userId: req.user!.sub }, select: { id: true } });
    if (!clinician || !(await hasCareRelationship(clinician.id, profile.id))) {
      return res.status(403).json({ error: "No current care relationship with this patient" });
    }
  }

  const prescriptions = await prisma.prescription.findMany({
    where: {
      appointment: { patientId: profile.id },
    },
    include: {
      clinician: { select: { fullName: true, gdcNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: LIST_CAPS.prescriptions,
  });

  // The signature and frozen content stay server-side; the app gets the PDF.
  return res.json(prescriptions.map(({ signature, content, signingKeyId, ...rx }) => ({ ...rx, hasPdf: Boolean(signature && content) })));
});

export default router;
