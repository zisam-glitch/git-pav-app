import { Router, Request, Response } from "express";
import argon2 from "argon2";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { findReferrer } from "../lib/referrals";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { checkEmailSchema, loginSchema, refreshSchema, registerSchema, authResponseSchema } from "../schemas/auth";
import { emailVerificationService, passwordResetService, rateLimiter, otpService } from "../lib/otp-service";
import { communicationService } from "../lib/communication-service";
import { revokeSessions } from "../lib/session-revocation";
import { redis } from "../lib/redis";
import { pseudonymiseIp } from "../lib/audit-security";
import { safeError } from "../lib/log-safety";
import {
  EMAIL_CODE_MAX_ATTEMPTS,
  EMAIL_CODE_VALID_SECONDS,
  EMAIL_CODE_WINDOW_SECONDS,
  generateEmailCode,
  hashEmailCode,
  normaliseEmailCode,
} from "../lib/email-code";

const router = Router();

/**
 * Issues what a verification email carries: the long link token and a short
 * six-digit code for typing. Both verify the same address.
 */
async function issueEmailVerification(userId: string): Promise<{ token: string; code: string }> {
  const { token, hashedToken, expiresAt } = emailVerificationService.generateVerificationToken();
  const code = generateEmailCode();
  await prisma.emailVerificationToken.createMany({
    data: [
      { userId, token: hashedToken, expiresAt },
      {
        userId,
        token: hashEmailCode(userId, code),
        expiresAt: new Date(Date.now() + EMAIL_CODE_VALID_SECONDS * 1000),
      },
    ],
  });
  return { token, code };
}

const authLimiterMiddleware = (req: Request, res: Response, next: any) => {
  const limiter = req.app.get("authLimiter");
  if (typeof limiter === "function") return limiter(req, res, next);
  return next();
};

/** How long a just-rotated refresh token still gets the new one (AT-5). */
const REFRESH_GRACE_SECONDS = 30;

// Roles that always sign in with a one-time code as well as a password (CS-08;
// van operators added by D-22).
export const MFA_REQUIRED_ROLES: string[] = ["clinician", "admin", "operator"];

