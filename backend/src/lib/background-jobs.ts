import crypto from "crypto";
import { prisma } from "./prisma";
import { logFailure } from "./best-effort";
import { communicationService } from "./communication-service";
import { pseudonymiseIp } from "./audit-security";
import { createAuditLogWithIntegrity } from "./audit-integrity";
import { releaseVanDeposit } from "./van-payments";
import { recordVanEvent } from "./van-dispatch";
import { sendPatientNotification } from "./patient-push";
import { awardMissedVisitPoints } from "./rewards";
import { checkPushReceipts } from "./push-receipts";
import { issueMissedReferralVouchers } from "./referrals";
import { runRetentionSweep } from "./retention";
import { safeError } from "./log-safety";

// Interval settings
const SLOT_EXPIRY_INTERVAL_MS = 60 * 1000; // 1 minute
const NOTIFICATION_DISPATCH_INTERVAL_MS = 60 * 1000; // 1 minute
const escapeEmailHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

const VAN_REQUEST_EXPIRY_INTERVAL_MS = 30 * 1000; // 30 seconds
// A claimed reminder batch (up to 50, each push call capped at 10 s) finishes
// well inside this; a claim older than it belongs to a dispatcher that died.
export const NOTIFICATION_CLAIM_LEASE_MS = 15 * 60 * 1000; // 15 minutes

/**
 * BE-23 (AUD-13, ADR-0002): Background job leadership using Postgres advisory locks.
 * Ensures recurring jobs coordinate safely across multiple API instances.
 */
export const JOB_LOCK_IDS = {
  SLOT_EXPIRY: 21001,
  NOTIFICATION_DISPATCH: 21002,
  VAN_REQUEST_EXPIRY: 21003,
  VAN_DEPOSIT_RETRY: 21004,
  RETENTION_SWEEP: 21005,
  PUSH_RECEIPTS: 21006,
  VISIT_POINTS: 21007,
  REFERRAL_VOUCHERS: 21008,
} as const;

export type JobLockId = (typeof JOB_LOCK_IDS)[keyof typeof JOB_LOCK_IDS];

export interface JobLockResult<T> {
  acquired: boolean;
  result?: T;
}

// Long enough to survive a missed renewal; short enough that a crashed instance's
// jobs resume within minutes.
const JOB_LEASE_MS = 5 * 60 * 1000;
const JOB_LEASE_RENEW_MS = 60 * 1000;

/**
 * Runs `fn` only if no other instance holds this job's lease; otherwise returns
 * `{ acquired: false }` without running it. No connection is held while `fn` runs,
 * so jobs work on a pool of one connection and aren't cut off by a transaction
 * timeout. The lease is renewed while `fn` runs and released when it finishes; if
 * the process dies, it expires.
 */
export async function withJobLease<T>(
  jobId: number,
  fn: () => Promise<T>,
  options?: { db?: Pick<typeof prisma, "$queryRaw" | "$executeRaw">; leaseMs?: number; renewMs?: number }
): Promise<JobLockResult<T>> {
  const db = options?.db ?? prisma;
  const leaseMs = options?.leaseMs ?? JOB_LEASE_MS;
  const holder = crypto.randomUUID();

  const claimed = await db.$queryRaw<{ holder: string }[]>`
    INSERT INTO job_leases (id, holder, expires_at)
    VALUES (${jobId}::int, ${holder}, now() + (${leaseMs}::int * interval '1 millisecond'))
    ON CONFLICT (id) DO UPDATE SET holder = EXCLUDED.holder, expires_at = EXCLUDED.expires_at
    WHERE job_leases.expires_at <= now()
    RETURNING holder
  `;
  if (claimed.length === 0) return { acquired: false };

  const renewal = setInterval(() => {
    db.$executeRaw`
      UPDATE job_leases SET expires_at = now() + (${leaseMs}::int * interval '1 millisecond')
      WHERE id = ${jobId}::int AND holder = ${holder}
    `.catch(logFailure("job lease renewal"));
  }, options?.renewMs ?? JOB_LEASE_RENEW_MS);
  renewal.unref();

  try {
    return { acquired: true, result: await fn() };
  } finally {
    clearInterval(renewal);
    // If this fails the lease expires by itself.
    await db.$executeRaw`DELETE FROM job_leases WHERE id = ${jobId}::int AND holder = ${holder}`.catch(
      logFailure("job lease release")
    );
  }
}

