import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { validateBody, validateParams } from "../middleware/validate";
import { postToAppointmentThread } from "../lib/appointment-thread";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { pseudonymiseIp } from "../lib/audit-security";
import { logFailure } from "../lib/best-effort";

// One conversation per video appointment (V48, V49). The patient can write to
// their dentist from the waiting room or the appointment screen; the dentist
// can write to the patient from the consult room and afterwards.
const router = Router();

const paramsSchema = z.object({ appointmentId: z.string().guid() }).strict();
const bodySchema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();

async function whoIsCaller(req: AuthRequest, appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      channel: true,
      patient: { select: { userId: true, firstName: true, lastName: true } },
      clinician: { select: { userId: true, fullName: true } },
    },
  });
  if (!appointment) return null;
  const userId = req.user!.sub;
  if (userId === appointment.patient.userId) {
    return {
      appointment,
      sender: { role: "patient" as const, userId, name: `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim() },
    };
  }
  if (appointment.clinician && userId === appointment.clinician.userId) {
    const name = appointment.clinician.fullName;
    return {
      appointment,
      sender: { role: "clinician" as const, userId, name: name.startsWith("Dr.") ? name : `Dr. ${name}` },
    };
  }
  return null;
}

// ─── GET /api/appointment-messages/:appointmentId ─────────────────────────────
// Which conversation belongs to this appointment, if it has one yet.
router.get("/:appointmentId", requireAuth, validateParams(paramsSchema), async (req: AuthRequest, res: Response) => {
  const appointmentId = String(req.params.appointmentId);
  // Same answer for "no such appointment" and "not yours".
  const caller = await whoIsCaller(req, appointmentId);
  if (!caller) return res.status(404).json({ error: "Appointment not found" });
  const thread = await prisma.messageThread.findUnique({ where: { appointmentId }, select: { id: true } });
  return res.json({ threadId: thread?.id ?? null });
});

// ─── POST /api/appointment-messages/:appointmentId ────────────────────────────
router.post(
  "/:appointmentId",
  requireAuth,
  validateParams(paramsSchema),
  validateBody(bodySchema),
  async (req: AuthRequest, res: Response) => {
    const appointmentId = String(req.params.appointmentId);
    const caller = await whoIsCaller(req, appointmentId);
    if (!caller) return res.status(404).json({ error: "Appointment not found" });
    if (caller.appointment.channel !== "video") {
      return res.status(409).json({ error: "This appointment isn't a video consultation" });
    }

    const posted = await postToAppointmentThread(appointmentId, caller.sender, req.body.body);
    if (!posted) return res.status(404).json({ error: "Appointment not found" });

    await createAuditLogWithIntegrity({
      action: "message.appointment_message_sent",
      actorId: req.user!.sub,
      resourceId: posted.threadId,
      sessionId: req.user!.sessionId,
      ipHash: pseudonymiseIp(req.ip || ""),
      metadata: { senderRole: caller.sender.role, appointmentId },
    }).catch(logFailure("audit write message.appointment_message_sent"));

    return res.status(201).json({
      threadId: posted.threadId,
      message: {
        id: posted.messageId,
        senderRole: caller.sender.role,
        senderName: caller.sender.name,
        body: req.body.body,
        sentAtIso: posted.sentAt.toISOString(),
      },
    });
  }
);

export default router;