// ─── POST /api/auth/check-email ────────────────────────────────────────────────
router.post("/check-email", authLimiterMiddleware, validateBody(checkEmailSchema), async (req: Request, res: Response) => {
  const normalizedEmail = String(req.body.email).trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  // Onboarding only needs to know whether to show sign-in or sign-up. The
  // account's role isn't returned: it let anyone pick out staff accounts
  // (CS-08, AT-3). The auth rate limiter applies to this route.
  return res.json({ exists: !!user, email: normalizedEmail });
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", authLimiterMiddleware, validateBody(registerSchema), async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, referralCode } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // A mistyped code is refused rather than dropped, so the patient can fix it.
  const referrerUserId = referralCode ? await findReferrer(referralCode) : null;
  if (referralCode && !referrerUserId) {
    return res.status(400).json({ error: "That referral code isn't valid. Check it, or leave it blank." });
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const user = await prisma.user.create({
    data: {
      email,
      phone: phone || null,
      passwordHash,
      role: "patient",
      patientProfile: {
        create: {
          firstName,
          lastName,
        },
      },
      ...(referrerUserId ? { referredBy: { create: { referrerUserId } } } : {}),
    },
    include: { patientProfile: true, clinicianProfile: true },
  });

  // Create first session
  const { accessToken, refreshToken, session } = await createSession(user.id, req);

  // Generate verification token and dispatch welcome verification email
  try {
    const { token, code } = await issueEmailVerification(user.id);
    communicationService.sendVerificationEmail(user.email, token, code).catch((err) => {
      console.error("[Auth] Failed to dispatch registration verification email:", safeError(err));
    });
  } catch (err) {
    console.error("[Auth] Error creating registration verification token:", safeError(err));
  }

  const authResponse = {
    accessToken,
    refreshToken,
    user: toAuthUser(user, { firstName, lastName }),
  };

  // Validate response conforms to runtime schema
  const validatedResponse = authResponseSchema.parse(authResponse);

  return res.status(201).json(validatedResponse);
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", authLimiterMiddleware, validateBody(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { patientProfile: true, clinicianProfile: true },
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check for account lockout
  // A locked account answers exactly like a wrong password, so the response
  // doesn't confirm that the email has an account (AT-7).
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
  const ipHash = pseudonymiseIp(clientIp);
  const userIpLockKey = `login-lock:${user.id}:${ipHash}`;
  const userIpFailKey = `login-fail:${user.id}:${ipHash}`;

  const isUserIpLocked = await redis.get(userIpLockKey).catch(() => null);
  if (isUserIpLocked) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    // AT-7: Increment failed login attempts atomically in DB
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });
    const failedAttempts = updated.failedLoginAttempts;
    const lockoutThreshold = 5;

    // Exponential backoff for this attacker's IP in Redis against this user
    const ipFails = await redis.incr(userIpFailKey).catch(() => 1);
    if (ipFails === 1) {
      await redis.expire(userIpFailKey, 900).catch(() => {});
    }
    if (ipFails >= lockoutThreshold) {
      const lockDuration = Math.min(2 ** (ipFails - lockoutThreshold) * 60, 3600);
      await redis.set(userIpLockKey, "1", "EX", lockDuration).catch(() => {});
    }

    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Reset failed login attempts on successful login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  await redis.del(userIpFailKey).catch(() => {});
  await redis.del(userIpLockKey).catch(() => {});

  // AT-7: If account had suspicious failed attempts from other IPs, enforce step-up MFA
  const isSuspiciousLogin = (user.failedLoginAttempts || 0) >= 5;

  // Staff always need a second factor; patients only if they turned it on
  // (CS-08, MF-1). The session is created only once the code is checked.
  const needsCode = user.mfaEnabled || MFA_REQUIRED_ROLES.includes(user.role) || isSuspiciousLogin;
  if (needsCode && !req.body.mfaCode) {
    if (await rateLimiter.isRateLimited(`login-code:${user.id}`, 5, 900)) {
      return res.status(429).json({ error: "Too many codes requested. Please try again later." });
    }
    const { delivered } = await otpService.createAndSendOTP({
      userId: user.id,
      email: user.email,
      phone: user.phone || undefined,
      purpose: "mfa",
      deliveryMethod: user.phone ? "sms" : "email",
    });
    if (!delivered) {
      return res.status(502).json({ error: "Could not send your security code. Please try again." });
    }
    return res.status(200).json({
      mfaRequired: true,
      message: "Security code sent",
    });
  }
  if (needsCode && !(await otpService.verifyOTP(user.id, String(req.body.mfaCode), "mfa"))) {
    return res.status(401).json({ error: "Invalid or expired MFA code" });
  }

  const { accessToken, refreshToken, session } = await createSession(user.id, req);

  if (needsCode) {
    const now = new Date();
    await prisma.mfaVerification.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        verifiedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      },
    }).catch(() => {});
  }

  const authResponse = {
    accessToken,
    refreshToken,
    user: toAuthUser(user),
  };

  // Validate response conforms to runtime schema
  const validatedResponse = authResponseSchema.parse(authResponse);

  return res.json(validatedResponse);
});

