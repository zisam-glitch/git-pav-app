import { Router, Response } from "express";
import type { Prisma } from "@prisma/client";
import { patientsInClinicianCare } from "../middleware/patient-access";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import { pseudonymiseIp } from "../lib/audit-security";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { encryptField, decryptString } from "../lib/encryption";
import { communicationService } from "../lib/communication-service";
import { env } from "../config/env";
import { safeError } from "../lib/log-safety";
import { withIdempotency, idempotencyKeyFrom } from "../lib/idempotency";

type Outcome = { status: number; body?: unknown; error?: string };

/** The caller's Idempotency-Key, scoped to them and the action; "invalid" when malformed. */
function scopedKey(req: AuthRequest, action: string): string | null | "invalid" {
  const k = idempotencyKeyFrom(req.header("Idempotency-Key"));
  if (k === "invalid") return "invalid";
  return k ? `${action}:${req.user!.sub}:${k}` : null;
}

function sendOutcome(res: Response, out: Outcome) {
  if (out.error) return res.status(out.status).json({ error: out.error });
  return res.status(out.status).json(out.body);
}
import { sendUserNotification } from "../lib/patient-push";

const router = Router();

export const DRAFT_EMERGENCY_NOTICE =
  "If you are experiencing a dental or medical emergency (such as severe facial swelling, trauma, difficulty breathing, or uncontrollable bleeding), call 999 or attend A&E immediately. For urgent out-of-hours advice, call NHS 111. Messages are monitored during clinic hours (Mon–Fri 09:00–17:30, Sat 09:00–13:00) with response typically within 1 business day.";

export const CLINIC_MESSAGING_SLA = {
  operatingHours: "Mon–Fri 09:00–17:30, Sat 09:00–13:00",
  typicalResponseTime: "1 business day",
  emergencyAdvice: DRAFT_EMERGENCY_NOTICE,
};

// Returns user display name and title based on role
async function getSenderDisplayName(userId: string, role: string): Promise<string> {
  if (role === "clinician") {
    const clinician = await prisma.clinicianProfile.findUnique({
      where: { userId },
      select: { fullName: true, roleTitle: true },
    });
    if (clinician?.fullName) {
      return clinician.fullName.startsWith("Dr.") ? clinician.fullName : `Dr. ${clinician.fullName}`;
    }
  }
  if (role === "admin") {
    return "Pav Dental Practice Team";
  }
  const profile = await prisma.patientProfile.findUnique({
    where: { userId },
    select: { firstName: true, lastName: true },
  });
  if (profile) {
    const name = `${profile.firstName} ${profile.lastName}`.trim();
    if (name) return name;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ? user.email.split("@")[0] : "Patient";
}

// Patients see their own threads. Admins (the practice team) see all. A
// clinician sees threads for patients in their care in the last 12 months,
// OR threads explicitly assigned/routed to them (decisions log #10, CS-08, MS-3).
async function visibleThreadsWhere(req: AuthRequest): Promise<Prisma.MessageThreadWhereInput> {
  const { sub, role } = req.user!;
  if (role === "admin") return {};
  if (role === "clinician") {
    const clinician = await prisma.clinicianProfile.findUnique({ where: { userId: sub }, select: { id: true } });
    if (!clinician) return { id: { in: [] } };
    const patientIds = await patientsInClinicianCare(clinician.id);
    const patients = await prisma.patientProfile.findMany({ where: { id: { in: patientIds } }, select: { userId: true } });
    return {
      OR: [
        { patientUserId: { in: patients.map((p) => p.userId) } },
        { assignedClinicianId: clinician.id },
      ],
    };
  }
  return { patientUserId: sub };
}

const threadIdParamsSchema = z.object({ id: z.string().guid() }).strict();
// Newest threads first, a page at a time (CS-09).
const listThreadsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  recipientType: z.enum(["practice", "care_team", "clinician"]).optional(),
}).strict();

