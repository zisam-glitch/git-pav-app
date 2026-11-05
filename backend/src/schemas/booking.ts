import { z } from "zod";

const resourceId = z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
const uuid = z.string().guid();
const bookingChannel = z.enum(["clinic", "van", "video"]);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Invalid calendar date");
const isoDateTime = z.string().datetime({ offset: true });
const compactJsonObject = z.record(z.string(), z.unknown()).refine(
  (value) => JSON.stringify(value).length <= 16_384,
  "Object is too large"
);

export const slotsQuerySchema = z.object({
  clinicianId: uuid.optional(),
  clinicId: uuid.optional(),
  serviceId: resourceId.optional(),
  date: isoDate,
  channel: bookingChannel.optional(),
}).strict();

export const holdSlotSchema = z.object({
  slotId: z.string().trim().min(1).max(512).regex(/^[a-zA-Z0-9:._-]+$/),
}).strict();

export const createAppointmentSchema = z.object({
  serviceId: resourceId,
  channel: bookingChannel,
  clinicianId: uuid.optional(),
  clinicId: uuid.optional(),
  vanId: uuid.optional(),
  // A guardian booking for their child (decisions log #17).
  dependantId: uuid.optional(),
  startTimeUtc: isoDateTime,
  // Ignored: the server derives the end time from the service duration. Still
  // accepted so existing clients keep working.
  endTimeUtc: isoDateTime.optional(),
  slotId: z.string().trim().min(1).max(512).regex(/^[a-zA-Z0-9:._-]+$/).optional(),
  accessDetails: compactJsonObject.optional(),
  triageData: compactJsonObject.optional(),
}).strict().superRefine((appointment, context) => {
  if (appointment.endTimeUtc && new Date(appointment.endTimeUtc) <= new Date(appointment.startTimeUtc)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "endTimeUtc must be after startTimeUtc" });
  }
});

// The client never supplies the amount paid. It may echo the PaymentIntent id
// it paid, which must match the one the server created for this appointment.
export const confirmAppointmentSchema = z.object({
  stripePaymentId: z.string().trim().min(1).max(255).optional(),
}).strict();

// Moving a booking to another time. The server keeps the service, place and
// dentist and works out the new end time itself.
export const rescheduleAppointmentSchema = z.object({
  startTimeUtc: isoDateTime,
}).strict();

export const appointmentIdParamsSchema = z.object({ id: uuid }).strict();

// The patient's pre-visit tasks. Only what the patient actually ticked is
// recorded; nothing is assumed done (BK-7).
export const CHECK_IN_TASKS = ["form", "consent", "insurance", "balance"] as const;
export const appointmentCheckInSchema = z
  .object({ completedTasks: z.array(z.enum(CHECK_IN_TASKS)).max(CHECK_IN_TASKS.length).default([]) })
  .strict();

export const saveAppointmentNotesSchema = z.object({
  notes: z.string().trim().min(1).max(10_000),
  diagnosis: z.string().trim().max(1000).optional(),
  treatmentPlan: z.string().trim().max(5000).optional(),
}).strict();