// ─── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post("/refresh", validateBody(refreshSchema), async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const tokenHash = hashToken(refreshToken);
  const session = await prisma.authSession.findUnique({
    where: { id: payload.sessionId },
    include: { user: { include: { patientProfile: true, clinicianProfile: true } } },
  });

  if (!session || session.revokedAt || new Date() > session.expiresAt) {
    return res.status(401).json({ error: "Session expired or revoked" });
  }

  if (!session.user.isActive) {
    res.status(401).json({ error: "Account is deactivated" });
    return;
  }

  // Two refreshes with the same token can race (parallel requests after the
  // access token expires). The first rotates; one that arrives within
  // REFRESH_GRACE_SECONDS gets the same new refresh token instead of being
  // treated as token theft (CS-08, AT-5). Outside that window, or if Redis is
  // unavailable, reuse revokes the session as before.
  const graceKey = `refresh-grace:${tokenHash}`;
  let newRefreshToken: string;
  if (session.refreshTokenHash === tokenHash) {
    const candidate = signRefreshToken({
      sub: session.user.id,
      sessionId: session.id,
    });
    // Claim the rotation in Redis first, so a racing refresh always finds
    // the winner's token there. null: another refresh claimed it first.
    const claimed = await redis
      .set(graceKey, candidate, "EX", REFRESH_GRACE_SECONDS, "NX")
      .catch(() => "unavailable" as const);
    if (claimed === null) {
      const winner = await redis.get(graceKey).catch(() => null);
      if (!winner) return res.status(401).json({ error: "Session expired or revoked" });
      newRefreshToken = winner;
    } else {
      const rotated = await prisma.authSession.updateMany({
        where: { id: session.id, refreshTokenHash: tokenHash, revokedAt: null },
        data: {
          refreshTokenHash: hashToken(candidate),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      if (rotated.count !== 1) return res.status(401).json({ error: "Session expired or revoked" });
      newRefreshToken = candidate;
    }
  } else {
    // Only while the token handed out then is still the session's current
    // one: an older token gets nothing from the grace window.
    const cached = await redis.get(graceKey).catch(() => null);
    const winner = cached && hashToken(cached) === session.refreshTokenHash ? cached : null;
    if (!winner) {
      await revokeSessions({ id: session.id });
      return res.status(401).json({ error: "Invalid refresh token — session revoked" });
    }
    newRefreshToken = winner;
  }

  const accessToken = signAccessToken({
    sub: session.user.id,
    role: session.user.role,
    sessionId: session.id,
  });

  const authResponse = {
    accessToken,
    refreshToken: newRefreshToken,
    user: toAuthUser(session.user),
  };

  // Validate response conforms to runtime schema
  const validatedResponse = authResponseSchema.parse(authResponse);

  return res.json(validatedResponse);
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  await revokeSessions({ id: req.user.sessionId });

  // PP-2: Deactivate push token if passed by the client on logout
  if (req.body?.pushToken) {
    await prisma.pushToken.updateMany({
      where: { token: String(req.body.pushToken), userId: req.user.sub },
      data: { active: false },
    });
  }

  return res.json({ message: "Logged out" });
});

// ─── GET /api/auth/sessions ─────────────────────────────────────────────
router.get("/sessions", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  const sessions = await prisma.authSession.findMany({
    where: { userId: req.user.sub, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      deviceInfo: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  return res.json(sessions);
});

// ─── DELETE /api/auth/sessions/:id ───────────────────────────────────────────
router.delete("/sessions/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  await revokeSessions({ id: String(req.params.id), userId: req.user.sub });

  return res.json({ message: "Session revoked" });
});

// ─── POST /api/auth/verify-email/request ─────────────────────────────────────
router.post("/verify-email/request", authLimiterMiddleware, async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Rate limit check
  const rateLimitKey = `verify-email:${email}`;
  if (await rateLimiter.isRateLimited(rateLimitKey, 5, 3600)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.json({ message: "If an account exists, a verification code has been sent." });
  }

  if (user.emailVerified) {
    return res.status(400).json({ error: "Email already verified" });
  }

  // Generate the link token and the six-digit code
  const { token, code } = await issueEmailVerification(user.id);

  // Send verification email via configured provider
  await communicationService.sendVerificationEmail(user.email, token, code);

  return res.json({ message: "Verification email sent" });
});

// ─── POST /api/auth/verify-email/confirm ─────────────────────────────────────
router.post("/verify-email/confirm", authLimiterMiddleware, async (req: Request, res: Response) => {
  const { token, email, code } = req.body ?? {};

  // Typed six-digit code: needs the address, and guesses are capped per
  // address, because six digits alone are easy to try.
  if (token === undefined && (email !== undefined || code !== undefined)) {
    const address = typeof email === "string" ? email.trim() : "";
    const digits = normaliseEmailCode(code);
    if (!address || !digits) {
      return res.status(400).json({ error: "Enter the 6-digit code from your email" });
    }
    if (await rateLimiter.isRateLimited(`verify-email-code:${address.toLowerCase()}`, EMAIL_CODE_MAX_ATTEMPTS, EMAIL_CODE_WINDOW_SECONDS)) {
      return res.status(429).json({ error: "Too many attempts. Please wait a few minutes and try again." });
    }
    const user = await prisma.user.findFirst({
      where: { email: { equals: address, mode: "insensitive" } },
      select: { id: true },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }
    const consumed = await prisma.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        token: hashEmailCode(user.id, digits),
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
    if (consumed.count !== 1) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    return res.json({ message: "Email verified successfully" });
  }

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  const hashedToken = hashToken(token);

  // CS-54: Mark token as used conditionally (race-proof single-redemption)
  const consumed = await prisma.emailVerificationToken.updateMany({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
    data: { usedAt: new Date() },
  });

  if (consumed.count !== 1) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  // Find valid token to retrieve user
  const verificationToken = await prisma.emailVerificationToken.findFirst({
    where: { token: hashedToken },
    select: { userId: true },
  });

  if (verificationToken) {
    // Verify user email
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });
  }

  return res.json({ message: "Email verified successfully" });
});

