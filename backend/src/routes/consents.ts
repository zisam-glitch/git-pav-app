import { Router, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  grantConsentSchema,
  withdrawConsentSchema,
  consentHistoryQuerySchema,
  dataAccessRequestSchema,
} from "../schemas/consents";
import { objectStorage } from "../lib/object-storage";
import { communicationService } from "../lib/communication-service";
import { pseudonymiseIp } from "../lib/audit-security";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import {
  buildSubjectAccessRequestBundle,
  formatSarBundleAsCsv,
  safeJsonStringify,
} from "../lib/sar-registry";

function htmlEscape(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const router = Router();

// ─── POST /api/consents/grant ──────────────────────────────────────────────
router.post("/grant", requireAuth, validateBody(grantConsentSchema), async (req: AuthRequest, res: Response) => {
  const { consentType, lawfulBasis, metadata } = req.body;
  const userId = req.user!.sub;

  const profile = await prisma.patientProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return res.status(404).json({ error: "Patient profile not found" });
  }

  // DB-3 / CO-1: Server-observed IP only, hashed via pseudonymiseIp (client cannot supply IP)
  const rawIp = req.ip || req.socket?.remoteAddress || "";
  const serverIpHash = pseudonymiseIp(rawIp);

  // CO-1: Transactional grant with versioning to prevent race conditions
  const consent = await prisma.$transaction(async (tx) => {
    const latestConsent = await tx.consentRecord.findFirst({
      where: {
        patientProfileId: profile.id,
        consentType,
      },
      orderBy: { version: "desc" },
    });

    const newVersion = (latestConsent?.version || 0) + 1;

    if (latestConsent && latestConsent.isGranted) {
      await tx.consentRecord.update({
        where: { id: latestConsent.id },
        data: {
          isGranted: false,
          withdrawnAt: new Date(),
        },
      });
    }

    return tx.consentRecord.create({
      data: {
        patientProfileId: profile.id,
        consentType,
        version: newVersion,
        lawfulBasis,
        isGranted: true,
        ipAddress: serverIpHash,
        metadata: (metadata as any) || {},
      },
    });
  });

  // CO-1: Audit log with hash chain integrity
  await createAuditLogWithIntegrity({
    action: "consent.granted",
    actorId: userId,
    resourceId: profile.id,
    sessionId: req.user!.sessionId,
    ipHash: serverIpHash,
    metadata: {
      consentType,
      version: consent.version,
      lawfulBasis,
      consentId: consent.id,
    },
  });

  return res.status(201).json({
    id: consent.id,
    consentType: consent.consentType,
    version: consent.version,
    lawfulBasis: consent.lawfulBasis,
    isGranted: consent.isGranted,
    grantedAt: consent.grantedAt,
  });
});

// ─── POST /api/consents/withdraw ────────────────────────────────────────────
router.post("/withdraw", requireAuth, validateBody(withdrawConsentSchema), async (req: AuthRequest, res: Response) => {
  const { consentType } = req.body;
  const userId = req.user!.sub;

  const profile = await prisma.patientProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return res.status(404).json({ error: "Patient profile not found" });
  }

  // DB-3 / CO-1: Server-observed IP only, hashed via pseudonymiseIp
  const rawIp = req.ip || req.socket?.remoteAddress || "";
  const serverIpHash = pseudonymiseIp(rawIp);

  // CO-1: Transactional withdrawal
  const updated = await prisma.$transaction(async (tx) => {
    const consent = await tx.consentRecord.findFirst({
      where: {
        patientProfileId: profile.id,
        consentType,
        isGranted: true,
      },
      orderBy: { version: "desc" },
    });

    if (!consent) {
      return null;
    }

    return tx.consentRecord.update({
      where: { id: consent.id },
      data: {
        isGranted: false,
        withdrawnAt: new Date(),
      },
    });
  });

  if (!updated) {
    return res.status(404).json({ error: "No active consent found for this type" });
  }

  // CO-1: Audit log with hash chain integrity
  await createAuditLogWithIntegrity({
    action: "consent.withdrawn",
    actorId: userId,
    resourceId: profile.id,
    sessionId: req.user!.sessionId,
    ipHash: serverIpHash,
    metadata: {
      consentType,
      version: updated.version,
      consentId: updated.id,
    },
  });

  return res.json({
    id: updated.id,
    consentType: updated.consentType,
    version: updated.version,
    isGranted: updated.isGranted,
    withdrawnAt: updated.withdrawnAt,
  });
});

