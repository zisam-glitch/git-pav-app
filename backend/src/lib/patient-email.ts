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
import { buildAppointmentEmail, type AppointmentEmailKind } from "./patient-email-content";

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