// ─── POST /api/auth/password-reset/request ───────────────────────────────────
router.post("/password-reset/request", authLimiterMiddleware, async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Rate limit check
  const rateLimitKey = `password-reset:${email}`;
  if (await rateLimiter.isRateLimited(rateLimitKey, 3, 3600)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if user exists
    return res.json({ message: "If an account exists, a reset link will be sent" });
  }

  // Generate reset token
  const { token, hashedToken, expiresAt } = passwordResetService.generateResetToken();

  // Store reset token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt,
    },
  });

  // Send password reset email via configured provider
  await communicationService.sendPasswordResetEmail(user.email, token);

  return res.json({ message: "If an account exists, a reset link will be sent" });
});

// ─── POST /api/auth/password-reset/confirm ───────────────────────────────────
router.post("/password-reset/confirm", authLimiterMiddleware, async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  // Validate password strength (matching registerSchema rules)
  const isStrongPassword =
    typeof newPassword === "string" &&
    newPassword.length >= 8 &&
    newPassword.length <= 128 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword);
  if (!isStrongPassword) {
    return res.status(400).json({ 
      error: "Password must be 8-128 characters with at least one uppercase, one lowercase, and one number" 
    });
  }

  const hashedToken = hashToken(token);

  // CS-54: Mark token as used conditionally (race-proof single-redemption)
  const consumed = await prisma.passwordResetToken.updateMany({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
    data: { usedAt: new Date() },
  });

  if (consumed.count !== 1) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: { token: hashedToken },
    select: { userId: true },
  });

  if (!resetToken) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  // Hash new password
  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // Update user password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { 
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Revoke all sessions and deactivate push tokens
  await revokeSessions({ userId: resetToken.userId });

  return res.json({ message: "Password reset successfully" });
});

// ─── POST /api/auth/mfa/request ───────────────────────────────────────────────
router.post("/mfa/request", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  // Rate limit check
  const rateLimitKey = `mfa:${req.user.sub}`;
  if (await rateLimiter.isRateLimited(rateLimitKey, 3, 300)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { delivered } = await otpService.createAndSendOTP({
    userId: user.id,
    email: user.email,
    phone: user.phone || undefined,
    purpose: "mfa_step_up",
    deliveryMethod: user.phone ? "sms" : "email",
  });
  if (!delivered) {
    return res.status(502).json({ error: "Could not send your security code. Please try again." });
  }

  return res.json({ message: "MFA code sent" });
});

