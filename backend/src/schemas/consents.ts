import { z } from "zod";

export const consentTypes = z.enum([
  "data_processing",
  "telehealth",
  "data_sharing",
  "marketing",
  "clinical_records",
  "payment_processing",
  "treatment_data_processing",
  "marketing_communications",
  "research_participation",
  "photo_video_usage",
  "third_party_sharing",
  "emergency_contact",
  "guardian_consent",
]);

export const lawfulBasisTypes = z.enum([
  "consent",
  "contract",
  "legal_obligation",
  "vital_interests",
  "public_task",
  "legitimate_interests",
]);

const ipAddress = z.union([z.ipv4(), z.ipv6()]);

export const grantConsentSchema = z.object({
  consentType: consentTypes,
  lawfulBasis: lawfulBasisTypes,
  ipAddress: ipAddress.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const withdrawConsentSchema = z.object({
  consentType: consentTypes,
  ipAddress: ipAddress.optional(),
}).strict();

export const consentHistoryQuerySchema = z.object({
  consentType: consentTypes.optional(),
  includeWithdrawn: z
    .preprocess((val) => {
      if (typeof val === "string") return val.toLowerCase() === "true";
      return Boolean(val);
    }, z.boolean())
    .optional(),
}).strict();

export const dataAccessRequestSchema = z.object({
  reason: z.string().trim().min(1).max(500).optional(),
  format: z.enum(["json", "csv"]).optional(),
  ipAddress: ipAddress.optional(),
}).strict();