export const runRetentionSweepWithLock = () =>
  withJobLease(JOB_LOCK_IDS.RETENTION_SWEEP, () => runRetentionSweep());

export const checkPushReceiptsWithLock = (now?: Date) =>
  withJobLease(JOB_LOCK_IDS.PUSH_RECEIPTS, () => checkPushReceipts(now));

export const awardMissedVisitPointsWithLock = (limit?: number) =>
  withJobLease(JOB_LOCK_IDS.VISIT_POINTS, () => awardMissedVisitPoints(limit));

export const issueMissedReferralVouchersWithLock = (limit?: number) =>
  withJobLease(JOB_LOCK_IDS.REFERRAL_VOUCHERS, () => issueMissedReferralVouchers(limit));

export const processExpiredSlotHoldsWithLock = () =>
  withJobLease(JOB_LOCK_IDS.SLOT_EXPIRY, () => processExpiredSlotHolds());

export const processDueScheduledNotificationsWithLock = () =>
  withJobLease(JOB_LOCK_IDS.NOTIFICATION_DISPATCH, () => processDueScheduledNotifications());

export const processExpiredVanRequestsWithLock = () =>
  withJobLease(JOB_LOCK_IDS.VAN_REQUEST_EXPIRY, () => processExpiredVanRequests());

export const retryFailedVanDepositReleasesWithLock = () =>
  withJobLease(JOB_LOCK_IDS.VAN_DEPOSIT_RETRY, () => retryFailedVanDepositReleases());

let slotExpiryTimer: NodeJS.Timeout | null = null;
let notificationDispatchTimer: NodeJS.Timeout | null = null;
let vanRequestExpiryTimer: NodeJS.Timeout | null = null;

/**
 * Checks whether the given date/time falls within quiet hours according to Europe/London local time.
 */
export function isInQuietHours(
  date: Date = new Date(),
  startStr: string = "22:00",
  endStr: string = "08:00",
  timeZone: string = "Europe/London"
): boolean {
  if (!startStr || !endStr) return false;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const currentMinutes = hour * 60 + minute;

  const [startH, startM] = startStr.split(":").map((v) => parseInt(v, 10));
  const [endH, endM] = endStr.split(":").map((v) => parseInt(v, 10));
  const startMinutes = (startH || 0) * 60 + (startM || 0);
  const endMinutes = (endH || 0) * 60 + (endM || 0);

  if (startMinutes === endMinutes) return false;

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

/**
 * Returns a Date representing the next time quiet hours end in London time.
 */
export function getNextQuietHoursEnd(
  date: Date = new Date(),
  endStr: string = "08:00",
  timeZone: string = "Europe/London"
): Date {
  const [endH, endM] = endStr.split(":").map((v) => parseInt(v, 10));

  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);

  const year = parseInt(parts.find((p) => p.type === "year")?.value || "1970", 10);
  const month = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10);
  const day = parseInt(parts.find((p) => p.type === "day")?.value || "1", 10);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

  const currentMinutes = hour * 60 + minute;
  const endMinutes = (endH || 0) * 60 + (endM || 0);

  const targetDay = currentMinutes >= endMinutes ? day + 1 : day;

  // Approximate noon UTC on target day
  const approxUtc = new Date(Date.UTC(year, month - 1, targetDay, 12, 0, 0));
  const tParts = dtf.formatToParts(approxUtc);
  const tYear = tParts.find((p) => p.type === "year")!.value;
  const tMonth = tParts.find((p) => p.type === "month")!.value;
  const tDay = tParts.find((p) => p.type === "day")!.value;

  // CS-54: Determine exact UTC moment for endH:endM in timeZone (Europe/London handles GMT vs BST)
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoBase = `${tYear}-${tMonth}-${tDay}T${pad(endH || 0)}:${pad(endM || 0)}:00Z`;
  const candidateUtc = new Date(isoBase);
  const candParts = dtf.formatToParts(candidateUtc);
  const candHour = parseInt(candParts.find((p) => p.type === "hour")?.value || "0", 10);
  const offsetHours = candHour - (endH || 0);

  return new Date(candidateUtc.getTime() - offsetHours * 60 * 60 * 1000);
}