// ─── POST /api/auth/mfa/verify ───────────────────────────────────────────────
router.post("/mfa/verify", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  if (!(await otpService.verifyOTP(req.user.sub, String(code), "mfa_step_up"))) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  // Enable MFA for user
  await prisma.user.update({
    where: { id: req.user.sub },
    data: { mfaEnabled: true },
  });

  return res.json({ message: "MFA enabled successfully" });
});

// ─── POST /api/auth/mfa/disable ──────────────────────────────────────────────
// A patient turns two-step sign-in off with their password and a fresh code
// (from /mfa/request). Staff always sign in with a code, so they can't.
router.post("/mfa/disable", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorised" });
  const { password, code } = (req.body ?? {}) as { password?: unknown; code?: unknown };
  if (typeof password !== "string" || !password || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Your password and a security code are required" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (MFA_REQUIRED_ROLES.includes(user.role)) {
    return res.status(409).json({ error: "Staff accounts always use two-step sign-in" });
  }
  if (!user.mfaEnabled) return res.json({ message: "Two-step sign-in is already off" });

  const rateLimitKey = `mfa-disable:${user.id}`;
  if (await rateLimiter.isRateLimited(rateLimitKey, 5, 900)) {
    return res.status(429).json({ error: "Too many attempts. Please try again later." });
  }
  if (!(await argon2.verify(user.passwordHash, password))) {
    return res.status(403).json({ error: "Password confirmation failed" });
  }
  if (!(await otpService.verifyOTP(user.id, code.trim(), "mfa_step_up"))) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: false } });
  return res.json({ message: "Two-step sign-in turned off" });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function createSession(userId: string, req: Request) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true },
  });

  const session = await prisma.authSession.create({
    data: {
      userId,
      refreshTokenHash: "",
      expiresAt,
      deviceInfo: req.headers["user-agent"] || null,
      // Keyed HMAC, not a bare hash: an unsalted IPv4 hash is reversible (AT-7).
      ipAddressHash: pseudonymiseIp(req.ip || ""),
    },
  });

  const refreshToken = signRefreshToken({
    sub: userId,
    sessionId: session.id,
  });
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.authSession.update({
    where: { id: session.id },
    data: { refreshTokenHash },
  });

  const accessToken = signAccessToken({
    sub: userId,
    role: user.role,
    sessionId: session.id,
  });

  return { accessToken, refreshToken, session };
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

type UserWithProfiles = {
  id: string;
  email: string;
  phone?: string | null;
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  patientProfile?: { id: string; firstName: string; lastName: string } | null;
  clinicianProfile?: { id: string; fullName: string } | null;
};

function toAuthUser(
  user: UserWithProfiles,
  fallbackName?: { firstName: string; lastName: string }
) {
  const clinicianName = user.clinicianProfile?.fullName?.trim().split(/\s+/) ?? [];
  const clinicianLastName = clinicianName.slice(1).join(" ") || undefined;
  const firstName = user.patientProfile?.firstName ?? clinicianName[0] ?? fallbackName?.firstName ?? "";
  const lastName = user.patientProfile?.lastName ?? clinicianLastName ?? fallbackName?.lastName ?? "";

  // Determine profile ID based on role
  const profileId = user.role === 'patient' 
    ? user.patientProfile?.id 
    : user.role === 'clinician' 
    ? user.clinicianProfile?.id 
    : undefined;

  return {
    id: user.id,
    sub: user.id,
    role: user.role as 'patient' | 'clinician' | 'operator' | 'admin',
    email: user.email,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    phone: user.phone || undefined,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified ?? false,
    isMfaEnabled: user.mfaEnabled,
    mfaEnabled: user.mfaEnabled,
    profileId,
  };
}

// Shared with sub-routers (auth-account, auth-otp) so session creation and
// the auth-user shape stay identical across every login path.
export { createSession, toAuthUser };

export default router;
