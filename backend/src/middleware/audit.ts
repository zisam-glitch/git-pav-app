import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { pseudonymiseIp } from "../lib/audit-security";
import { createAuditLogWithIntegrity, isCriticalAuditEvent, sendCriticalAuditAlert } from "../lib/audit-integrity";
import { safeError } from "../lib/log-safety";
import { logger } from "../lib/structured-logging";

// List of field names that may contain special-category clinical data
const CLINICAL_DATA_FIELDS = [
  "medicalHistory",
  "triageData",
  "clinicalNotes",
  "diagnosis",
  "prescription",
  "treatment",
  "symptoms",
  "condition",
  "medication",
  "allergies",
  "patientNotes",
  "chiefComplaint",
  "painLevel",
  "photos",
  "document",
  "swelling",
  "bleeding",
  "fever",
  "difficultyBreathing",
  "difficultySwallowing",
  "traumaHistory",
  "firstName",
  "lastName",
  "fullName",
  "name",
  "address",
  "phone",
  "email",
  "dob",
  "postcode",
];

function redactMetadata(metadata: Record<string, unknown>, seen = new WeakSet()): Record<string, unknown> {
  if (typeof metadata !== "object" || metadata === null) return metadata;
  if (metadata instanceof Date) return metadata;
  if (seen.has(metadata)) return "[CIRCULAR]" as any;
  seen.add(metadata);

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Redact fields that might contain clinical or personal data
    const isSensitive = CLINICAL_DATA_FIELDS.some(field =>
      key.toLowerCase() === field.toLowerCase() || key.toLowerCase().includes(field.toLowerCase())
    );

    if (isSensitive) {
      redacted[key] = "[REDACTED]";
      continue;
    }

    // Recursively redact nested objects and arrays
    if (typeof value === "object" && value !== null) {
      if (value instanceof Date) {
        redacted[key] = value;
      } else if (Array.isArray(value)) {
        redacted[key] = value.map(item =>
          typeof item === "object" && item !== null
            ? (item instanceof Date ? item : redactMetadata(item as Record<string, unknown>, seen))
            : item
        );
      } else {
        redacted[key] = redactMetadata(value as Record<string, unknown>, seen);
      }
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

export async function auditMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if ((res as any).__pavAuditAttached) {
    return next();
  }
  (res as any).__pavAuditAttached = true;

  res.on("finish", async () => {
    try {
      // AU-4: Use full router mount + route path as action
      const routePath = req.route?.path || req.path;
      const action = `${req.method} ${req.baseUrl}${routePath}`;

      // AU-4: Extract resource identifier from route parameters if present
      const resourceId =
        req.params?.id ??
        req.params?.patientId ??
        req.params?.appointmentId ??
        req.params?.requestId ??
        (req as any).resourceId ??
        null;

      // Build metadata with request details (body/params will be redacted, path has query string stripped)
      const metadata: Record<string, unknown> = {
        statusCode: res.statusCode,
        requestId: req.id ?? (res.getHeader("x-request-id") as string | undefined) ?? null,
        method: req.method,
        path: (req.originalUrl || `${req.baseUrl}${req.path}`).split("?")[0],
        outcome:
          res.statusCode < 400
            ? "success"
            : res.statusCode === 401 || res.statusCode === 403
            ? "denied"
            : "failed",
      };

      // Redact any clinical data from metadata before logging
      const redactedMetadata = redactMetadata(metadata);

      const log = await createAuditLogWithIntegrity({
        action,
        actorId: req.user?.sub ?? null,
        resourceId: resourceId ? String(resourceId) : null,
        sessionId: req.user?.sessionId ?? null,
        ipHash: pseudonymiseIp(req.ip || ""),
        metadata: redactedMetadata,
      });

      // AU-6: Check for critical events and send alerts (including denied attempts)
      if (isCriticalAuditEvent(action, res.statusCode)) {
        await sendCriticalAuditAlert(log);
      }
    } catch (err) {
      // Audit failures must never break the request
      logger.error("[AUDIT FAILURE]", undefined, safeError(err));
    }
  });
  next();
}