/**
 * Sweeps expired draft_hold appointments and transitions them to cancelled.
 */
export async function processExpiredSlotHolds(): Promise<{ expiredCount: number }> {
  const now = new Date();

  try {
    // BJ-5: Atomically cancel and return only the rows that were actually updated
    // Note: hold_expires_at is timestamp without time zone storing UTC, so compare with timezone('UTC', now())
    const expiredRows = await prisma.$queryRaw<Array<{ id: string }>>`
      UPDATE appointments
      SET status = 'cancelled'
      WHERE id IN (
        SELECT id FROM appointments
        WHERE status = 'draft_hold' AND hold_expires_at <= timezone('UTC', now())
        LIMIT 100
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id;
    `;

    if (expiredRows.length === 0) {
      return { expiredCount: 0 };
    }

    // Audit log only the cancelled rows
    for (const appt of expiredRows) {
      await createAuditLogWithIntegrity({
        action: "appointment.hold_expired",
        actorId: null,
        resourceId: appt.id,
        sessionId: null,
        ipHash: pseudonymiseIp("127.0.0.1"),
        metadata: { reason: "10-minute hold window elapsed without payment" },
      }).catch(logFailure("audit write appointment.hold_expired"));

      await cancelAppointmentReminders(appt.id).catch(logFailure("reminder cancellation"));
    }

    console.log(`[BACKGROUND JOBS] Expired ${expiredRows.length} draft holds`);
    return { expiredCount: expiredRows.length };
  } catch (error) {
    console.error("[BACKGROUND JOBS] Error processing expired slot holds:", safeError(error));
    return { expiredCount: 0 };
  }
}

/**
 * Dispatches due scheduled notifications via push (and records delivery history).
 */
