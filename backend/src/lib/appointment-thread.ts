import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { encryptField } from "./encryption";
import { sendUserNotification } from "./patient-push";

const SUBJECT = "Your video consultation";

export type ThreadSender =
  | { role: "patient"; userId: string; name: string }
  | { role: "clinician"; userId: string; name: string };

/**
 * One conversation per video appointment (V48). Finds it or makes it, adds a
 * message from `sender`, marks the other side unread and pushes them with a
 * line that carries no content. Safe to call at the same time from two places:
 * the unique index on `appointment_id` means only one thread is ever made.
 */
export async function postToAppointmentThread(
  appointmentId: string,
  sender: ThreadSender,
  body: string
): Promise<{ threadId: string; messageId: string; sentAt: Date } | null> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      patient: { select: { userId: true } },
      clinician: { select: { id: true, userId: true, fullName: true } },
    },
  });
  if (!appointment) return null;

  const findThread = () => prisma.messageThread.findUnique({ where: { appointmentId } });
  let thread = await findThread();
  if (!thread) {
    try {
      thread = await prisma.messageThread.create({
        data: {
          patientUserId: appointment.patient.userId,
          senderName: appointment.clinician ? `Dr. ${appointment.clinician.fullName.replace(/^Dr\.?\s*/, "")}` : "Pav Dental Clinical Team",
          subject: JSON.stringify(await encryptField(SUBJECT)),
          preview: "[Secure message]",
          recipientType: appointment.clinician ? "clinician" : "practice",
          assignedClinicianId: appointment.clinician?.id ?? null,
          appointmentId,
        },
      });
    } catch (err) {
      // Someone else made it a moment ago: use theirs.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        thread = await findThread();
      } else {
        throw err;
      }
    }
  }
  if (!thread) return null;

  const fromPatient = sender.role === "patient";
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        threadId: thread.id,
        senderRole: sender.role,
        senderName: sender.name,
        body: JSON.stringify(await encryptField(body)),
      },
    }),
    prisma.messageThread.update({
      where: { id: thread.id },
      data: {
        preview: "[Secure message]",
        isRead: !fromPatient,
        staffUnread: fromPatient,
        patientUnread: !fromPatient,
      },
    }),
  ]);

  // The push says only that a message came (V44).
  if (fromPatient) {
    if (appointment.clinician) {
      void sendUserNotification(appointment.clinician.userId, "New message", "You have a new patient message in the Pav Dental app.", {
        type: "message",
        audience: "clinician",
        threadId: thread.id,
      });
    }
  } else {
    void sendUserNotification(appointment.patient.userId, "New message from Pav Dental", "Open the Pav Dental app to read it.", {
      type: "message",
      audience: "patient",
      threadId: thread.id,
    });
  }

  return { threadId: thread.id, messageId: message.id, sentAt: message.sentAt };
}

/** The words the patient is sent when the dentist finishes a consultation. */
export function consultSummaryText(summary: {
  diagnosis?: string | null;
  notes?: string | null;
  treatmentPlan?: string | null;
  followUpRecommended?: string | null;
}): string {
  const lines = ["Your video consultation has finished. Here is what your dentist recorded."];
  if (summary.diagnosis) lines.push(`\nWhat they found: ${summary.diagnosis}`);
  if (summary.notes) lines.push(`\nAdvice: ${summary.notes}`);
  if (summary.treatmentPlan) lines.push(`\nPlan: ${summary.treatmentPlan}`);
  const follow: Record<string, string> = {
    clinic: "a visit at the clinic",
    van: "a visit from the van, at your home",
    video: "another video consultation",
  };
  if (summary.followUpRecommended && follow[summary.followUpRecommended]) {
    lines.push(`\nFollow-up advised: ${follow[summary.followUpRecommended]}.`);
  }
  lines.push("\nYou can reply here if you have a question.");
  return lines.join("");
}
