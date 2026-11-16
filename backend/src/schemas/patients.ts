import { z } from "zod";
import { LIST_CAPS } from "../lib/list-caps";

const uuid = z.string().guid();
const name = z.string().trim().min(1).max(100);
const phone = z.string().trim().min(7).max(32);
const postcode = z.string().trim().regex(/^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/);

export const patientIdParamsSchema = z.object({ id: uuid }).strict();

export const updatePatientProfileSchema = z.object({
  firstName: name.optional(),
  lastName: name.optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  addressLine1: z.string().trim().max(255).optional(),
  addressLine2: z.string().trim().max(255).nullable().optional(),
  city: z.string().trim().max(100).optional(),
  postcode: postcode.optional(),
  phone: phone.optional(),
  phoneOtp: z.string().trim().min(4).max(10).optional(),
  emergencyContactName: name.optional(),
  emergencyContactPhone: phone.optional(),
  medicalHistory: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const requestPhoneChangeSchema = z.object({
  newPhone: phone,
}).strict();

export const verifyPhoneChangeSchema = z.object({
  newPhone: phone,
  code: z.string().trim().min(4).max(10),
}).strict();

export const updateOdontogramSchema = z.object({
  teeth: z.array(z.object({
    toothNumber: z.number().int().min(1).max(32),
    arch: z.enum(["upper", "lower"]),
    quadrant: z.enum(["upper_right", "upper_left", "lower_right", "lower_left"]),
    condition: z.enum(["healthy", "decay", "filled", "missing", "crown", "implant", "root_canal"]),
    notes: z.string().trim().max(500).optional(),
  })).min(1).max(32),
}).strict();

export const createTreatmentPlanSchema = z.object({
  title: z.string().trim().min(1).max(200),
  items: z.array(z.object({
    code: z.string().trim().min(1).max(50),
    description: z.string().trim().min(1).max(500),
    toothNumber: z.number().int().min(1).max(32).optional(),
    costPence: z.number().int().min(0).max(1000000),
  })).min(1).max(50),
}).strict();

export const planActionParamsSchema = z.object({
  id: uuid,
  planId: uuid,
}).strict();

export const patientDocParamsSchema = z.object({
  id: uuid,
  docId: uuid,
}).strict();

export const patientDocumentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(LIST_CAPS.documents).default(LIST_CAPS.documents),
  offset: z.coerce.number().int().min(0).default(0),
}).strict();

export const signTreatmentPlanSchema = z.object({
  signerName: z.string().trim().min(1).max(150).refine(
    (val) => !/<script|javascript:|onerror|onload/i.test(val),
    "Signature contains forbidden executable markup"
  ),
  signatureData: z.string().trim().max(50000).refine(
    (val) => !/<script|javascript:|onerror|onload/i.test(val),
    "Signature data contains forbidden executable markup"
  ).optional(),
  consentConfirmed: z.literal(true),
}).strict();