export async function processDueScheduledNotifications(): Promise<{ dispatchedCount: number }> {
  const now = new Date();

  try {
    // BE-22: a dispatcher that died between claiming a row and finishing it
    // (deploy, crash, sleep) leaves it in 'sending'. Once the lease has run
    // out, put it back so it is retried. Rows claimed before claimed_at
    // existed have no timestamp and are treated as expired.
    const leaseCutoff = new Date(now.getTime() - NOTIFICATION_CLAIM_LEASE_MS);
    await prisma.$executeRaw`
      UPDATE scheduled_notifications
      SET status = 'pending', claimed_at = NULL
      WHERE status = 'sending'
        AND (claimed_at IS NULL OR claimed_at < ${leaseCutoff})
    `;

    // BJ-3: Multi-replica atomic claim step using FOR UPDATE SKIP LOCKED
    const claimedRows = await prisma.$queryRaw<Array<{ id: string }>>`
      UPDATE scheduled_notifications
      SET status = 'sending', claimed_at = ${now}
      WHERE id IN (
        SELECT id
        FROM scheduled_notifications
        WHERE status = 'pending'
          AND scheduled_for <= ${now}
        ORDER BY scheduled_for ASC
        LIMIT 50
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id;
    `;

    if (claimedRows.length === 0) {
      return { dispatchedCount: 0 };
    }

    const claimedIds = claimedRows.map((r) => r.id);
    const dueNotifications = await prisma.scheduledNotification.findMany({
      where: { id: { in: claimedIds } },
      include: {
        user: {
          include: {
            pushTokens: { where: { active: true } },
            notificationPreferences: true,
          },
        },
      },
    });

    let dispatchedCount = 0;

    for (const notification of dueNotifications) {
      const { user } = notification;

      // BJ-1: Re-verify appointment status before dispatching
      const apptId = (notification.data as any)?.appointmentId;
      if (apptId) {
        const appt = await prisma.appointment.findUnique({
          where: { id: apptId },
          select: { status: true },
        });
        if (!appt || appt.status !== "confirmed") {
          await prisma.scheduledNotification.update({
            where: { id: notification.id },
            data: { status: "cancelled", sentAt: now },
          });
          continue;
        }
      }

      // PP-1: Check user preferences (missing preferences row defaults to pushEnabled: true)
      const preferences = user.notificationPreferences;
      const pushEnabled = preferences ? preferences.pushEnabled : true;
      // The Email switch is honoured too: a reminder goes by every channel the patient left on.
      const emailEnabled = Boolean(user.email) && (preferences ? preferences.emailEnabled && preferences.appointmentReminders : true);
      if (!pushEnabled && !emailEnabled) {
        await prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: { status: "cancelled", sentAt: now },
        });
        continue;
      }

      // PP-3 / NT-2: Quiet hours evaluation in Europe/London timezone
      if (preferences && isInQuietHours(now, preferences.quietHoursStart, preferences.quietHoursEnd)) {
        const nextEnd = getNextQuietHoursEnd(now, preferences.quietHoursEnd);
        const apptStartTime = (notification.data as any)?.startTimeUtc ? new Date((notification.data as any).startTimeUtc) : null;
        if (apptStartTime && apptStartTime <= nextEnd) {
          await prisma.scheduledNotification.update({
            where: { id: notification.id },
            data: { status: "cancelled", sentAt: now },
          });
        } else {
          await prisma.scheduledNotification.update({
            where: { id: notification.id },
            data: { status: "pending", scheduledFor: nextEnd },
          });
        }
        continue;
      }

      const pushTokens = pushEnabled ? user.pushTokens.map((t) => t.token) : [];

      try {
        if (pushTokens.length > 0) {
          const messages = pushTokens.map((token) => ({
            to: token,
            sound: "default" as const,
            title: notification.title,
            body: notification.body,
            data: (notification.data as Record<string, unknown>) || {},
          }));

          const sendResult = await communicationService.sendExpoPushNotifications(messages);
          if (sendResult.failedCount > 0 && sendResult.sentCount === 0) {
            throw new Error("All push notifications failed to send");
          }
        }

        if (emailEnabled) {
          // Best effort: a failed email must not make the push retry and repeat.
          await communicationService
            .sendEmail({
              to: user.email,
              subject: notification.title,
              text: `Pav Dental\n\n${notification.body}`,
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #0D9488;">Pav Dental</h2><p>${escapeEmailHtml(notification.body)}</p></div>`,
            })
            .catch((err) => console.error("[BACKGROUND JOBS] Reminder email failed:", safeError(err)));
        }

        // Record in notification history
        await prisma.notificationHistory.create({
          data: {
            userId: user.id,
            type: "reminder",
            title: notification.title,
            body: notification.body,
            data: (notification.data as any) || {},
            sentAt: now,
            status: pushTokens.length > 0 ? "delivered" : "sent",
          },
        }).catch(() => {});

        // Mark scheduled notification as sent
        await prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: { status: "sent", sentAt: now },
        });

        dispatchedCount++;
      } catch (itemErr: any) {
        // BJ-3: Per-item error handling with attempt cap
        const nextAttempts = (notification.attempts || 0) + 1;
        const lastError = itemErr instanceof Error ? itemErr.message : String(itemErr);
        const maxAttempts = 3;

        await prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: {
            attempts: nextAttempts,
            lastError,
            status: nextAttempts >= maxAttempts ? "failed" : "pending",
          },
        });
      }
    }

    if (dispatchedCount > 0) {
      console.log(`[BACKGROUND JOBS] Dispatched ${dispatchedCount} scheduled notifications`);
    }

    return { dispatchedCount };
  } catch (error) {
    console.error("[BACKGROUND JOBS] Error processing scheduled notifications:", safeError(error));
    return { dispatchedCount: 0 };
  }
}

export interface ReminderLadderInput {
  channel: string;
  dateFormatted: string;
  timeFormatted: string;
  /** The clinician's name, or the clinic's when none is assigned. */
  personName: string;
  clinicName: string;
}

/**
 * The wording of the 48h / 24h / 2h reminders. A video consultation has no
 * clinic to arrive at, so it gets its own words (V3).
 */
export interface ReminderStep {
  hoursBefore: number;
  minutesBefore: number;
  title: string;
  body: string;
  /** Where tapping the reminder goes, when it is not the appointment screen. */
  screen?: "waiting_room";
}

