import crypto from "crypto";
import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { pseudonymiseIp } from "../lib/audit-security";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { availableVoucherWhere, POINTS_PER_COMPLETED_VISIT, REWARDS_CATALOG } from "../lib/rewards";
import { LIST_CAPS } from "../lib/list-caps";

const router = Router();

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
// A new patient starts with nothing logged, not a pre-filled week.
const EMPTY_WEEKLY_BRUSHING = WEEK_DAYS.map((day) => ({ day, am: false, pm: false, durationSec: 0 }));

const redeemRewardSchema = z.object({
  rewardId: z.string().trim().min(1).max(50),
}).strict();

const logBrushingSchema = z.object({
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).optional(),
  session: z.enum(["am", "pm"]),
  durationSec: z.number().int().min(30).max(600),
}).strict();

async function getOrCreateMetrics(userId: string) {
  let metric = await prisma.oralHealthMetric.findUnique({ where: { userId } });
  if (!metric) {
    metric = await prisma.oralHealthMetric.create({
      // Points and streak start at zero. Clinical measures and advice stay
      // null until a clinician records them (CS-05).
      data: { userId },
    });
  }
  return metric;
}

// ─── GET /api/rewards ─────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;
  const [metric, redemptions, vouchers] = await Promise.all([
    getOrCreateMetrics(userId),
    prisma.rewardRedemption.findMany({
      where: { userId },
      orderBy: { redeemedAt: "desc" },
      take: LIST_CAPS.rewardHistory,
    }),
    prisma.rewardRedemption.findMany({
      where: availableVoucherWhere(userId),
      orderBy: { redeemedAt: "asc" },
      select: { id: true, voucherCode: true, rewardTitle: true, discountPence: true, redeemedAt: true },
    }),
  ]);

  return res.json({
    pointsBalance: metric.pointsBalance,
    streakDays: metric.streakDays,
    pointsPerCompletedVisit: POINTS_PER_COMPLETED_VISIT,
    catalog: REWARDS_CATALOG,
    vouchers,
    redemptions,
  });
});

// ─── POST /api/rewards/redeem ─────────────────────────────────────────────────
router.post("/redeem", requireAuth, validateBody(redeemRewardSchema), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;
  const { rewardId } = req.body;

  const item = REWARDS_CATALOG.find((r) => r.id === rewardId);
  if (!item) {
    return res.status(404).json({ error: "Reward item not found" });
  }

  await getOrCreateMetrics(userId);

  const voucherCode = `PAV-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const txResult = await prisma.$transaction(async (tx) => {
    const decremented = await tx.oralHealthMetric.updateMany({
      where: {
        userId,
        pointsBalance: { gte: item.pointsCost },
      },
      data: {
        pointsBalance: { decrement: item.pointsCost },
      },
    });

    if (decremented.count === 0) {
      const current = await tx.oralHealthMetric.findUnique({ where: { userId } });
      return {
        insufficient: true as const,
        pointsBalance: current?.pointsBalance ?? 0,
      };
    }

    const updatedMetric = await tx.oralHealthMetric.findUniqueOrThrow({
      where: { userId },
    });

    const redemption = await tx.rewardRedemption.create({
      data: {
        userId,
        rewardId: item.id,
        rewardTitle: item.title,
        pointsCost: item.pointsCost,
        voucherCode,
        discountPence: item.discountPence,
      },
    });

    return {
      insufficient: false as const,
      updatedMetric,
      redemption,
    };
  });

  if (txResult.insufficient) {
    return res.status(422).json({
      error: `Insufficient points balance. Need ${item.pointsCost - txResult.pointsBalance} more points.`,
    });
  }

  const { updatedMetric, redemption } = txResult;

  await createAuditLogWithIntegrity({
    action: "rewards.perk_redeemed",
    actorId: userId,
    resourceId: redemption.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { rewardId: item.id, pointsCost: item.pointsCost, voucherCode },
  });

  return res.status(201).json({
    pointsBalance: updatedMetric.pointsBalance,
    redemption,
    voucherCode,
  });
});

// ─── GET /api/rewards/insights ────────────────────────────────────────────────
router.get("/insights", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;
  const metric = await getOrCreateMetrics(userId);

  return res.json({
    plaqueIndexPercent: metric.plaqueIndexPercent,
    bleedingPercent: metric.bleedingPercent,
    recallDaysRemaining: metric.recallDaysRemaining,
    streakDays: metric.streakDays,
    pointsBalance: metric.pointsBalance,
    practitionerAdvice: metric.practitionerAdvice,
    weeklyBrushing: metric.weeklyBrushing ?? EMPTY_WEEKLY_BRUSHING,
    updatedAt: metric.updatedAt,
  });
});

// ─── POST /api/rewards/brushing-log ───────────────────────────────────────────
router.post("/brushing-log", requireAuth, validateBody(logBrushingSchema), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;
  const { day = "Sun", session, durationSec } = req.body;
  const metric = await getOrCreateMetrics(userId);

  const currentWeekly = Array.isArray(metric.weeklyBrushing)
    ? (metric.weeklyBrushing as Array<{ day: string; am: boolean; pm: boolean; durationSec: number }>)
    : EMPTY_WEEKLY_BRUSHING;

  const updatedWeekly = currentWeekly.map((entry) =>
    entry.day === day
      ? {
          ...entry,
          [session]: true,
          durationSec: Math.min(300, entry.durationSec + durationSec),
        }
      : entry
  );

  const updated = await prisma.oralHealthMetric.update({
    where: { userId },
    // Self-reported brushing earns no points (decisions log #14): points
    // come only from completed appointments.
    data: {
      streakDays: { increment: 1 },
      weeklyBrushing: updatedWeekly,
    },
  });

  return res.json({
    pointsBalance: updated.pointsBalance,
    streakDays: updated.streakDays,
    weeklyBrushing: updated.weeklyBrushing,
  });
});

export default router;