const createThreadSchema = z
  .object({
    subject: z.string().trim().min(1).max(255),
    body: z.string().trim().min(1).max(4000),
    recipientType: z.enum(["practice", "care_team", "clinician"]).optional(),
    recipientClinicianId: z.string().guid().optional(),
    recipientName: z.string().trim().min(1).max(150).optional(),
  })
  .strict();

const replyMessageSchema = z
  .object({
    body: z.string().trim().min(1).max(4000),
  })
  .strict();

// ─── GET /api/messages/meta ───────────────────────────────────────────────────
// SLA and clinical emergency guidance banner info
router.get("/meta", requireAuth, (_req: AuthRequest, res: Response) => {
  return res.json(CLINIC_MESSAGING_SLA);
});

// ─── GET /api/messages ────────────────────────────────────────────────────────
// Returns persistent message threads for the authenticated user.
router.get("/", requireAuth, validateQuery(listThreadsQuerySchema), async (req: AuthRequest, res: Response) => {
  const isStaff = req.user!.role === "clinician" || req.user!.role === "admin";
  const { limit, offset, recipientType } = req.query as unknown as {
    limit: number;
    offset: number;
    recipientType?: string;
  };
  const visible = await visibleThreadsWhere(req);
  const threads = await prisma.messageThread.findMany({
    where: recipientType ? { AND: [visible, { recipientType }] } : visible,
    include: {
      patientUser: {
        include: {
          patientProfile: { select: { firstName: true, lastName: true } },
        },
      },
      messages: {
        orderBy: { sentAt: "asc" },
      },
    },
    // id breaks ties so a page boundary never repeats or skips a thread.
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: limit,
    skip: offset,
  });

  return res.json(
    await Promise.all(
      threads.map(async (t) => {
        const profile = t.patientUser?.patientProfile;
        const patientName = profile
          ? `${profile.firstName} ${profile.lastName}`.trim()
          : (t.patientUser?.email ? t.patientUser.email.split("@")[0] : "Patient");
        // Staff seeing their inbox see the patient as 'from'; patients see the clinician or practice team name
        const displayFrom = isStaff ? (patientName || "Patient") : t.senderName;
        const decryptedSubject = await decryptString(t.subject);
        const lastMsg = t.messages[t.messages.length - 1];
        const lastBody = lastMsg ? await decryptString(lastMsg.body) : "";
        const preview = lastBody ? `${lastMsg.senderName || displayFrom}: ${lastBody.slice(0, 160)}` : "[Secure message]";

        return {
          id: t.id,
          from: displayFrom,
          subject: decryptedSubject,
          preview,
          sentAtIso: t.updatedAt.toISOString(),
          // Each side has its own unread flag, so one side reading never clears the other's.
          isRead: !(isStaff ? t.staffUnread : t.patientUnread),
          hasAttachment: t.hasAttachment,
          recipientType: t.recipientType,
          assignedClinicianId: t.assignedClinicianId,
          patientName,
          patientUserId: t.patientUserId,
          messages: await Promise.all(
            t.messages.map(async (m) => ({
              id: m.id,
              senderRole: m.senderRole,
              senderName: m.senderName,
              body: await decryptString(m.body),
              sentAtIso: m.sentAt.toISOString(),
            }))
          ),
        };
      })
    )
  );
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── POST /api/messages ───────────────────────────────────────────────────────
router.post("/", requireAuth, validateBody(createThreadSchema), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;
  const userRole = req.user!.role;
  const { subject, body, recipientType, recipientClinicianId, recipientName } = req.body;
  const key = scopedKey(req, "message-create");
  if (key === "invalid") {
    return res.status(400).json({ error: "Idempotency-Key must be 8 to 128 letters, digits, '-', '_' or ':'" });
  }

  // A retry with the same key returns the first result instead of sending again (V47).
  const outcome = await withIdempotency<Outcome>(key, async () => {

  // Resolve routing
  let resolvedAssignedClinicianId: string | null = null;
  let resolvedRecipientType = recipientType || "practice";
  let resolvedRecipientName = recipientName || "Pav Dental Clinical Team";
  let clinicianUserEmail: string | null = null;

  if (recipientClinicianId) {
    const clinician = await prisma.clinicianProfile.findUnique({
      where: { id: recipientClinicianId },
      include: { user: true },
    });
    if (clinician) {
      resolvedAssignedClinicianId = clinician.id;
      resolvedRecipientType = "clinician";
      resolvedRecipientName = clinician.fullName.startsWith("Dr.") ? clinician.fullName : `Dr. ${clinician.fullName}`;
      clinicianUserEmail = clinician.user?.email || null;
    }
  } else if (resolvedRecipientType === "care_team") {
    // Try to find patient's most recent clinician
    const patientProfile = await prisma.patientProfile.findUnique({ where: { userId } });
    if (patientProfile) {
      const recentAppt = await prisma.appointment.findFirst({
        where: { patientId: patientProfile.id },
        orderBy: { startTimeUtc: "desc" },
        include: { clinician: { include: { user: true } } },
      });
      if (recentAppt?.clinician) {
        resolvedAssignedClinicianId = recentAppt.clinician.id;
        resolvedRecipientType = "care_team";
        resolvedRecipientName = recentAppt.clinician.fullName.startsWith("Dr.")
          ? recentAppt.clinician.fullName
          : `Dr. ${recentAppt.clinician.fullName}`;
        clinicianUserEmail = recentAppt.clinician.user?.email || null;
      }
    }
  }

  // Get sender's real display name
  const senderDisplayName = await getSenderDisplayName(userId, userRole);

  // DB-3: Encrypt message body and subject at rest
  const encrypted = await encryptField(body);
  const storedBody = JSON.stringify(encrypted);
  const encryptedSubject = JSON.stringify(await encryptField(subject));

  const thread = await prisma.messageThread.create({
    data: {
      patientUserId: userId,
      senderName: resolvedRecipientName,
      subject: encryptedSubject,
      preview: "[Secure message]",
      isRead: false, // Unread for the receiving staff / recipient
      staffUnread: true,
      patientUnread: false,
      hasAttachment: false,
      recipientType: resolvedRecipientType,
      assignedClinicianId: resolvedAssignedClinicianId,
      messages: {
        create: [
          {
            senderRole: userRole,
            senderName: senderDisplayName,
            body: storedBody,
          },
        ],
      },
    },
    include: { messages: true },
  });

  // MS-3: Notify recipient staff (care team clinician or practice inbox). The
  // email names no patient and no subject: it goes through a third-party mail
  // service (decisions log D-19).
  // A push that says only that something arrived: no name, no subject (V44).
  if (resolvedAssignedClinicianId) {
    const assigned = await prisma.clinicianProfile.findUnique({
      where: { id: resolvedAssignedClinicianId },
      select: { userId: true },
    });
    if (assigned) {
      void sendUserNotification(assigned.userId, "New message", "You have a new patient message in the Pav Dental app.", {
        type: "message",
        audience: "clinician",
        threadId: thread.id,
      });
    }
  }

  if (resolvedAssignedClinicianId && clinicianUserEmail) {
    communicationService
      .sendEmail({
        to: clinicianUserEmail,
        subject: "[Pav Dental] New patient message",
        text: "You have a new patient message.\n\nOpen the clinician portal to read and reply.",
        html: "<p>You have a new patient message.</p><p>Open the clinician portal to read and reply.</p>",
      })
      .catch((err) => console.error("[Messages] Failed to dispatch clinician notification:", safeError(err)));
  } else {
    // Notify practice inbox
    const practiceEmail = env.opsAlertEmail || "practice@pavdental.com";
    communicationService
      .sendEmail({
        to: practiceEmail,
        subject: "[Practice Inbox] New patient message",
        text: "There is a new patient message in the practice inbox.\n\nOpen the staff dashboard to read and reply.",
        html: "<p>There is a new patient message in the practice inbox.</p><p>Open the staff dashboard to read and reply.</p>",
      })
      .catch((err) => console.error("[Messages] Failed to dispatch practice notification:", safeError(err)));
  }

  await createAuditLogWithIntegrity({
    action: "message.thread_created",
    actorId: userId,
    resourceId: thread.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {
      recipientType: resolvedRecipientType,
      assignedClinicianId: resolvedAssignedClinicianId,
    },
  });

  return {
    status: 201,
    body: {
    id: thread.id,
    from: thread.senderName,
    subject,
    preview: thread.preview,
    sentAtIso: thread.updatedAt.toISOString(),
    isRead: !thread.patientUnread,
    hasAttachment: thread.hasAttachment,
    recipientType: thread.recipientType,
    assignedClinicianId: thread.assignedClinicianId,
    messages: thread.messages.map((m) => ({
      id: m.id,
      senderRole: m.senderRole,
      senderName: m.senderName,
      body,
      sentAtIso: m.sentAt.toISOString(),
    })),
    },
  } as Outcome;
  });

  return sendOutcome(res, outcome);
});

// ─── POST /api/messages/:id/reply ─────────────────────────────────────────────
router.post(
  "/:id/reply",
  requireAuth,
  validateParams(threadIdParamsSchema),
  validateBody(replyMessageSchema),
  async (req: AuthRequest, res: Response) => {
    const threadId = String(req.params.id);
    const userId = req.user!.sub;
    const userRole = req.user!.role;
    const { body } = req.body;

    const key = scopedKey(req, `message-reply:${threadId}`);
    if (key === "invalid") {
      return res.status(400).json({ error: "Idempotency-Key must be 8 to 128 letters, digits, '-', '_' or ':'" });
    }

    // A retry with the same key returns the first result instead of sending again (V47).
    const outcome = await withIdempotency<Outcome>(key, async () => {
    const thread = await prisma.messageThread.findFirst({
      where: { AND: [{ id: threadId }, await visibleThreadsWhere(req)] },
      include: {
        patientUser: true,
      },
    });

    if (!thread) {
      return { status: 404, error: "Message thread not found" } as Outcome;
    }

    // Determine sender display name (real staff name or patient name, MS-3)
    const senderDisplayName = await getSenderDisplayName(userId, userRole);

    // DB-3: Encrypt reply message body at rest
    const encrypted = await encryptField(body);
    const storedBody = JSON.stringify(encrypted);

    const isStaff = userRole === "clinician" || userRole === "admin";

    const [message, updatedThread] = await prisma.$transaction([
      prisma.message.create({
        data: {
          threadId: thread.id,
          senderRole: userRole,
          senderName: senderDisplayName, // MS-3: real clinician/staff name, never hardcoded "You"
          body: storedBody,
        },
      }),
      prisma.messageThread.update({
        where: { id: thread.id },
        data: {
          preview: "[Secure message]",
          isRead: isStaff ? true : false,
          staffUnread: !isStaff,
          patientUnread: isStaff,
        },
        include: {
          messages: { orderBy: { sentAt: "asc" } },
        },
      }),
    ]);

    const decryptedSubject = await decryptString(thread.subject);
    const safeSender = escapeHtml(senderDisplayName);
    const safeSubject = escapeHtml(decryptedSubject);

    // MS-3: Notifications on reply
    if (isStaff) {
      // Staff replied -> notify patient. The push says only that a message came (V44).
      void sendUserNotification(thread.patientUserId, "New message from Pav Dental", "Open the Pav Dental app to read it.", {
        type: "message",
        audience: "patient",
        threadId: thread.id,
      });
      const patientEmail = thread.patientUser?.email;
      if (patientEmail) {
        communicationService
          .sendEmail({
            to: patientEmail,
            subject: `[Pav Dental] Reply from ${safeSender}: ${safeSubject}`,
            text: `${senderDisplayName} has replied to your message thread: "${decryptedSubject}".\n\nPlease open the Pav Dental app to view.`,
            html: `<p><strong>${safeSender}</strong> has replied to your message thread: <em>${safeSubject}</em>.</p><p>Please open the Pav Dental app to read and reply.</p>`,
          })
          .catch((err) => console.error("[Messages] Failed to notify patient of staff reply:", safeError(err)));
      }
    } else {
      // Patient replied -> notify care team / clinician or practice inbox
      if (thread.assignedClinicianId) {
        const assigned = await prisma.clinicianProfile.findUnique({
          where: { id: thread.assignedClinicianId },
          select: { userId: true },
        });
        if (assigned) {
          void sendUserNotification(assigned.userId, "New message", "You have a new patient message in the Pav Dental app.", {
            type: "message",
            audience: "clinician",
            threadId: thread.id,
          });
        }
        const clinician = await prisma.clinicianProfile.findUnique({
          where: { id: thread.assignedClinicianId },
          include: { user: true },
        });
        if (clinician?.user?.email) {
          communicationService
            .sendEmail({
              to: clinician.user.email,
              subject: "[Pav Dental] New patient reply",
              text: "A patient has replied to a message.\n\nOpen the clinician portal to read it.",
              html: "<p>A patient has replied to a message.</p><p>Open the clinician portal to read it.</p>",
            })
            .catch(() => {});
        }
      } else {
        const practiceEmail = env.opsAlertEmail || "practice@pavdental.com";
        communicationService
          .sendEmail({
            to: practiceEmail,
            subject: "[Practice Inbox] New patient reply",
            text: "A patient has replied in the practice inbox.\n\nOpen the staff dashboard to read it.",
            html: "<p>A patient has replied in the practice inbox.</p><p>Open the staff dashboard to read it.</p>",
          })
          .catch(() => {});
      }
    }

    await createAuditLogWithIntegrity({
      action: "message.reply_sent",
      actorId: userId,
      resourceId: thread.id,
      sessionId: req.user!.sessionId,
      ipHash: pseudonymiseIp(req.ip || ""),
      metadata: {
        senderRole: userRole,
        senderName: senderDisplayName,
      },
    });

    return { status: 201, body: {
      message: {
        id: message.id,
        senderRole: message.senderRole,
        senderName: message.senderName,
        body,
        sentAtIso: message.sentAt.toISOString(),
      },
      thread: {
        id: updatedThread.id,
        from: updatedThread.senderName,
        subject: decryptedSubject,
        preview: `${senderDisplayName}: ${body.slice(0, 160)}`,
        sentAtIso: updatedThread.updatedAt.toISOString(),
        isRead: !(isStaff ? updatedThread.staffUnread : updatedThread.patientUnread),
        hasAttachment: updatedThread.hasAttachment,
      },
    } } as Outcome;
    });

    return sendOutcome(res, outcome);
  }
);

// ─── PATCH /api/messages/:id/read ─────────────────────────────────────────────
router.patch("/:id/read", requireAuth, validateParams(threadIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const threadId = String(req.params.id);
  const existing = await prisma.messageThread.findFirst({
    where: { AND: [{ id: threadId }, await visibleThreadsWhere(req)] },
  });

  if (!existing) {
    return res.status(404).json({ error: "Message thread not found" });
  }

  const isStaff = req.user!.role === "clinician" || req.user!.role === "admin";
  const updated = await prisma.messageThread.update({
    where: { id: threadId },
    data: isStaff ? { isRead: true, staffUnread: false } : { isRead: true, patientUnread: false },
  });

  return res.json({ id: updated.id, isRead: !(isStaff ? updated.staffUnread : updated.patientUnread) });
});

// ─── DELETE /api/messages/:id ─────────────────────────────────────────────────
router.delete("/:id", requireAuth, validateParams(threadIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const threadId = String(req.params.id);
  const userId = req.user!.sub;

  const existing = await prisma.messageThread.findFirst({
    where: { id: threadId, patientUserId: userId },
  });

  if (!existing) {
    return res.status(404).json({ error: "Message thread not found" });
  }

  const messageCount = await prisma.message.count({ where: { threadId } });

  await prisma.messageThread.delete({
    where: { id: threadId },
  });

  // CS-29: the thread is gone for good, so record who removed it and its shape.
  await createAuditLogWithIntegrity({
    action: "message.thread_deleted",
    actorId: userId,
    resourceId: threadId,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {
      recipientType: existing.recipientType,
      assignedClinicianId: existing.assignedClinicianId,
      messageCount,
    },
  });

  return res.json({ success: true, id: threadId });
});

export default router;
