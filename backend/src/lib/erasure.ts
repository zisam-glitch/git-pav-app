import { Prisma } from "@prisma/client";
import Stripe from "stripe";
import { env } from "../config/env";
import { prisma } from "./prisma";
import { createAuditLogWithIntegrity } from "./audit-integrity";
import { denySessions } from "./session-revocation";
import { safeError } from "./log-safety";
import { logger } from "./structured-logging";

// Erasure (UK GDPR Art. 17, CS-23). The clinical record is kept for the
// statutory period (decisions log #9, draft pending legal review): 11 years
// after the last treatment, or until the patient's 25th birthday if that is
// later. Everything else that identifies or contacts the patient goes now:
// login, contact details, cards, push tokens, notifications, rewards and the
// waitlist. Users are never hard-deleted here; a later sweep reports records
// whose retention has ended.

export const CLINICAL_RETENTION_YEARS = 11;
export const CHILD_RETENTION_AGE = 25;

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as never,
});

export class ErasureBlockedError extends Error {
  constructor(
    message: string,
    readonly upcoming: { id: string; kind: "appointment" | "van_request"; startTimeUtc: string | null }[]
  ) {
    super(message);
  }
}

/** One calendar month after the request (Art. 12(3)), clamped at month end. */
export function erasureDueDate(requestedAt: Date): Date {
  const due = new Date(requestedAt);
  const day = due.getUTCDate();
  due.setUTCDate(1);
  due.setUTCMonth(due.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth() + 1, 0)).getUTCDate();
  due.setUTCDate(Math.min(day, lastDay));
  return due;
}

const addYears = (date: Date, years: number) => {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
};

/**
 * The date the clinical record may be destroyed: 11 years after the last
 * clinical activity, or the 25th birthday of the patient (or of a dependant
 * seen under this account) if later. With no clinical record at all, today.
 */
export function retentionEndDate(input: { lastClinicalActivity: Date | null; dobs: (Date | null)[]; today?: Date }): Date {
  const today = input.today ?? new Date();
  if (!input.lastClinicalActivity) return addYears(today, 0);
  const candidates = [addYears(input.lastClinicalActivity, CLINICAL_RETENTION_YEARS)];
  for (const dob of input.dobs) if (dob) candidates.push(addYears(dob, CHILD_RETENTION_AGE));
  return new Date(Math.max(...candidates.map((d) => d.getTime())));
}

/** Upcoming paid bookings the patient must cancel first (decisions log #21). */
export async function upcomingBookings(patientProfileId: string) {
  const now = new Date();
  const [appointments, vanRequests] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: patientProfileId, status: { in: ["confirmed", "in_progress"] }, startTimeUtc: { gt: now } },
      select: { id: true, startTimeUtc: true },
      orderBy: { startTimeUtc: "asc" },
    }),
    prisma.vanServiceRequest.findMany({
      where: { patientId: patientProfileId, status: { in: ["pending", "accepted", "in_progress"] } },
      select: { id: true },
    }),
  ]);
  return [
    ...appointments.map((a) => ({ id: a.id, kind: "appointment" as const, startTimeUtc: a.startTimeUtc.toISOString() })),
    ...vanRequests.map((v) => ({ id: v.id, kind: "van_request" as const, startTimeUtc: null })),
  ];
}

