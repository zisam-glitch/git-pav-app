import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { pseudonymiseIp } from "../lib/audit-security";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { logger } from "../lib/structured-logging";
import {
  checkPrescriptionDownloadToken,
  PrescriptionContent,
  renderPrescriptionPdf,
  verifyPrescription,
} from "../lib/prescription-document";

// Serves a signed prescription PDF for a short-lived link from
// POST /api/prescriptions/:id/pdf-link. No bearer token: the link is the
// permission, and it expires after five minutes.
const router = Router();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.get("/:file", async (req: Request, res: Response) => {
  const match = /^(.+)\.pdf$/.exec(String(req.params.file));
  const id = match?.[1];
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!id || !UUID.test(id) || !checkPrescriptionDownloadToken(id, token)) {
    return res.status(404).json({ error: "This link has expired. Open the prescription in the app again." });
  }

  const rx = await prisma.prescription.findUnique({ where: { id }, select: { id: true, content: true, signature: true } });
  if (!rx?.content || !rx.signature) return res.status(404).json({ error: "Prescription not found" });

  const content = rx.content as unknown as PrescriptionContent;
  // Never hand out a document whose record no longer matches its seal.
  if (!verifyPrescription(content, rx.signature)) {
    logger.error("[Prescriptions] Seal check failed for a stored prescription");
    return res.status(409).json({ error: "This prescription can't be shown. Please contact the practice." });
  }

  const pdf = await renderPrescriptionPdf(content, rx.signature);

  await createAuditLogWithIntegrity({
    action: "prescription.pdf_downloaded",
    actorId: null,
    resourceId: rx.id,
    sessionId: null,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {},
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="prescription-${content.reference}.pdf"`);
  res.setHeader("Cache-Control", "no-store");
  return res.send(Buffer.from(pdf));
});

export default router;
