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
import { buildAppointmentEmail, buildAppointmentPush, type AppointmentEmailKind } from "./patient-email-content";
import { sendPatientNotification } from "./patient-push";

export async function sendAppointmentEmail(
  kind: AppointmentEmailKind,
  appointmentId: string,
  extra: { refundPence?: number } = {}
): Promise<void> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        clinic: { select: { name: true, address: true, postcode: true } },
        patient: {
          select: {
            user: { select: { email: true, notificationPreferences: true } },
          },
        },
      },
    });
    const user = appointment?.patient?.user;
    if (!appointment || !user?.email) return;

    const prefs = user.notificationPreferences;
    const emailOn = prefs ? prefs.emailEnabled : true;
    const confirmationsOn = prefs ? prefs.appointmentConfirmations : true;
    if (!emailOn || !confirmationsOn) return;

    const clinic = appointment.clinic;
    const placeLine = clinic ? [clinic.name, clinic.address, clinic.postcode].filter(Boolean).join(", ") : null;
    const email = buildAppointmentEmail({
      kind,
      startTimeUtc: appointment.startTimeUtc,
      channel: String(appointment.channel),
      placeLine,
      refundPence: extra.refundPence,
    });
    await communicationService.sendEmail({ to: user.email, ...email });
  } catch (err) {
    console.error("[PatientEmail] Failed to send appointment email:", safeError(err));
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
    console.error("[PatientEmail] Failed to send appointment push:", safeError(err));
  }
}
