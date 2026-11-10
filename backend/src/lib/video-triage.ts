import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/** At most this many triage photos per consultation (V29). */
export const MAX_TRIAGE_PHOTOS = 6;

type Tx = Prisma.TransactionClient;

/**
 * Runs `fn` inside a transaction that holds a row lock on one appointment, so
 * two requests that read, change and write the appointment's encrypted triage
 * record (admit, submit-triage, end-consult, photo upload) take turns instead
 * of overwriting each other (V25). `fn` receives the freshly read row.
 */
export async function withLockedAppointment<T>(
  appointmentId: string,
  fn: (tx: Tx, appointment: Prisma.AppointmentGetPayload<{ include: { patient: { include: { user: true } } } }> | null) => Promise<T>
): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM appointments WHERE id = ${appointmentId}::uuid FOR UPDATE`;
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: { include: { user: true } } },
      });
      return fn(tx, appointment);
    },
    { timeout: 15_000 }
  );
}

/** The file's real type from its first bytes, not from what the phone says it is. */
export function sniffImageMime(buf: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/** The patient counts as waiting while their app has reported in this recently. */
export const PATIENT_PRESENT_SECONDS = 30;
/** The waiting room opens this long before the start time (decision 6). */
export const WAITING_ROOM_OPENS_MINUTES = 10;

export function patientIsPresent(lastSeenAt: Date | null | undefined, now: number = Date.now()): boolean {
  return !!lastSeenAt && now - lastSeenAt.getTime() <= PATIENT_PRESENT_SECONDS * 1000;
}

/** True from 10 minutes before the start until the slot ends. */
export function waitingRoomIsOpen(start: Date, end: Date, now: number = Date.now()): boolean {
  return now >= start.getTime() - WAITING_ROOM_OPENS_MINUTES * 60_000 && now < end.getTime();
}
