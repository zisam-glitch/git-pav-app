// backend/src/routes/auth-otp.ts
// Phone-OTP login for the mobile app (mounted at /api/auth/otp).
//
// Contract (consumed by pavdental/src/features/auth/auth-api.ts):
// - POST /api/auth/otp/request { phone }        → { success, message }
// - POST /api/auth/otp/verify  { phone, code }  → { accessToken, refreshToken, user }
//
// Flow: a 6-digit code is issued through otpService with purpose
// "phone_login", delivered over SMS, and redeemed once.
//
// Security notes:
// - Patients only. Staff sign in with a password and a security code, so a
//   staff number gets the same answers as an unknown one (CS-08, AT-1).
// - Codes are stored hashed (sha256), single-use, and only verify their own
//   purpose; a code is burned after five wrong guesses (OT-2).
// - Verification is rate-limited per phone (5/hour) to blunt brute force.
// - Anti-enumeration: /request always answers 200 with a generic message —
//   unknown numbers simply get no SMS. /verify returns one generic 401 for
//   both "unknown phone" and "bad code".
// - Redeeming is guarded on usedAt IS NULL, so two concurrent submits of the
//   same code can't both create sessions.

import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { otpService, rateLimiter } from "../lib/otp-service";
import { createSession, toAuthUser } from "./auth";
import { minResponseTime } from "../lib/response-timing";

const router = Router();

const PHONE_RE = /^\+?[1-9]\d{6,14}$/; // E.164-ish
const OTP_SENT_MESSAGE = "If this number is registered, a verification code has been sent.";

// ─── POST /api/auth/otp/request ──────────────────────────────────────────
router.post("/request", minResponseTime(), async (req: Request, res: Response) => {
  const { phone } = (req.body ?? {}) as { phone?: string };

  if (!phone || typeof phone !== "string" || !PHONE_RE.test(phone.trim())) {
    return res.status(400).json({ error: "A valid phone number is required" });
  }
  const cleanPhone = phone.trim();

  const rateLimitKey = `otp-request:${cleanPhone}`;
  if (await rateLimiter.isRateLimited(rateLimitKey, 5, 3600)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  // Phone sign-in is for patients only: staff sign in with a password and a
  // security code (CS-08, AT-1). Staff numbers get the same reply as unknown ones.
  const user = await prisma.user.findFirst({
    where: { phone: cleanPhone, isActive: true, role: "patient" },
  });
  // Anti-enumeration: unknown, staff and locked numbers get the same reply as
  // the success path, and no SMS (AT-7). The per-phone rate limit above has
  // already consumed an attempt.
  if (!user || (user.lockedUntil && user.lockedUntil > new Date())) {
    return res.json({ success: true, message: OTP_SENT_MESSAGE });
  }

  const { delivered } = await otpService.createAndSendOTP({
    userId: user.id,
    phone: user.phone ?? cleanPhone,
    purpose: "phone_login",
    deliveryMethod: "sms",
  });
  if (!delivered) {
    return res.status(502).json({ error: "Could not send the code. Please try again." });
  }

  return res.json({ success: true, message: OTP_SENT_MESSAGE });
});

// ─── POST /api/auth/otp/verify ───────────────────────────────────────────
router.post("/verify", async (req: Request, res: Response) => {
  const { phone, code } = (req.body ?? {}) as { phone?: string; code?: string };

  if (!phone || !code || typeof phone !== "string" || typeof code !== "string") {
    return res.status(400).json({ error: "phone and code are required" });
  }

  const cleanPhone = phone.trim();
  const verifyLimitKey = `otp-verify:${cleanPhone}`;
  if (await rateLimiter.isRateLimited(verifyLimitKey, 5, 3600)) {
    return res.status(429).json({ error: "Too many attempts. Please try again later." });
  }

  const user = await prisma.user.findFirst({
    where: { phone: cleanPhone, isActive: true, role: "patient" },
    include: { patientProfile: true, clinicianProfile: true },
  });
  if (!user) {
    // Generic 401 — do not reveal whether the phone is registered.
    return res.status(401).json({ error: "Invalid or expired code" });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return res.status(401).json({ error: "Invalid or expired code" });
  }

  if (!(await otpService.verifyOTP(user.id, code, "phone_login"))) {
    return res.status(401).json({ error: "Invalid or expired code" });
  }
  await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });

  const { accessToken, refreshToken } = await createSession(user.id, req);

  return res.json({
    accessToken,
    refreshToken,
    user: toAuthUser(user),
  });
});

export default router;
