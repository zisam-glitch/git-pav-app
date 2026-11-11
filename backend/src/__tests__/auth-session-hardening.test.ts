import http from "http";
import express from "express";
import argon2 from "argon2";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import authRoutes from "../routes/auth";
import patientRoutes from "../routes/patients";
import notificationRoutes from "../routes/notifications";
import { signAccessToken } from "../lib/jwt";
import { otpService, phoneChangePurpose, rateLimiter } from "../lib/otp-service";
import { getNextQuietHoursEnd, scheduleAppointmentReminderLadder, processDueScheduledNotifications } from "../lib/background-jobs";
import { attachOptionalAuth } from "../middleware/auth";
import { buildRateLimiters } from "../middleware/rate-limits";

describe("CS-54: Auth and Session Hardening", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    // As in production behind the load balancer: the forwarded address is used.
    app.set("trust proxy", true);
    app.use(express.json());
    app.use(attachOptionalAuth);

    const { globalLimiter, authLimiter } = buildRateLimiters({ production: false });
    app.set("authLimiter", authLimiter);
    app.use(globalLimiter);

    app.use("/api/auth", authRoutes);
    app.use("/api/patients", patientRoutes);
    app.use("/api/notifications", notificationRoutes);

    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  });

  describe("1. Phone Change OTP & Verification Reset", () => {
    let testUserId: string;
    let testProfileId: string;
    let userToken: string;

    beforeEach(async () => {
      const passwordHash = await argon2.hash("SecurePass123!", { type: argon2.argon2id });
      const user = await prisma.user.create({
        data: {
          email: `patient-${Date.now()}@example.test`,
          passwordHash,
          phone: "+447700900111",
          phoneVerified: true,
          role: "patient",
          patientProfile: {
            create: {
              firstName: "Alice",
              lastName: "Test",
              addressLine1: "10 Main St",
              city: "London",
              postcode: "W1D 1AA",
            },
          },
        },
        include: { patientProfile: true },
      });
      testUserId = user.id;
      testProfileId = user.patientProfile!.id;
      const session = await prisma.authSession.create({
        data: {
          userId: testUserId,
          refreshTokenHash: "dummy-hash",
          expiresAt: new Date(Date.now() + 30 * 86400 * 1000),
        },
      });
      userToken = signAccessToken({ sub: testUserId, role: "patient", sessionId: session.id });
    });

    afterEach(async () => {
      await prisma.user.deleteMany({ where: { id: testUserId } });
    });

    it("resets phoneVerified to false if phone is changed via profile update without OTP", async () => {
      const res = await fetch(`${baseUrl}/api/patients/${testProfileId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          phone: "+447700900222",
        }),
      });

      expect(res.status).toBe(200);

      const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(dbUser?.phone).toBe("+447700900222");
      expect(dbUser?.phoneVerified).toBe(false);
    });

    it("preserves phoneVerified: true when updating profile without changing phone", async () => {
      const res = await fetch(`${baseUrl}/api/patients/${testProfileId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          firstName: "Alicia",
        }),
      });

      expect(res.status).toBe(200);

      const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(dbUser?.phoneVerified).toBe(true);
    });

    it("verifies and keeps phoneVerified: true when valid phoneOtp is provided", async () => {
      // Issue OTP for phone_change
      const { code } = await otpService.createAndSendOTP({
        userId: testUserId,
        phone: "+447700900333",
        purpose: phoneChangePurpose("+447700900333"),
      });

      const res = await fetch(`${baseUrl}/api/patients/${testProfileId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          phone: "+447700900333",
          phoneOtp: code,
        }),
      });

      expect(res.status).toBe(200);

      const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(dbUser?.phone).toBe("+447700900333");
      expect(dbUser?.phoneVerified).toBe(true);
    });

    it("rejects phone update with 400 when invalid phoneOtp is provided", async () => {
      const res = await fetch(`${baseUrl}/api/patients/${testProfileId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          phone: "+447700900444",
          phoneOtp: "999999",
        }),
      });

      expect(res.status).toBe(400);
      const json = await res.json() as any;
      expect(json.error).toMatch(/Invalid or expired phone verification code/i);

      // Phone remains unchanged
      const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(dbUser?.phone).toBe("+447700900111");
    });

    it("allows requesting and verifying phone change via dedicated endpoints", async () => {
      const reqRes = await fetch(`${baseUrl}/api/patients/${testProfileId}/phone/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          newPhone: "+447700900555",
        }),
      });

      expect(reqRes.status).toBe(200);

      const mfaCodeRow = await prisma.mfaCode.findFirst({
        where: { userId: testUserId, purpose: phoneChangePurpose("+447700900555") },
        orderBy: { createdAt: "desc" },
      });
      expect(mfaCodeRow).toBeTruthy();

      // Retrieve generated code from test OTP service
      const { code } = await otpService.createAndSendOTP({
        userId: testUserId,
        phone: "+447700900555",
        purpose: phoneChangePurpose("+447700900555"),
      });

      const verRes = await fetch(`${baseUrl}/api/patients/${testProfileId}/phone/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          newPhone: "+447700900555",
          code,
        }),
      });

      expect(verRes.status).toBe(200);
      const verJson = await verRes.json() as any;
      expect(verJson.phoneVerified).toBe(true);

      const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(dbUser?.phone).toBe("+447700900555");
      expect(dbUser?.phoneVerified).toBe(true);
    });

    it("won't verify a different number with a code sent to another one", async () => {
      // A code really sent to +447700900666...
      const { code } = await otpService.createAndSendOTP({
        userId: testUserId,
        phone: "+447700900666",
        purpose: phoneChangePurpose("+447700900666"),
      });
      // ...can't be used to mark +447700900777 as verified.
      const verRes = await fetch(`${baseUrl}/api/patients/${testProfileId}/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ newPhone: "+447700900777", code }),
      });
      expect(verRes.status).toBe(400);
      const viaProfile = await fetch(`${baseUrl}/api/patients/${testProfileId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ phone: "+447700900777", phoneOtp: code }),
      });
      expect(viaProfile.status).toBe(400);
      const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(dbUser?.phone).not.toBe("+447700900777");
    });
  });

  describe("2. Atomic Lockout Counter & Victim Protection (AT-7)", () => {
    let testUserEmail: string;
    let testUserId: string;

    beforeEach(async () => {
      testUserEmail = `lockout-${Date.now()}@example.test`;
      const passwordHash = await argon2.hash("CorrectPassword123!", { type: argon2.argon2id });
      const user = await prisma.user.create({
        data: {
          email: testUserEmail,
          passwordHash,
          role: "patient",
          phone: "+447700900888",
          phoneVerified: true,
        },
      });
      testUserId = user.id;
      const keys = await redis.keys(`login-*:${testUserId}:*`);
      if (keys.length > 0) await redis.del(...keys);
    });

    afterEach(async () => {
      const keys = await redis.keys(`login-*:${testUserId}:*`);
      if (keys.length > 0) await redis.del(...keys);
      await prisma.user.deleteMany({ where: { id: testUserId } });
    });

    it("increments failedLoginAttempts atomically without revealing account existence", async () => {
      // 3 wrong passwords
      for (let i = 0; i < 3; i++) {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: testUserEmail, password: "WrongPassword!" }),
        });
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: "Invalid credentials" });
      }

      const user = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(user?.failedLoginAttempts).toBe(3);
    });

    it("does not shut out the victim: legitimate user with right password receives step-up MFA challenge", async () => {
      // Attacker hits the account from an external IP with 5 wrong attempts to trigger lockout threshold
      for (let i = 0; i < 5; i++) {
        await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "198.51.100.1",
          },
          body: JSON.stringify({ email: testUserEmail, password: "AttackerGuess!" }),
        });
      }

      const lockedUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(lockedUser?.failedLoginAttempts).toBeGreaterThanOrEqual(5);

      // Attacker is locked out from their IP
      const attackerAttempt = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "198.51.100.1",
        },
        body: JSON.stringify({ email: testUserEmail, password: "CorrectPassword123!" }),
      });
      expect(attackerAttempt.status).toBe(401);

      // Victim logs in from their IP with CORRECT password: instead of being rejected, receives MFA challenge!
      const victimLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "203.0.113.42",
        },
        body: JSON.stringify({ email: testUserEmail, password: "CorrectPassword123!" }),
      });

      expect(victimLoginRes.status).toBe(200);
      const victimJson = await victimLoginRes.json() as any;
      expect(victimJson.mfaRequired).toBe(true);

      // Generate and verify MFA code
      const { code } = await otpService.createAndSendOTP({
        userId: testUserId,
        email: testUserEmail,
        purpose: "mfa",
      });

      const mfaCompleteRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUserEmail,
          password: "CorrectPassword123!",
          mfaCode: code,
        }),
      });

      expect(mfaCompleteRes.status).toBe(200);
      const finalJson = await mfaCompleteRes.json() as any;
      expect(finalJson.accessToken).toBeDefined();

      // Lockout is cleared upon successful authentication
      const restoredUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(restoredUser?.failedLoginAttempts).toBe(0);
      expect(restoredUser?.lockedUntil).toBeNull();
    });

    const loginFrom = (ip: string, password: string) =>
      fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
        body: JSON.stringify({ email: testUserEmail, password }),
      });

    it("S1: stops guessing one account from many addresses, and answers like a wrong password", async () => {
      for (let i = 1; i <= 10; i++) {
        const res = await loginFrom(`198.51.100.${i}`, "AttackerGuess!");
        expect(res.status).toBe(401);
      }
      // An eleventh address, even with the right password, is not let through for now.
      const res = await loginFrom("198.51.100.99", "CorrectPassword123!");
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Invalid credentials" });
    });

    it("S1: a few wrong guesses from several addresses do not stop the owner", async () => {
      for (let i = 1; i <= 4; i++) await loginFrom(`198.51.100.${i}`, "AttackerGuess!");
      const res = await loginFrom("203.0.113.42", "CorrectPassword123!");
      expect(res.status).toBe(200);
    });

    it("S2: old wrong passwords do not make the owner's next sign-in ask for a code", async () => {
      // Seven wrong passwords on the row, but none in the last 15 minutes.
      await prisma.user.update({ where: { id: testUserId }, data: { failedLoginAttempts: 7 } });
      const res = await loginFrom("203.0.113.42", "CorrectPassword123!");
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.mfaRequired).toBeUndefined();
      expect(json.accessToken).toBeDefined();
    });
  });

  describe("3. One-Time Tokens Redeemed Conditionally (Race-Condition Proof)", () => {
    let testUserEmail: string;
    let testUserId: string;

    beforeEach(async () => {
      testUserEmail = `tokens-${Date.now()}@example.test`;
      const passwordHash = await argon2.hash("OldPassword123!", { type: argon2.argon2id });
      const user = await prisma.user.create({
        data: {
          email: testUserEmail,
          passwordHash,
          role: "patient",
        },
      });
      testUserId = user.id;
      const keys = await redis.keys(`login-*:${testUserId}:*`);
      if (keys.length > 0) await redis.del(...keys);
    });

    afterEach(async () => {
      const keys = await redis.keys(`login-*:${testUserId}:*`);
      if (keys.length > 0) await redis.del(...keys);
      await prisma.user.deleteMany({ where: { id: testUserId } });
    });

    it("ensures concurrent password reset redemptions redeem exactly once", async () => {
      // Request password reset
      await fetch(`${baseUrl}/api/auth/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testUserEmail }),
      });

      const resetTokenRow = await prisma.passwordResetToken.findFirst({
        where: { userId: testUserId, usedAt: null },
      });
      expect(resetTokenRow).toBeTruthy();

      // Create a direct token in DB to test concurrent confirm
      const rawToken = "test_reset_token_secret_1234567890";
      const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: testUserId,
          token: hashed,
          expiresAt: new Date(Date.now() + 3600 * 1000),
        },
      });

      // Fire 2 concurrent redemptions
      const [res1, res2] = await Promise.all([
        fetch(`${baseUrl}/api/auth/password-reset/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: rawToken, newPassword: "NewSecurePassword123!" }),
        }),
        fetch(`${baseUrl}/api/auth/password-reset/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: rawToken, newPassword: "NewSecurePassword123!" }),
        }),
      ]);

      const statuses = [res1.status, res2.status].sort();
      // Exactly one 200 and one 400
      expect(statuses).toEqual([200, 400]);
    });

    it("deactivates push tokens when password reset revokes all user sessions", async () => {
      // Register an active push token for the user
      await prisma.pushToken.create({
        data: {
          userId: testUserId,
          token: `token-reset-${Date.now()}`,
          platform: "ios",
          active: true,
        },
      });

      const rawToken = "test_reset_token_push_deactivation";
      const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: testUserId,
          token: hashed,
          expiresAt: new Date(Date.now() + 3600 * 1000),
        },
      });

      const res = await fetch(`${baseUrl}/api/auth/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, newPassword: "NewSecurePassword123!" }),
      });
      expect(res.status).toBe(200);

      const pushTokens = await prisma.pushToken.findMany({ where: { userId: testUserId } });
      expect(pushTokens.every((t) => t.active === false)).toBe(true);
    });
  });

  describe("4. Push Token Takeover Protection", () => {
    let userAId: string;
    let userBId: string;
    let tokenA: string;
    let tokenB: string;

    beforeEach(async () => {
      const passwordHash = await argon2.hash("Password123!", { type: argon2.argon2id });
      const userA = await prisma.user.create({
        data: { email: `user-a-${Date.now()}@example.test`, passwordHash, role: "patient" },
      });
      const userB = await prisma.user.create({
        data: { email: `user-b-${Date.now()}@example.test`, passwordHash, role: "patient" },
      });
      userAId = userA.id;
      userBId = userB.id;
      const sessionA = await prisma.authSession.create({
        data: { userId: userAId, refreshTokenHash: "hash-a", expiresAt: new Date(Date.now() + 30 * 86400 * 1000) },
      });
      const sessionB = await prisma.authSession.create({
        data: { userId: userBId, refreshTokenHash: "hash-b", expiresAt: new Date(Date.now() + 30 * 86400 * 1000) },
      });
      tokenA = signAccessToken({ sub: userAId, role: "patient", sessionId: sessionA.id });
      tokenB = signAccessToken({ sub: userBId, role: "patient", sessionId: sessionB.id });
    });

    afterEach(async () => {
      await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId] } } });
    });

    it("prevents user B from claiming user A's active push token without proof (HTTP 409)", async () => {
      const sharedExpoToken = `ExponentPushToken[device-${Date.now()}]`;

      // User A registers token
      const regARes = await fetch(`${baseUrl}/api/notifications/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({ expoPushToken: sharedExpoToken, platform: "ios" }),
      });
      expect(regARes.status).toBe(201);

      // User B attempts to hijack User A's active token
      const hijackRes = await fetch(`${baseUrl}/api/notifications/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenB}` },
        body: JSON.stringify({ expoPushToken: sharedExpoToken, platform: "ios" }),
      });
      expect(hijackRes.status).toBe(409);
      const hijackJson = await hijackRes.json() as any;
      expect(hijackJson.error).toMatch(/already active for another account/i);

      // User A logs out and deactivates token
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({ pushToken: sharedExpoToken }),
      });

      // Now User B can legitimately register the device token
      const regBRes = await fetch(`${baseUrl}/api/notifications/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenB}` },
        body: JSON.stringify({ expoPushToken: sharedExpoToken, platform: "ios" }),
      });
      expect(regBRes.status).toBe(200);

      const dbToken = await prisma.pushToken.findUnique({ where: { token: sharedExpoToken } });
      expect(dbToken?.userId).toBe(userBId);
      expect(dbToken?.active).toBe(true);
    });
  });

  describe("5. Background Jobs Privacy & Quiet Hours", () => {
    it("never includes serviceName (PHI) in push reminder bodies", async () => {
      const passwordHash = await argon2.hash("Password123!", { type: argon2.argon2id });
      const user = await prisma.user.create({
        data: {
          email: `reminder-privacy-${Date.now()}@example.test`,
          passwordHash,
          role: "patient",
          patientProfile: {
            create: {
              firstName: "Reminder",
              lastName: "Patient",
              addressLine1: "1 High St",
              city: "London",
              postcode: "SW1A 1AA",
            },
          },
        },
        include: { patientProfile: true },
      });
      const clinic = await prisma.clinic.create({
        data: {
          name: "Pav Dental Central",
          address: "123 High St",
          city: "London",
          postcode: "SW1A 1AA",
          phone: "+442079460000",
          operatingHours: "09:00-17:00",
        },
      });
      const serviceId = `srv_test_${Date.now()}`;
      const service = await prisma.service.create({
        data: {
          id: serviceId,
          name: "Emergency Root Canal Debridement",
          description: "Root canal procedure",
          durationMinutes: 60,
          pricePence: 25000,
          depositPence: 5000,
          category: "emergency",
        },
      });

      const futureDate = new Date(Date.now() + 50 * 60 * 60 * 1000);
      const appt = await prisma.appointment.create({
        data: {
          patientId: user.patientProfile!.id,
          clinicId: clinic.id,
          serviceId: service.id,
          startTimeUtc: futureDate,
          endTimeUtc: new Date(futureDate.getTime() + 60 * 60 * 1000),
          status: "confirmed",
          channel: "clinic",
          totalPricePence: 25000,
        },
      });

      await scheduleAppointmentReminderLadder(appt.id);

      const scheduled = await prisma.scheduledNotification.findMany({
        where: { userId: user.id },
      });
      expect(scheduled.length).toBeGreaterThan(0);

      // Verify no notification body reveals the sensitive service name
      for (const n of scheduled) {
        expect(n.body).not.toContain("Root Canal");
        expect(n.body).not.toContain("Emergency Root Canal Debridement");
        expect(n.body).toMatch(/Your appointment is scheduled|Your visit is tomorrow|Your appointment is at/i);
      }

      // Cleanup
      await prisma.scheduledNotification.deleteMany({ where: { userId: user.id } });
      await prisma.appointment.delete({ where: { id: appt.id } });
      await prisma.service.delete({ where: { id: service.id } });
      await prisma.clinic.delete({ where: { id: clinic.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it("correctly computes London quiet hours end in summer (BST = UTC+1) without 1-hour drift", () => {
      // 15 July: Summer in UK (BST, UTC+1)
      const summerNow = new Date("2026-07-15T23:30:00Z"); // 00:30 BST on 16 July
      const nextEnd = getNextQuietHoursEnd(summerNow, "08:00", "Europe/London");

      // In London, 08:00 BST is 07:00 UTC!
      expect(nextEnd.toISOString()).toBe("2026-07-16T07:00:00.000Z");
    });

    it("correctly computes London quiet hours end in winter (GMT = UTC+0)", () => {
      // 15 January: Winter in UK (GMT, UTC+0)
      const winterNow = new Date("2026-01-15T23:30:00Z"); // 23:30 GMT
      const nextEnd = getNextQuietHoursEnd(winterNow, "08:00", "Europe/London");

      // In London, 08:00 GMT is 08:00 UTC!
      expect(nextEnd.toISOString()).toBe("2026-01-16T08:00:00.000Z");
    });
  });
});
