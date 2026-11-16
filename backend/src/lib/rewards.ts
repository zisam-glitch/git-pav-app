import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { createAuditLogWithIntegrity } from "./audit-integrity";
import { pseudonymiseIp } from "./audit-security";
import { issueReferralVoucher } from "./referrals";
import { safeError } from "./log-safety";
import { logger } from "./structured-logging";

// Rewards rules (decisions log #14, a default pending owner review): points
// come only from completed visits, worked out here on the server, and 100
// points buy £5 off a future deposit. Nothing is earned for signing up or
// for self-reported data.

export const POINTS_PER_COMPLETED_VISIT = 10;

export const DEPOSIT_VOUCHER = {
  id: "deposit_5",
  title: "£5 off a future deposit",
  category: "Voucher",
  pointsCost: 100,
  discountPence: 500,
  description: "Use it when you pay the deposit for your next booking.",
  icon: "check",
  inStock: true,
} as const;

export const REWARDS_CATALOG = [DEPOSIT_VOUCHER];

/** What the patient pays now: the service deposit less any voucher on the booking. */
export function depositDuePence(appointment: { depositDiscountPence: number; service: { depositPence: number } }): number {
  return Math.max(0, appointment.service.depositPence - appointment.depositDiscountPence);
}

/**
 * A voucher can go on a booking when it hasn't been used, or when the booking
 * it was on was cancelled (the patient gets it back whatever the refund).
 */
export const availableVoucherWhere = (userId: string): Prisma.RewardRedemptionWhereInput => ({
  userId,
  discountPence: { gt: 0 },
  OR: [{ appointmentId: null }, { appointment: { status: "cancelled" } }],
});

export type VisitPointsOutcome = "awarded" | "already_awarded" | "not_completed";

/**
 * Credits the patient for a completed appointment, once. The unique
 * appointment id on the award row makes a repeat (or a race) a no-op.
 */
export async function awardVisitPoints(appointmentId: string): Promise<VisitPointsOutcome> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true, patient: { select: { userId: true } } },
  });
  if (!appointment || appointment.status !== "completed") return "not_completed";
  // The same completed visit may earn the patient's referrer a voucher (D-03).
  // It never blocks the patient's own points.
  await issueReferralVoucher(appointmentId).catch((err) => {
    logger.error("[Rewards] Referral voucher check failed", undefined, safeError(err));
  });
  const userId = appointment.patient.userId;
  const points = POINTS_PER_COMPLETED_VISIT;

  // ON CONFLICT DO NOTHING on the unique appointment id: a repeat, or a race
  // with the sweep, inserts nothing and so credits nothing. An appointment
  // deleted since it was read above (an erasure, say) fails the foreign key:
  // there is nothing left to credit, and the sweep carries on with the rest.
  const inserted = await prisma
    .$transaction(async (tx) => {
      const { count } = await tx.rewardPointsAward.createMany({
        data: [{ userId, appointmentId, points }],
        skipDuplicates: true,
      });
      if (count === 0) return false;
      await tx.oralHealthMetric.upsert({
        where: { userId },
        create: { userId, pointsBalance: points },
        update: { pointsBalance: { increment: points } },
      });
      return true;
    })
    .catch((err: unknown) => {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") return null;
      throw err;
    });
  if (inserted === null) return "not_completed";
  if (!inserted) return "already_awarded";

  await createAuditLogWithIntegrity({
    action: "rewards.visit_points_awarded",
    actorId: null,
    resourceId: appointmentId,
    sessionId: null,
    ipHash: pseudonymiseIp(""),
    metadata: { points },
  });
  return "awarded";
}

/**
 * Catches up completed visits whose award didn't happen at completion time
 * (for example a database error after the visit was closed).
 */
export async function awardMissedVisitPoints(limit = 50): Promise<number> {
  const missed = await prisma.appointment.findMany({
    where: { status: "completed", pointsAward: null },
    select: { id: true },
    take: limit,
  });
  let awarded = 0;
  for (const { id } of missed) {
    if ((await awardVisitPoints(id)) === "awarded") awarded += 1;
  }
  return awarded;
}

export type ApplyVoucherResult = { ok: true; discountPence: number } | { ok: false; error: string };

/**
 * Puts one of the patient's vouchers on a held booking and records the
 * discount on the appointment, so the deposit due stays fixed from then on.
 * Each voucher sits on at most one live booking.
 */
export async function applyDepositVoucher(args: {
  userId: string;
  appointment: { id: string; service: { depositPence: number } };
  voucherCode: string;
}): Promise<ApplyVoucherResult> {
  const { userId, appointment, voucherCode } = args;
  const voucher = await prisma.rewardRedemption.findFirst({
    where: { ...availableVoucherWhere(userId), voucherCode },
    select: { id: true, discountPence: true },
  });
  if (!voucher) return { ok: false, error: "That voucher can't be used. It may already be on another booking." };
  // Some of the deposit is always paid by card.
  if (voucher.discountPence >= appointment.service.depositPence) {
    return { ok: false, error: "This deposit is too small to use a voucher on." };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const claimed = await tx.rewardRedemption.updateMany({
        where: { id: voucher.id, ...availableVoucherWhere(userId) },
        data: { appointmentId: appointment.id },
      });
      const held = await tx.appointment.updateMany({
        where: { id: appointment.id, status: "draft_hold", depositDiscountPence: 0 },
        data: { depositDiscountPence: voucher.discountPence },
      });
      if (claimed.count !== 1 || held.count !== 1) {
        throw new VoucherNotApplied();
      }
      return { ok: true as const, discountPence: voucher.discountPence };
    });
  } catch (err) {
    const raced =
      err instanceof VoucherNotApplied ||
      (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002");
    if (raced) return { ok: false, error: "That voucher can't be used. It may already be on another booking." };
    throw err;
  }
}

class VoucherNotApplied extends Error {}