// ─── GET /api/consents/history ───────────────────────────────────────────────
router.get("/history", requireAuth, validateQuery(consentHistoryQuerySchema), async (req: AuthRequest, res: Response) => {
  const { consentType, includeWithdrawn } = req.query as unknown as {
    consentType?: string;
    includeWithdrawn?: boolean;
  };
  const userId = req.user!.sub;

  const profile = await prisma.patientProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return res.status(404).json({ error: "Patient profile not found" });
  }

  const whereClause: any = {
    patientProfileId: profile.id,
  };

  if (consentType) {
    whereClause.consentType = consentType;
  }

  if (!includeWithdrawn) {
    whereClause.isGranted = true;
  }

  const consents = await prisma.consentRecord.findMany({
    where: whereClause,
    orderBy: [{ consentType: "asc" }, { version: "desc" }],
  });

  return res.json(consents);
});

// ─── GET /api/consents/current ────────────────────────────────────────────────
router.get("/current", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;

  const profile = await prisma.patientProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return res.status(404).json({ error: "Patient profile not found" });
  }

  const consents = await prisma.consentRecord.findMany({
    where: {
      patientProfileId: profile.id,
      isGranted: true,
    },
    orderBy: [{ consentType: "asc" }, { version: "desc" }],
  });

  const latestConsents = new Map<string, any>();
  for (const consent of consents) {
    if (!latestConsents.has(consent.consentType) || consent.version > latestConsents.get(consent.consentType).version) {
      latestConsents.set(consent.consentType, consent);
    }
  }

  return res.json(Array.from(latestConsents.values()));
});

// ─── POST /api/consents/data-access-request ────────────────────────────────
// Compiles complete GDPR Subject Access Request (SAR) bundle, stores in
// DocumentVault & ObjectStorage, and dispatches secure download link via email.
router.post("/data-access-request", requireAuth, validateBody(dataAccessRequestSchema), async (req: AuthRequest, res: Response) => {
  const { ipAddress, format = "json" } = req.body;
  const userId = req.user!.sub;

  const profile = await prisma.patientProfile.findUnique({
    where: { userId },
    select: { id: true, firstName: true, user: { select: { email: true } } },
  });

  if (!profile) {
    return res.status(404).json({ error: "Patient profile not found" });
  }

  const requestId = crypto.randomUUID();
  const bundle = await buildSubjectAccessRequestBundle(
    prisma,
    { userId, profileId: profile.id },
    requestId
  );

  const isCsv = format === "csv";
  const fileKey = `gdpr-sar/${profile.id}/sar-export-${requestId}.${isCsv ? "csv" : "json"}`;
  const exportPayload = isCsv
    ? formatSarBundleAsCsv(bundle)
    : safeJsonStringify(bundle, 2);

  const uploaded = await objectStorage.upload(
    fileKey,
    exportPayload,
    isCsv ? "text/csv" : "application/json",
    { requestId, userId, format: isCsv ? "csv" : "json" }
  );

  const vaultDoc = await prisma.documentVault.create({
    data: {
      patientId: profile.id,
      docType: "gdpr_sar_export",
      title: `GDPR Subject Access Bundle (${new Date().toLocaleDateString("en-GB")})`,
      fileKey: uploaded.key,
      fileSizeBytes: String(uploaded.size),
    },
  });

  // Server-observed IP only (client cannot spoof IP evidence)
  const rawIp = req.ip || req.socket?.remoteAddress || "";
  const serverIpHash = pseudonymiseIp(rawIp);

  await createAuditLogWithIntegrity({
    action: "gdpr.data_access_request.completed",
    actorId: userId,
    resourceId: profile.id,
    sessionId: req.user!.sessionId,
    ipHash: serverIpHash,
    metadata: {
      requestId,
      fileKey: uploaded.key,
      sha256: uploaded.sha256,
      format: isCsv ? "csv" : "json",
      documentId: vaultDoc.id,
    },
  });

  // SAR-2 / OS-3: Escape firstName in HTML; do not email a 15-minute expiring bearer URL.
  // Direct the patient into the authenticated app Document Vault instead.
  await communicationService.sendEmail({
    to: profile.user.email,
    subject: "Your Pav Dental GDPR Subject Access Request (SAR) Bundle",
    html: `<p>Dear ${htmlEscape(profile.firstName)},</p><p>Your UK GDPR Article 15 Subject Access Request bundle (Ref: <strong>${htmlEscape(requestId)}</strong>) has been generated and securely stored in your encrypted Document Vault.</p><p>To view and download your full records at any time, please open the Pav Dental app, sign in, and go to <strong>Records &gt; Document Vault</strong>.</p>`,
    text: `Your Pav Dental GDPR Subject Access Request bundle (Ref: ${requestId}) is ready in your Document Vault. Open your Pav Dental app and go to Records > Document Vault to view or download it.`,
  });

  return res.status(202).json({
    message: "Data access request processed. Encrypted bundle added to your Document Vault.",
    requestId,
    documentId: vaultDoc.id,
    downloadUrl: `/api/patients/${profile.id}/documents/${vaultDoc.id}/download`,
    sha256: uploaded.sha256,
    recordCounts: bundle.recordCounts,
  });
});

export default router;