export function buildReminderLadder(input: ReminderLadderInput): ReminderStep[] {
  const { channel, dateFormatted, timeFormatted, personName, clinicName } = input;
  const step = (minutesBefore: number, title: string, body: string, screen?: "waiting_room"): ReminderStep => ({
    hoursBefore: minutesBefore / 60,
    minutesBefore,
    title,
    body,
    ...(screen ? { screen } : {}),
  });
  if (channel === "video") {
    // 24 hours, 1 hour and 10 minutes before; the last opens the waiting room (V7).
    return [
      step(
        24 * 60,
        "Video consultation tomorrow - Pav Dental",
        `Your video consultation is tomorrow at ${timeFormatted} with ${personName}. Check your camera and microphone in the app before then.`
      ),
      step(60, "Video consultation in 1 hour - Pav Dental", `Your video consultation is at ${timeFormatted}. Find a quiet, well-lit spot.`),
      step(
        10,
        "Your video consultation is about to start",
        `The waiting room is open. Tap to join your video consultation at ${timeFormatted}.`,
        "waiting_room"
      ),
    ];
  }
  return [
    step(
      48 * 60,
      "Appointment in 48 Hours - Pav Dental",
      // CS-54: Neutral copy on lock screen (no clinical service names)
      `Reminder: Your appointment is scheduled for ${dateFormatted} at ${timeFormatted}. You can cancel or move it from the app.`
    ),
    step(
      24 * 60,
      "Appointment Tomorrow - Pav Dental",
      `Your visit is tomorrow at ${timeFormatted} with ${personName}. Please remember to arrive 10 minutes early.`
    ),
    step(
      2 * 60,
      "Appointment in 2 Hours - Pav Dental",
      // CS-54: Neutral copy on lock screen (no clinical service names)
      `See you soon! Your appointment is at ${timeFormatted} at ${clinicName}. Tap for directions and check-in info.`
    ),
  ];
}

/**
 * Schedules the 48h / 24h / 2h reminder notification ladder for a confirmed appointment.
 */
export async function scheduleAppointmentReminderLadder(appointmentId: string): Promise<void> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { select: { userId: true, firstName: true } },
        service: { select: { name: true } },
        clinic: { select: { name: true, address: true } },
        clinician: { select: { fullName: true } },
      },
    });

    if (!appointment || !appointment.patient?.userId) return;

    const userId = appointment.patient.userId;
    const startTime = new Date(appointment.startTimeUtc);
    const clinicName = appointment.clinic?.name || "Pav Dental";
    const timeFormatted = startTime.toLocaleTimeString("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateFormatted = startTime.toLocaleDateString("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    const ladder = buildReminderLadder({
      channel: appointment.channel,
      dateFormatted,
      timeFormatted,
      personName: appointment.clinician?.fullName || clinicName,
      clinicName,
    });

    const now = Date.now();

    for (const step of ladder) {
      const scheduledFor = new Date(startTime.getTime() - step.minutesBefore * 60 * 1000);

      // Only schedule if the reminder time is in the future
      if (scheduledFor.getTime() > now) {
        // BJ-4: Guard against duplicate scheduling on webhook replay or concurrent redeliveries
        // Matched per appointment and time (V8): two bookings at the same time,
        // for a parent and a child, must each get their own reminder.
        const existing = await prisma.scheduledNotification.findFirst({
          where: {
            userId,
            scheduledFor,
            status: "pending",
            data: { path: ["appointmentId"], equals: appointment.id },
          },
        });

        if (!existing) {
          await prisma.scheduledNotification.create({
            data: {
              userId,
              title: step.title,
              body: step.body,
              data: {
                appointmentId: appointment.id,
                type: "appointment_reminder",
                hoursBefore: step.hoursBefore,
                minutesBefore: step.minutesBefore,
                ...(step.screen ? { screen: step.screen } : {}),
                startTimeUtc: appointment.startTimeUtc.toISOString(),
              },
              scheduledFor,
              status: "pending",
            },
          });
        }
      }
    }

    console.log(`[BACKGROUND JOBS] Scheduled reminder ladder for appointment ${appointmentId}`);
  } catch (error) {
    console.error("[BACKGROUND JOBS] Failed to schedule reminder ladder for appointment:", appointmentId, safeError(error));
  }
}