async function lastClinicalActivity(patientProfileId: string): Promise<Date | null> {
  const [appointment, plan, document, prescription] = await Promise.all([
    prisma.appointment.findFirst({
      where: { patientId: patientProfileId, status: { in: ["completed", "in_progress", "no_show"] } },
      orderBy: { startTimeUtc: "desc" },
      select: { startTimeUtc: true },
    }),
    prisma.treatmentPlan.findFirst({ where: { patientId: patientProfileId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.documentVault.findFirst({ where: { patientId: patientProfileId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.prescription.findFirst({
      where: { appointment: { patientId: patientProfileId } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);
  const dates = [appointment?.startTimeUtc, plan?.createdAt, document?.createdAt, prescription?.createdAt].filter(
    (d): d is Date => !!d
  );
  return dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
}

/**
 * Erases a patient's account. Throws ErasureBlockedError while they have
 * upcoming paid bookings. Safe to run again on an erased account.
 */
export async function erasePatient(userId: string, opts: { handledById: string; erasureRequestId?: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      erasedAt: true,
      patientProfile: { select: { id: true, dob: true, stripeCustomerId: true, guardianDependants: { select: { dob: true } } } },
      savedPaymentMethods: { select: { id: true, stripePaymentMethodId: true } },
    },
  });
  if (!user) throw new Error("Account not found");
  const profile = user.patientProfile;
  if (user.role !== "patient" || !profile) throw new Error("Only patient accounts are erased this way");

  const blockers = await upcomingBookings(profile.id);
  if (blockers.length > 0) {
    throw new ErasureBlockedError("The patient has upcoming bookings. They must be cancelled first.", blockers);
  }

  // Cards first: once detached in Stripe they can't be charged again.
  for (const method of user.savedPaymentMethods) {
    if (!env.isMockStripe && !method.stripePaymentMethodId.startsWith("pm_mock_")) {
      try {
        await stripe.paymentMethods.detach(method.stripePaymentMethodId);
      } catch (error) {
        // Already detached is fine; anything else stops the run before data changes.
        if ((error as { code?: string }).code !== "resource_missing") throw error;
      }
    }
  }

  // CS-23: Delete customer in Stripe (removes stored name and email from Stripe).
  if (profile.stripeCustomerId && !env.isMockStripe && !profile.stripeCustomerId.startsWith("cus_mock_")) {
    try {
      await stripe.customers.del(profile.stripeCustomerId);
    } catch (error) {
      if ((error as { code?: string }).code !== "resource_missing") {
        logger.error("[Erasure] Failed to delete Stripe customer", undefined, safeError(error));
      }
    }
  }

  const now = new Date();
  const retainUntil = retentionEndDate({
    lastClinicalActivity: await lastClinicalActivity(profile.id),
    dobs: [profile.dob, ...profile.guardianDependants.map((d) => (d.dob ? new Date(`${d.dob}T00:00:00Z`) : null))],
    today: now,
  });

  const sessionIds = (await prisma.authSession.findMany({ where: { userId }, select: { id: true } })).map((s) => s.id);
  const counts = await prisma.$transaction(async (tx) => {
    const removed = {
      sessions: (await tx.authSession.deleteMany({ where: { userId } })).count,
      pushTokens: (await tx.pushToken.deleteMany({ where: { userId } })).count,
      scheduledNotifications: (await tx.scheduledNotification.deleteMany({ where: { userId } })).count,
      notificationHistory: (await tx.notificationHistory.deleteMany({ where: { userId } })).count,
      savedCards: (await tx.savedPaymentMethod.deleteMany({ where: { userId } })).count,
      waitlist: (await tx.waitlistEntry.deleteMany({ where: { userId } })).count,
      unusedVouchers: (await tx.rewardRedemption.deleteMany({ where: { userId, appointmentId: null } })).count,
      pointsAwards: (await tx.rewardPointsAward.deleteMany({ where: { userId } })).count,
      // Their code stops working; vouchers they earned but never used lapse.
      // A row where they joined with someone's code stays, because it backs
      // that other patient's voucher.
      referralCode: (await tx.referralCode.deleteMany({ where: { userId } })).count,
      unusedReferralVouchers: (
        await tx.referral.deleteMany({ where: { referrerUserId: userId, voucherUsedAt: null } })
      ).count,
      heldSlots: (
        await tx.appointment.updateMany({ where: { patientId: profile.id, status: "draft_hold" }, data: { status: "cancelled" } })
      ).count,
    };
    await tx.emailVerificationToken.deleteMany({ where: { userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });
    await tx.mfaCode.deleteMany({ where: { userId } });
    await tx.mfaVerification.deleteMany({ where: { userId } });
    await tx.notificationPreference.deleteMany({ where: { userId } });
    // Rewards are not clinical; the plaque, bleeding and advice fields are.
    await tx.oralHealthMetric.updateMany({ where: { userId }, data: { pointsBalance: 0, streakDays: 0, weeklyBrushing: Prisma.DbNull } });
    // Door codes and access notes for van visits.
    await tx.vanServiceRequest.updateMany({ where: { patientId: profile.id }, data: { accessDetails: {} } });
    // Consent records stay as evidence of consent, without the IP address.
    await tx.consentRecord.updateMany({ where: { patientProfileId: profile.id }, data: { ipAddress: null } });

    await tx.patientProfile.update({
      where: { id: profile.id },
      data: {
        emergencyContactName: null,
        emergencyContactPhone: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        postcode: null,
        stripeCustomerId: null,
        erasedAt: now,
        retainUntil,
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `erased-${userId}@erased.invalid`,
        phone: null,
        // Not a valid argon2 hash, so no password can ever match.
        passwordHash: "!erased",
        emailVerified: false,
        phoneVerified: false,
        mfaEnabled: false,
        mfaSecret: null,
        isActive: false,
        erasedAt: now,
      },
    });
    if (opts.erasureRequestId) {
      await tx.erasureRequest.update({
        where: { id: opts.erasureRequestId },
        data: { status: "completed", completedAt: now, handledById: opts.handledById },
      });
    }
    return removed;
  });
  // Access tokens for the deleted sessions stop working now, not in 15 minutes.
  await denySessions(sessionIds);

  await createAuditLogWithIntegrity({
    action: "gdpr.erasure_completed",
    actorId: opts.handledById,
    resourceId: profile.id,
    metadata: { erasureRequestId: opts.erasureRequestId ?? null, retainUntil: retainUntil.toISOString().slice(0, 10), removed: counts },
  });

  return { retainUntil: retainUntil.toISOString().slice(0, 10), removed: counts, alreadyErased: !!user.erasedAt };
}

/** Opens an erasure request, or returns the one already open for this account. */
export async function openErasureRequest(userId: string, source: "account_deletion" | "patient_request", reason?: string | null) {
  // CS-23: Deactivate push tokens immediately during the 30-day DPO review window
  // so logged-out devices stop receiving notifications while deletion is pending.
  await prisma.pushToken.updateMany({
    where: { userId },
    data: { active: false },
  }).catch(() => {});

  const existing = await prisma.erasureRequest.findFirst({ where: { userId, status: "pending" }, orderBy: { requestedAt: "asc" } });
  if (existing) return existing;
  const requestedAt = new Date();
  return prisma.erasureRequest.create({
    data: { userId, source, reason: reason?.slice(0, 500) || null, requestedAt, dueAt: erasureDueDate(requestedAt) },
  });
}
