import { z } from "zod";

const uuid = z.string().guid();

// A room always belongs to one video appointment.
export const createVideoRoomSchema = z.object({
  appointmentId: uuid,
}).strict();

export const submitTriageSchema = z.object({
  appointmentId: uuid,
  chiefComplaint: z.string().trim().min(1).max(500),
  painLevel: z.number().int().min(0).max(10),
  duration: z.string().trim().max(100).optional(),
  symptoms: z.array(z.string().trim().max(200)).max(20).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
}).strict();

export const admitPatientSchema = z.object({
  appointmentId: uuid,
}).strict();

export const endConsultSchema = z.object({
  appointmentId: uuid,
  notes: z.string().trim().max(5000).optional(),
  diagnosis: z.string().trim().max(1000).optional(),
  treatmentPlan: z.string().trim().max(2000).optional(),
  followUpRecommended: z.enum(["none", "clinic", "van", "video"]).optional(),
}).strict();

// GET /status/:appointmentId and /summary/:appointmentId. A malformed id is a
// 400, not a database error and a 500 (B10).
export const videoAppointmentParamsSchema = z.object({
  appointmentId: uuid,
}).strict();