/**
 * Cancels all pending scheduled reminder notifications for an appointment.
 * Closes BK-6.
 */
export async function cancelAppointmentReminders(appointmentId: string): Promise<number> {
  try {
    const deleted = await prisma.scheduledNotification.deleteMany({
      where: {
        status: "pending",
        data: {
          path: ["appointmentId"],
          equals: appointmentId,
        },
      },
    });
    return deleted.count;
  } catch (error) {
    console.error("[BACKGROUND JOBS] Failed to cancel reminders for appointment:", appointmentId, safeError(error));
    return 0;
  }
}

/**
 * Sweeps pending van service requests that have passed their expiresAt TTL.
 * Each expired request has its deposit PaymentIntent released (the hold is
 * cancelled — the patient is never left with a pending card authorisation),
 * then the request is marked expired and the patient is notified. Requests
 * whose release failed stay pending and are retried on the next pass; the
 * accept-time expiry check remains a final fallback.
 */
export async function processExpiredVanRequests(): Promise<{ expiredCount: number }> {
  const now = new Date();
  try {
    const stale = await prisma.vanServiceRequest.findMany({
      where: {
        status: "pending",
        expiresAt: { lte: now },
      },
      select: {
        id: true,
        patientId: true,
        paymentIntentId: true,
        shiftId: true,
      },
      take: 50, // Batch limit per cycle
    });

    let expiredCount = 0;
    for (const request of stale) {
      if (!request.shiftId) continue;
      let releaseStatus: string | null = null;
      let shouldNotify = false;

      await prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${request.shiftId}`}))`;

          // Compare-and-set: only expire if still pending under the lock (CS-49)
          const result = await tx.vanServiceRequest.updateMany({
            where: { id: request.id, status: "pending" },
            data: { status: "expired" },
          });

          if (result.count === 0) return; // Operator accepted or declined mid-sweep

          let releasedAt: Date | null = null;
          if (request.paymentIntentId) {
            const release = await releaseVanDeposit(request.paymentIntentId, "expired");
            releaseStatus = release.status;
            if (["released", "already_released", "refunded", "mock"].includes(release.status)) {
              releasedAt = new Date();
            }
          }

          await tx.vanServiceRequest.update({
            where: { id: request.id },
            data: {
              depositReleaseStatus: releaseStatus as any,
              depositReleasedAt: releasedAt,
            },
          });

          await recordVanEvent(tx, { requestId: request.id, type: "expired", actorRole: "system" });
          expiredCount++;
          shouldNotify = true;
        },
        { maxWait: 10_000, timeout: 30_000 }
      );

      if (shouldNotify) {
        const message = releaseStatus === "failed"
          ? "No operator accepted your van request in time, so it has expired. We are releasing your deposit hold."
          : "No operator accepted your van request in time, so it has expired. No deposit was taken — please try again later.";

        await sendPatientNotification(
          request.patientId,
          "Van Request Expired",
          message,
          { requestId: request.id, status: "expired" }
        ).catch(() => {});
      }
    }

    if (expiredCount > 0) {
      console.log(`[BACKGROUND JOBS] Expired ${expiredCount} van request(s) with deposit release`);
    }
    return { expiredCount };
  } catch (error) {
    console.error("[BACKGROUND JOBS] Error expiring van requests:", safeError(error));
    return { expiredCount: 0 };
  }
}

/**
 * Retries failed deposit releases for terminal van requests (expired, declined, cancelled).
 * Closes VP-2.
 */
