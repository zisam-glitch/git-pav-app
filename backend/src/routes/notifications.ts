import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  registerPushTokenSchema,
  updateNotificationPreferencesSchema,
  notificationHistoryQuerySchema,
} from "../schemas/notifications";

const router = Router();

// ─── POST /api/notifications/register-token ──────────────────────────────────
router.post("/register-token", requireAuth, validateBody(registerPushTokenSchema), async (req: AuthRequest, res: Response) => {
  const { expoPushToken, platform } = req.body;

  const userId = req.user!.sub;

  // Not cached: registering is naturally repeatable, and a token moved to
  // another account or switched off must be updated every time (ID-1).
  return (async () => {
    // Check if token already exists
    const existing = await prisma.pushToken.findFirst({
      where: { token: expoPushToken },
    });

    if (existing) {
      // CS-54: Prevent push token takeover without proof. If the token belongs to
      // another user and is still active, reject the request (previous user must log out first).
      if (existing.userId !== req.user!.sub && existing.active) {
        return {
          error: "Push token is already active for another account. The existing account must log out first.",
          httpStatus: 409,
        };
      }

      const updated = await prisma.pushToken.update({
        where: { id: existing.id },
        data: {
          active: true,
          userId: req.user!.sub,
          platform: platform || existing.platform,
          updatedAt: new Date(),
        },
      });
      return {
        id: updated.id,
        status: existing.userId === req.user!.sub ? "already_registered" : "reassigned",
        platform: updated.platform,
        httpStatus: 200,
      };
    }

    // Register new token
    const pushToken = await prisma.pushToken.create({
      data: {
        userId,
        token: expoPushToken,
        platform: platform || "unknown",
        active: true,
      },
    });

    return { id: pushToken.id, status: "registered", platform: pushToken.platform, httpStatus: 201 };
  })().then((result: any) => {
    if (result.error) {
      return res.status(result.httpStatus).json({ error: result.error });
    }
    const { httpStatus, ...responseData } = result;
    return res.status(httpStatus).json(responseData);
  });
});

// ─── GET /api/notifications/preferences ─────────────────────────────────────
router.get("/preferences", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;

  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!preferences) {
    // Return default preferences
    return res.json({
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      appointmentReminders: true,
      appointmentConfirmations: true,
      marketingUpdates: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    });
  }

  return res.json(preferences);
});

// ─── PUT /api/notifications/preferences ─────────────────────────────────────
router.put("/preferences", requireAuth, validateBody(updateNotificationPreferencesSchema), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;
  const {
    pushEnabled,
    emailEnabled,
    smsEnabled,
    appointmentReminders,
    appointmentConfirmations,
    marketingUpdates,
    quietHoursStart,
    quietHoursEnd,
  } = req.body;

  const preferences = await prisma.notificationPreference.upsert({
    where: { userId },
    update: {
      pushEnabled,
      emailEnabled,
      smsEnabled,
      appointmentReminders,
      appointmentConfirmations,
      marketingUpdates,
      quietHoursStart,
      quietHoursEnd,
    },
    create: {
      userId,
      pushEnabled: pushEnabled ?? true,
      emailEnabled: emailEnabled ?? true,
      smsEnabled: smsEnabled ?? false,
      appointmentReminders: appointmentReminders ?? true,
      appointmentConfirmations: appointmentConfirmations ?? true,
      marketingUpdates: marketingUpdates ?? false,
      quietHoursStart: quietHoursStart ?? "22:00",
      quietHoursEnd: quietHoursEnd ?? "08:00",
    },
  });

  return res.json(preferences);
});

// Notifications are sent by the server only: reminders and receipts come
// from bookings and payments. The app used to be able to send itself pushes,
// schedule its own notifications and email itself a "payment received"
// receipt for any amount; those routes are gone (CS-09, NT-1).

// ─── GET /api/notifications/history ────────────────────────────────────────
router.get("/history", requireAuth, validateQuery(notificationHistoryQuerySchema), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.sub;
  const { limit, offset } = req.query as unknown as { limit: number; offset: number };

  const notifications = await prisma.notificationHistory.findMany({
    where: { userId },
    orderBy: { sentAt: "desc" },
    take: limit,
    skip: offset,
  });

  return res.json(notifications);
});

export default router;

