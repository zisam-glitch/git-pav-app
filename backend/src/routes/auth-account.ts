// backend/src/routes/auth-account.ts
// Mobile-app account endpoints that extend the core auth router.
//
// Why a separate router: /api/auth is mounted with the strict authLimiter
// (20 req/15min) in server.ts. Change-password and account deletion are
// legitimate one-off actions, not auth attempts — mounting this router
// separately at /api/auth/account with the standard limiter avoids that
// bottleneck while keeping the audit middleware coverage.
//
// Contracts (consumed by pavdental/src/features/account/account-api.ts):
// - GET    /api/auth/account              → { user, patientProfile, clinicianProfile, operatorProfile }
// - DELETE /api/auth/account              → { success, message }   (soft-delete, GDPR Art.17)
// - POST   /api/auth/account/change-password → { success, message }
// - POST   /api/auth/account/verify-email/resend → { success, message }

import { Router, Request, Response } from "express";
import argon2 from "argon2";
import crypto from "crypto";
import { openErasureRequest, upcomingBookings } from "../lib/erasure";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import {
  emailVerificationService,
  rateLimiter,
} from "../lib/otp-service";
import { communicationService } from "../lib/communication-service";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { pseudonymiseIp } from "../lib/audit-security";
import { revokeSessions } from "../lib/session-revocation";
import { toAuthUser } from "./auth";
import { checkPasswordLength, validateNewPassword } from "../lib/password-policy";

const router = Router();

// ─── GET /api/auth/account ────────────────────────────────────────────────
// Account summary for the mobile profile/account screens, any role.
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    include: { patientProfile: true, clinicianProfile: true, operatorProfile: true },
  });
  if (!user || !user.isActive) {
    return res.status(404).json({ error: "Account not found" });
  }

  return res.json({
    user: toAuthUser(user),
    patientProfile: user.patientProfile
      ? {
          id: user.patientProfile.id,
          firstName: user.patientProfile.firstName,
          lastName: user.patientProfile.lastName,
          dob: user.patientProfile.dob,
          gender: user.patientProfile.gender,
          addressLine1: user.patientProfile.addressLine1,
          city: user.patientProfile.city,
          postcode: user.patientProfile.postcode,
          emergencyContactName: user.patientProfile.emergencyContactName,
          emergencyContactPhone: user.patientProfile.emergencyContactPhone,
        }
      : null,
    clinicianProfile: user.clinicianProfile
      ? {
          id: user.clinicianProfile.id,
          fullName: user.clinicianProfile.fullName,
          gdcNumber: user.clinicianProfile.gdcNumber,
        }
      : null,
    operatorProfile: user.operatorProfile
      ? { id: user.operatorProfile.id, fullName: user.operatorProfile.fullName }
      : null,
  });
});

// ─── DELETE /api/auth/account ─────────────────────────────────────────────
// GDPR Article 17: re-verifies the password, deactivates the account, revokes
// every session and, for a patient, opens an erasure request for the DPO
// (CS-23). Upcoming bookings must be cancelled first (decisions log #21), as
// the patient can't sign in to cancel them afterwards.
router.delete("/", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  const { confirmPassword, reason } = (req.body ?? {}) as {
    confirmPassword?: string;
    reason?: string;
  };

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: "Account not found" });

  if (!confirmPassword || !(await argon2.verify(user.passwordHash, confirmPassword))) {
    return res.status(403).json({ error: "Password confirmation failed" });
  }

  const profile = user.role === "patient"
    ? await prisma.patientProfile.findUnique({ where: { userId: user.id }, select: { id: true } })
    : null;
  if (profile) {
    const upcoming = await upcomingBookings(profile.id);
    if (upcoming.length > 0) {
      return res.status(409).json({
        error: "Please cancel your upcoming appointments before deleting your account.",
        code: "UPCOMING_BOOKINGS",
        upcoming,
      });
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: false },
  });
  await revokeSessions({ userId: user.id });

  await createAuditLogWithIntegrity({
    action: "account.deletion_requested",
    actorId: user.id,
    resourceId: user.id,
    sessionId: req.user.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    // The reason is free text and may mention health; it goes to the DPO's
    // request, not the audit log.
    metadata: { hasReason: !!reason },
  });

  if (!profile) {
    return res.json({ success: true, message: "Account deactivated." });
  }
  const request = await openErasureRequest(user.id, "account_deletion", reason);
  return res.json({
    success: true,
    // Not "requestId": standardResponse overwrites that with the trace id.
    erasureRequestId: request.id,
    dueBy: request.dueAt.toISOString(),
    message:
      "Your account is closed. We'll erase your personal details within one month. Your dental records are kept for as long as the law requires.",
  });
});

// ─── POST /api/auth/account/change-password ───────────────────────────────
// Verifies the current password, rotates the argon2 hash, revokes every
// other session (the caller's session stays signed in), and audit-logs.
router.post("/change-password", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  const { currentPassword, newPassword } = (req.body ?? {}) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "currentPassword and newPassword are required" });
  }
  // Length first, so a wrong request costs nothing; the full check follows
  // once we know whose account it is.
  const lengthProblem = checkPasswordLength(newPassword);
  if (lengthProblem) {
    return res.status(400).json({ error: lengthProblem, code: "WEAK_PASSWORD" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: "Account not found" });

  if (!(await argon2.verify(user.passwordHash, currentPassword))) {
    return res.status(403).json({ error: "Current password is incorrect" });
  }
  if (await argon2.verify(user.passwordHash, newPassword)) {
    return res.status(400).json({ error: "New password must be different from the current password" });
  }
  const passwordCheck = await validateNewPassword(newPassword, { email: user.email });
  if (!passwordCheck.ok) {
    return res.status(400).json({ error: passwordCheck.error, code: "WEAK_PASSWORD" });
  }

  const passwordHash = await argon2.hash(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await revokeSessions({ userId: user.id, id: { not: req.user!.sessionId } });

  await createAuditLogWithIntegrity({
    action: "account.password_changed",
    actorId: user.id,
    resourceId: user.id,
    sessionId: req.user.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {},
  });

  return res.json({ success: true, message: "Password updated successfully" });
});

// ─── POST /api/auth/account/verify-email/resend ───────────────────────────
// Authenticated resend using the caller's own email: no enumeration risk and
// no body required. Shares the rate-limit bucket with the public request
// flow to prevent inbox spam via alternating endpoints.
router.post("/verify-email/resend", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: "Account not found" });
  if (user.emailVerified) {
    return res.status(400).json({ error: "Email already verified" });
  }

  const resendLimitKey = `verify-email:${user.email}`;
  if (await rateLimiter.isRateLimited(resendLimitKey, 5, 3600)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { token, hashedToken, expiresAt } = emailVerificationService.generateVerificationToken();
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token: hashedToken, expiresAt },
  });
  await communicationService.sendVerificationEmail(user.email, token);

  return res.json({ success: true, message: "Verification email sent" });
});

export default router;
