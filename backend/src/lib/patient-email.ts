// backend/src/lib/patient-email.ts
// Emails to the patient about their own appointment: booked, cancelled, moved.
//
// Keeps lock-screen-style privacy (CS-54): the email names the date, time and
// place only, never the treatment. Honours the patient's Email switch and
// "appointment confirmations" setting. Never throws: a failed email must not
// break booking, cancelling or rescheduling.

import { prisma } from "./prisma";
import { communicationService } from "./communication-service";
import { safeError } from "./log-safety";
import { logger } from "./structured-logging";
import { buildAppointmentEmail, buildAppointmentPush, type AppointmentEmailKind } from "./patient-email-content";
import { sendPatientNotification } from "./patient-push";
import { EMAIL_RETRY_WINDOW_MS, pickEmailsToRetry } from "./patient-email-retry";

/**
 * The record kept of an appointment email (V6): that it was sent and whether it was delivered,
 * against the appointment. It keeps the subject, never the body.
 */
export function appointmentEmailRecord(input: {
  userId: string;
  appointmentId: string;
  kind: AppointmentEmailKind;
  subject: string;
  delivered: boolean;
  /** "skipped" settles an email that is no longer wanted, so it is not tried again. */
  skipped?: boolean;
  /** Kept so a retry of a cancellation email can still say what was refunded. */
  refundPence?: number;
}) {
  return {
    userId: input.userId,
    type: "email",
    title: input.subject,
    body: "",
    data: {
      type: `appointment_${input.kind}`,
      appointmentId: input.appointmentId,
      ...(input.refundPence !== undefined ? { refundPence: input.refundPence } : {}),
    },
    status: input.skipped ? "skipped" : input.delivered ? "sent" : "failed",
  };
}

export async function sendAppointmentEmail(
  kind: AppointmentEmailKind,
  appointmentId: string,
  extra: { refundPence?: number } = {}
): Promise<void> {
  await deliverAppointmentEmail(kind, appointmentId, extra, false);
}

async function deliverAppointmentEmail(
  kind: AppointmentEmailKind,
  appointmentId: string,
  extra: { refundPence?: number },
  isRetry: boolean
): Promise<void> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        clinic: { select: { name: true, address: true, postcode: true } },
        patient: {
          select: {
            user: { select: { id: true, email: true, notificationPreferences: true } },
          },
        },
      },
    });
    const user = appointment?.patient?.user;
    if (!appointment || !user?.email) return;

    // On a retry, the email may no longer be wanted: record that, so it is not tried again.
    const skipRetry = async (reason: string) => {
      if (isRetry) {
        await prisma.notificationHistory.create({
          data: appointmentEmailRecord({ userId: user.id, appointmentId, kind, subject: reason, delivered: false, skipped: true }),
        });
      }
    };

    const prefs = user.notificationPreferences;
    const emailOn = prefs ? prefs.emailEnabled : true;
    const confirmationsOn = prefs ? prefs.appointmentConfirmations : true;
    if (!emailOn || !confirmationsOn) return skipRetry("Switched off");
    // A "booked" or "moved" email must not arrive after the visit was cancelled.
    if (isRetry && kind !== "cancelled" && appointment.status === "cancelled") return skipRetry("Visit cancelled");

    const clinic = appointment.clinic;
    const placeLine = clinic ? [clinic.name, clinic.address, clinic.postcode].filter(Boolean).join(", ") : null;
    const email = buildAppointmentEmail({
      kind,
      startTimeUtc: appointment.startTimeUtc,
      channel: String(appointment.channel),
      placeLine,
      refundPence: extra.refundPence,
    });
    const result = await communicationService.sendEmail({ to: user.email, ...email });
    await prisma.notificationHistory.create({
      data: appointmentEmailRecord({
        userId: user.id,
        appointmentId,
        kind,
        subject: email.subject,
        delivered: result.success,
        refundPence: extra.refundPence,
      }),
    });
  } catch (err) {
    logger.error("[PatientEmail] Failed to send appointment email", undefined, safeError(err));
  }
}

/**
 * Tries again the appointment emails that failed (D1), so a Postmark outage does not lose them.
 * Which ones, and how often, is decided in `patient-email-retry.ts`.
 */
export async function retryFailedAppointmentEmails(now: Date = new Date()): Promise<{ retriedCount: number }> {
  try {
    const rows = await prisma.notificationHistory.findMany({
      where: { type: "email", sentAt: { gte: new Date(now.getTime() - EMAIL_RETRY_WINDOW_MS) } },
      select: { userId: true, status: true, sentAt: true, data: true },
      orderBy: { sentAt: "asc" },
      take: 2000,
    });
    const due = pickEmailsToRetry(rows, now).slice(0, 50);
    for (const email of due) {
      await deliverAppointmentEmail(email.kind, email.appointmentId, { refundPence: email.refundPence }, true);
    }
    if (due.length > 0) logger.info(`[BACKGROUND JOBS] Retried ${due.length} appointment email(s)`);
    return { retriedCount: due.length };
  } catch (err) {
    logger.error("[BACKGROUND JOBS] Error retrying appointment emails", undefined, safeError(err));
    return { retriedCount: 0 };
  }
}

/**
 * Tells the patient about a booking change on both channels: a push, and the
 * email. Each honours its own switch, and each failure stays its own, so a
 * failed email never stops the push (V1, V2).
 */
export async function notifyAppointmentChange(
  kind: AppointmentEmailKind,
  appointmentId: string,
  extra: { refundPence?: number } = {}
): Promise<void> {
  await Promise.allSettled([sendAppointmentEmail(kind, appointmentId, extra), sendAppointmentPush(kind, appointmentId)]);
}

async function sendAppointmentPush(kind: AppointmentEmailKind, appointmentId: string): Promise<void> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        patientId: true,
        startTimeUtc: true,
        channel: true,
        patient: { select: { user: { select: { notificationPreferences: true } } } },
      },
    });
    if (!appointment) return;
    const prefs = appointment.patient?.user?.notificationPreferences;
    // The same "appointment confirmations" setting as the email; push switch is checked inside.
    if (prefs && !prefs.appointmentConfirmations) return;
    const { title, body } = buildAppointmentPush({
      kind,
      startTimeUtc: appointment.startTimeUtc,
      channel: String(appointment.channel),
    });
    await sendPatientNotification(appointment.patientId, title, body, {
      type: `appointment_${kind}`,
      appointmentId,
    });
  } catch (err) {
    logger.error("[PatientEmail] Failed to send appointment push", undefined, safeError(err));
  }
}