export async function retryFailedVanDepositReleases(): Promise<{ retriedCount: number; succeededCount: number }> {
  try {
    const failed = await prisma.vanServiceRequest.findMany({
      where: {
        status: { in: ["expired", "declined", "cancelled"] },
        depositReleaseStatus: "failed",
        paymentIntentId: { not: null },
      },
      select: {
        id: true,
        status: true,
        paymentIntentId: true,
      },
      take: 50,
    });

    let succeededCount = 0;
    for (const req of failed) {
      if (!req.paymentIntentId) continue;
      const reason =
        req.status === "declined"
          ? "operator_declined"
          : req.status === "cancelled"
            ? "patient_cancelled"
            : "expired";

      const release = await releaseVanDeposit(req.paymentIntentId, reason);
      if (release.status !== "failed") {
        succeededCount++;
        await prisma.vanServiceRequest.update({
          where: { id: req.id },
          data: {
            depositReleaseStatus: release.status,
            depositReleasedAt: new Date(),
          },
        });
      }
    }

    if (failed.length > 0) {
      console.log(`[BACKGROUND JOBS] Retried ${failed.length} failed van deposit release(s), ${succeededCount} succeeded`);
    }
    return { retriedCount: failed.length, succeededCount };
  } catch (error) {
    console.error("[BACKGROUND JOBS] Error retrying failed van deposit releases:", safeError(error));
    return { retriedCount: 0, succeededCount: 0 };
  }
}

/**
 * Starts all background job workers.
 */
const RETENTION_SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000;
let retentionSweepTimer: NodeJS.Timeout | null = null;
const PUSH_RECEIPT_INTERVAL_MS = 15 * 60 * 1000;
let pushReceiptTimer: NodeJS.Timeout | null = null;

export function startBackgroundJobs(): void {
  console.log("[BACKGROUND JOBS] Starting background workers with lease coordination");

  // Run immediately on boot
  processExpiredSlotHoldsWithLock().catch(logFailure("slot hold expiry job"));
  processDueScheduledNotificationsWithLock().catch(logFailure("reminder dispatch job"));
  processExpiredVanRequestsWithLock().catch(logFailure("van request expiry job"));
  retryFailedVanDepositReleasesWithLock().catch(logFailure("van deposit retry job"));

  // Recurring timers
  slotExpiryTimer = setInterval(() => {
    processExpiredSlotHoldsWithLock().catch(logFailure("slot hold expiry job"));
    awardMissedVisitPointsWithLock().catch((err) => {
      console.error("[BACKGROUND JOBS] Visit points catch-up failed:", err instanceof Error ? err.name : "unknown error");
    });
    issueMissedReferralVouchersWithLock().catch((err) => {
      console.error("[BACKGROUND JOBS] Referral voucher catch-up failed:", err instanceof Error ? err.name : "unknown error");
    });
  }, SLOT_EXPIRY_INTERVAL_MS);

  notificationDispatchTimer = setInterval(() => {
    processDueScheduledNotificationsWithLock().catch(logFailure("reminder dispatch job"));
  }, NOTIFICATION_DISPATCH_INTERVAL_MS);

  vanRequestExpiryTimer = setInterval(() => {
    processExpiredVanRequestsWithLock().catch(logFailure("van request expiry job"));
    retryFailedVanDepositReleasesWithLock().catch(logFailure("van deposit retry job"));
  }, VAN_REQUEST_EXPIRY_INTERVAL_MS);

  retentionSweepTimer = setInterval(() => {
    runRetentionSweepWithLock().catch((err) => {
      console.error("[BACKGROUND JOBS] Retention sweep failed:", err instanceof Error ? err.name : "unknown error");
    });
  }, RETENTION_SWEEP_INTERVAL_MS);

  pushReceiptTimer = setInterval(() => {
    checkPushReceiptsWithLock().catch((err) => {
      console.error("[BACKGROUND JOBS] Push receipt check failed:", err instanceof Error ? err.name : "unknown error");
    });
  }, PUSH_RECEIPT_INTERVAL_MS);
}

/**
 * Stops all background job workers (for graceful shutdown and tests).
 */
export function stopBackgroundJobs(): void {
  if (slotExpiryTimer) {
    clearInterval(slotExpiryTimer);
    slotExpiryTimer = null;
  }
  if (notificationDispatchTimer) {
    clearInterval(notificationDispatchTimer);
    notificationDispatchTimer = null;
  }
  if (vanRequestExpiryTimer) {
    clearInterval(vanRequestExpiryTimer);
    vanRequestExpiryTimer = null;
  }
  if (retentionSweepTimer) {
    clearInterval(retentionSweepTimer);
    retentionSweepTimer = null;
  }
  if (pushReceiptTimer) {
    clearInterval(pushReceiptTimer);
    pushReceiptTimer = null;
  }
  console.log("[BACKGROUND JOBS] Stopped background workers");
}

