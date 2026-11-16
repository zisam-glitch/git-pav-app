import { z } from "zod";

// What the mobile app reads from the API, written once here. Two things keep
// it true:
//  - src/__tests__/app-contract.test.ts calls each endpoint and parses the
//    real response with these schemas, so a backend change that drops or
//    retypes a field fails the backend's tests;
//  - `npm run contract:app` turns these schemas into TypeScript types in
//    pavdental/src/features/api-contract.gen.ts, which the app's own types
//    are built from, so the app stops compiling if it reads a field the API
//    doesn't send. The same test fails if that file is out of date.
// Dates are ISO strings, as they arrive over JSON.

const isoDateTime = z.string().datetime();

export const careChannelSchema = z.enum(["clinic", "van", "video"]);

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["checkup", "hygiene", "emergency", "restorative", "cosmetic"]),
  description: z.string(),
  durationMinutes: z.number().int(),
  pricePence: z.number().int(),
  depositPence: z.number().int(),
  supportedChannels: z.array(careChannelSchema),
  prepInstructions: z.array(z.string()),
  requiresPriorConsult: z.boolean(),
  isActive: z.boolean(),
});

export const clinicSchema = z.object({
  id: z.string().guid(),
  name: z.string(),
  address: z.string(),
  postcode: z.string(),
  city: z.string(),
  phone: z.string(),
  operatingHours: z.string().describe("Free-text summary; openingHours is what slots are built from."),
  isActive: z.boolean(),
  createdAt: isoDateTime,
  openingHours: z
    .array(z.object({ weekday: z.number().int(), opensMinute: z.number().int(), closesMinute: z.number().int() }))
    .describe("UK time, minutes after midnight; weekday 0 is Sunday."),
  closures: z.array(z.object({ date: isoDateTime, reason: z.string().nullable() })).describe("Closure days from today, at most 30."),
});

export const clinicianSchema = z.object({
  id: z.string().guid(),
  fullName: z.string(),
  gdcNumber: z.string(),
  roleTitle: z.string(),
  specialisms: z.array(z.string()),
  bio: z.string().nullable(),
  photoUrl: z.string().nullable().describe("https link or uploaded image, set on the dashboard's Dentist profiles page."),
  isTelehealthActive: z.boolean(),
});

export const slotSchema = z.object({
  id: z.string().describe("Also the hold key passed to POST /api/booking/hold-slot."),
  startTimeUtc: isoDateTime,
  endTimeUtc: isoDateTime,
  available: z.boolean(),
  durationMinutes: z.number().int(),
});

export const holdSlotResponseSchema = z.object({
  success: z.literal(true),
  slotId: z.string(),
  holdExpiresAt: z.number().int().describe("Epoch milliseconds."),
  holdDurationSeconds: z.number().int(),
  message: z.string(),
});

export const appointmentStatusSchema = z.enum([
  "draft_hold",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

export const appointmentListItemSchema = z.object({
  id: z.string().guid(),
  patientId: z.string().guid(),
  clinicianId: z.string().guid().nullable(),
  serviceId: z.string(),
  channel: careChannelSchema,
  clinicId: z.string().guid().nullable(),
  vanId: z.string().guid().nullable(),
  startTimeUtc: isoDateTime,
  endTimeUtc: isoDateTime,
  status: appointmentStatusSchema,
  holdExpiresAt: isoDateTime.nullable(),
  patientWaitingSince: isoDateTime.nullable(),
  patientLastSeenAt: isoDateTime.nullable(),
  intraoralPhotos: z.array(z.string()),
  totalPricePence: z.number().int(),
  depositPaidPence: z.number().int(),
  depositDiscountPence: z.number().int(),
  stripePaymentId: z.string().nullable(),
  dependantId: z.string().guid().nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  service: z.object({ name: z.string(), durationMinutes: z.number().int() }),
  clinician: z.object({ fullName: z.string(), photoUrl: z.string().nullable() }).nullable(),
  clinic: z.object({ name: z.string(), address: z.string() }).nullable(),
  dependant: z.object({ id: z.string().guid(), firstName: z.string(), lastName: z.string() }).nullable(),
});

export const appointmentDetailSchema = appointmentListItemSchema.extend({
  triageData: z.record(z.string(), z.unknown()).nullable(),
  accessDetails: z.record(z.string(), z.unknown()).nullable(),
});

export const toothConditionSchema = z.enum([
  "healthy",
  "decay",
  "filled",
  "missing",
  "crown",
  "implant",
  "root_canal",
]);

export const toothRecordSchema = z.object({
  id: z.string().guid(),
  patientId: z.string().guid(),
  toothNumber: z.number().int(),
  arch: z.string(),
  quadrant: z.string(),
  condition: toothConditionSchema,
  notes: z.string().nullable(),
  updatedAt: isoDateTime,
});

export const treatmentPlanItemSchema = z.object({
  id: z.string().guid(),
  treatmentPlanId: z.string().guid(),
  code: z.string(),
  description: z.string(),
  toothNumber: z.number().int().nullable(),
  costPence: z.number().int(),
  isAccepted: z.boolean(),
});

export const treatmentPlanSchema = z.object({
  id: z.string().guid(),
  patientId: z.string().guid(),
  clinicianId: z.string().guid(),
  title: z.string(),
  status: z.string(),
  totalCostPence: z.number().int(),
  patientSignature: z.string().nullable(),
  patientSignedAt: isoDateTime.nullable(),
  createdAt: isoDateTime,
  items: z.array(treatmentPlanItemSchema),
  clinician: z.object({
    fullName: z.string(),
    roleTitle: z.string(),
    gdcNumber: z.string(),
  }),
});

export const prescriptionSchema = z.object({
  id: z.string().guid(),
  appointmentId: z.string().guid().nullable(),
  clinicianId: z.string().guid(),
  medicationName: z.string(),
  dosageInstructions: z.string(),
  dispensingPharmacy: z.string(),
  epsTransactionRef: z.string().nullable(),
  dispatchedAt: isoDateTime.nullable(),
  createdAt: isoDateTime,
  reference: z.string().nullable(),
  clinician: z.object({
    fullName: z.string(),
    gdcNumber: z.string(),
  }),
  hasPdf: z.boolean(),
});

export const vaultDocumentSchema = z.object({
  id: z.string().guid(),
  docType: z.string(),
  title: z.string(),
  fileSizeBytes: z.string(),
  createdAt: isoDateTime,
  downloadUrl: z.string(),
  expiresAt: isoDateTime,
});

/** Name in the generated file → schema. Order is the order in the file. */
export const appContract = {
  ApiCareChannel: careChannelSchema,
  ApiService: serviceSchema,
  ApiClinic: clinicSchema,
  ApiClinician: clinicianSchema,
  ApiSlot: slotSchema,
  ApiHoldSlotResponse: holdSlotResponseSchema,
  ApiAppointmentStatus: appointmentStatusSchema,
  ApiAppointmentListItem: appointmentListItemSchema,
  ApiAppointmentDetail: appointmentDetailSchema,
  ApiToothCondition: toothConditionSchema,
  ApiToothRecord: toothRecordSchema,
  ApiTreatmentPlanItem: treatmentPlanItemSchema,
  ApiTreatmentPlan: treatmentPlanSchema,
  ApiPrescription: prescriptionSchema,
  ApiVaultDocument: vaultDocumentSchema,
} as const;
