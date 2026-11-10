import crypto from "crypto";
import { Server } from "http";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import 'express-async-errors';

import authRoutes from "./routes/auth";
import authAccountRoutes from "./routes/auth-account";
import authOtpRoutes from "./routes/auth-otp";
import patientRoutes from "./routes/patients";
import patientDependantsRoutes from "./routes/patient-dependants";
import serviceRoutes from "./routes/services";
import bookingRoutes from "./routes/booking";
import vanRoutes from "./routes/van";
import publicVanRoutes from "./routes/public-van";
import publicAppConfigRoutes from "./routes/public-app-config";
import vanStopsRoutes from "./routes/van-stops";
import vanQueueRoutes from "./routes/van-queue";
import auditRoutes from "./routes/audit";
import paymentRoutes from "./routes/payments";
import { stripeWebhookHandler } from "./routes/payments";
import videoRoutes from "./routes/video";
import prescriptionRoutes from "./routes/prescriptions";
import prescriptionFileRoutes from "./routes/prescription-files";
import notificationRoutes from "./routes/notifications";
import cancellationRoutes from "./routes/cancellations";
import adminRoutes from "./routes/admin";
import adminScheduleRoutes from "./routes/admin-schedule";
import adminErasureRoutes from "./routes/admin-erasure";
import consentRoutes from "./routes/consents";
import triageRoutes from "./routes/triage";
import messageRoutes from "./routes/messages";
import financingRoutes from "./routes/financing";
import rewardRoutes from "./routes/rewards";
import { adminReferralRoutes, patientReferralRoutes } from "./routes/referrals";
import { objectStorage } from "./lib/object-storage";
import { auditMiddleware } from "./middleware/audit";
import { attachOptionalAuth, requireAuth, requireRole, AuthRequest } from "./middleware/auth";
import { errorHandler, notFoundHandler, standardResponse } from "./middleware/error-handler";
import { buildRateLimiters, parseTrustProxy } from "./middleware/rate-limits";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";
import { env } from "./config/env";
import { startAuditMonitoring, stopAuditMonitoring } from "./lib/audit-monitoring";
import { startBackgroundJobs, stopBackgroundJobs } from "./lib/background-jobs";
import { bootstrapAdminFromEnv } from "./lib/bootstrap-admin";
import { flushErrorTracking, initErrorTracking, reportError } from "./lib/error-tracking";
import { safeError } from "./lib/log-safety";
import { getCoverageBackend } from "./lib/van-coverage";
import { describeRoutingProvider } from "./lib/van-eta";

const app = express();
const PORT = env.port;
// Behind a load balancer req.ip is the balancer unless the hop count is set.
app.set("trust proxy", parseTrustProxy(process.env.TRUST_PROXY));

// ─── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Native mobile requests do not set Origin. Browser callers must be an
    // explicitly configured application origin (or local/tunnel origins in dev).
    if (
      !origin ||
      env.allowedOrigins.includes(origin) ||
      (env.isDevelopment &&
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin))
    ) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed"));
  },
  credentials: true,
}));
// Stripe signs the raw request body, so this route must be registered before
// express.json() parses API requests.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);
app.use(express.json({ limit: "2mb" }));
// A caller-supplied id is echoed and logged, so only a short, plain one is
// kept; anything else gets a fresh id (BE-24).
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;
app.use((req, res, next) => {
  const rawId = req.headers["x-request-id"];
  const reqId =
    typeof rawId === "string" && SAFE_REQUEST_ID.test(rawId.trim())
      ? rawId.trim()
      : crypto.randomUUID();
  req.id = reqId;
  res.setHeader("x-request-id", reqId);
  next();
});

// ─── Request identity attachment ─────────────────────────────────────────────
// Attach optional auth for routes that need it (public catalog endpoints). It
// runs before the limiter so signed-in traffic is limited per user.
app.use(attachOptionalAuth);

// ─── Rate limiting ───────────────────────────────────────────────────────────
// Deployed, counters live in Redis so all replicas share them. Locally they stay
// in memory so repeated test runs don't accumulate. See middleware/rate-limits.ts.
const { globalLimiter, authLimiter } = buildRateLimiters({
  production: env.isProduction || env.isStaging,
  redis: env.isProduction || env.isStaging ? redis : undefined,
});
app.set("authLimiter", authLimiter);
app.use(globalLimiter);
app.use(standardResponse);

// ─── Health Checks (SV-4) ─────────────────────────────────────────────────────
// Keep /livez and /readyz, drop fabricated dsptMode claim
const readinessCheckHandler = async (_req: Request, res: Response) => {
  let dbOk = false;
  let redisOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {}

  try {
    await redis.ping();
    redisOk = true;
  } catch {}

  const ok = dbOk && redisOk;
  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    service: "pavdental-backend-api",
    timestamp: new Date().toISOString(),
    checks: { database: dbOk ? "ok" : "error", redis: redisOk ? "ok" : "error" },
  });
};

const livenessCheckHandler = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "pavdental-backend-api",
    timestamp: new Date().toISOString(),
  });
};

app.get("/", livenessCheckHandler);
app.get("/health", livenessCheckHandler);
app.get("/livez", livenessCheckHandler);
app.get("/healthz", readinessCheckHandler);
app.get("/readyz", readinessCheckHandler);

// ─── Signed Document Stream Endpoint ──────────────────────────────────────────
app.get("/api/patients/documents/stream/*", async (req: Request, res: Response) => {
  const key = (req.params as Record<string, string>)[0] || "";
  const expires = Number(req.query.expires || 0);
  const sig = String(req.query.sig || "");
  if (!key || !objectStorage.verifySignedUrl(key, expires, sig)) {
    res.status(403).json({ error: "Invalid or expired document signature" });
    return;
  }
  try {
    const file = await objectStorage.download(key);
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${key.split("/").pop() || "document"}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
    res.send(file.buffer);
  } catch {
    res.status(404).json({ error: "Document not found" });
  }
});

// ─── Audit Integrity Health Check ─────────────────────────────────────────────
app.get("/health/audit-integrity", requireAuth, requireRole("admin"), async (_req: AuthRequest, res: Response) => {
  const { manualIntegrityCheck } = await import("./lib/audit-monitoring.js");
  const result = await manualIntegrityCheck();

  res.json({
    status: result.verified ? "ok" : "error",
    checkedCount: result.checkedCount,
    issues: result.issues,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
// Public catalog endpoints (no auth required, no audit)
app.use("/api/services", serviceRoutes);
app.use("/api/public/van", publicVanRoutes);
app.use("/api/public/app-config", publicAppConfigRoutes);

// Protected routes with audit logging
// NOTE: the more specific /api/auth/* sub-routers must be mounted BEFORE the
// generic /api/auth mount — Express matches prefixes in registration order,
// so a later-mounted sub-router would still pass through the earlier mount's
// middleware (authLimiter running twice for OTP; account actions burning the
// login bucket — see routes/auth-account.ts header).
// Account sub-router: global limiter only (change-password/deletion are
// one-off authed actions, not auth attempts).
app.use("/api/auth/account", auditMiddleware, authAccountRoutes);
// Phone-OTP login (see routes/auth-otp.ts) — strict limiter, applied once.
app.use("/api/auth/otp", authLimiter, auditMiddleware, authOtpRoutes);
// CS-54: authLimiter applied specifically to login/register/reset routes within authRoutes
app.use("/api/auth", auditMiddleware, authRoutes);
// Mount specific /api/patients/dependants before generic /api/patients/:id
app.use("/api/patients/dependants", auditMiddleware, patientDependantsRoutes);
app.use("/api/patients", requireAuth, auditMiddleware, patientRoutes);
app.use("/api/booking/appointments", requireAuth, auditMiddleware, cancellationRoutes);
app.use("/api/booking", requireAuth, auditMiddleware, bookingRoutes);
// Mount specific van sub-routes before generic /api/van
app.use("/api/van/stops", requireAuth, auditMiddleware, vanStopsRoutes);
app.use("/api/van/shift", requireAuth, auditMiddleware, vanQueueRoutes);
app.use("/api/van", requireAuth, auditMiddleware, vanRoutes);
app.use("/api/audit", requireAuth, auditMiddleware, auditRoutes);
app.use("/api/payments", requireAuth, auditMiddleware, paymentRoutes);
app.use("/api/video", requireAuth, auditMiddleware, videoRoutes);
app.use("/api/prescriptions", requireAuth, auditMiddleware, prescriptionRoutes);
// Short-lived signed links to prescription PDFs (no bearer token; see the route).
app.use("/api/prescription-files", prescriptionFileRoutes);
app.use("/api/notifications", requireAuth, auditMiddleware, notificationRoutes);
// The dashboard's staff inbox (CS-29): the same message routes, as an admin, who sees every thread.
app.use("/api/admin/messages", requireAuth, requireRole("admin"), auditMiddleware, messageRoutes);
app.use("/api/admin", requireAuth, auditMiddleware, adminRoutes, adminScheduleRoutes, adminReferralRoutes, adminErasureRoutes);
app.use("/api/consents", requireAuth, auditMiddleware, consentRoutes);
app.use("/api/triage", requireAuth, auditMiddleware, triageRoutes);
app.use("/api/messages", requireAuth, auditMiddleware, messageRoutes);
app.use("/api/financing", requireAuth, auditMiddleware, financingRoutes);
app.use("/api/rewards", requireAuth, auditMiddleware, rewardRoutes);
app.use("/api/referrals", requireAuth, auditMiddleware, patientReferralRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Process-level error handlers ─────────────────────────────────────────────
// Logged with safeError: a raw Prisma error can quote patient data.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', safeError(reason));
  reportError(reason, { source: "unhandledRejection" });
  // Logged and reported, but the process keeps running.
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', safeError(error));
  reportError(error, { source: "uncaughtException" });
  // Uncaught exceptions can leave the application in an undefined state, so
  // exit (after sending the report) and let the process manager restart.
  flushErrorTracking().finally(() => process.exit(1));
});

// ─── Graceful Shutdown (SV-2) ─────────────────────────────────────────────────
let isShuttingDown = false;

export async function gracefulShutdown(
  server?: Server | null,
  signal: string = "SIGTERM",
  timeoutMs: number = 10000
): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[SHUTDOWN] Received ${signal}. Draining in-flight requests and stopping services...`);

  // 1. Stop background jobs and monitoring timers
  try {
    stopBackgroundJobs();
    stopAuditMonitoring();
  } catch (err) {
    console.warn("[SHUTDOWN] Error stopping background jobs:", safeError(err));
  }

  // 2. Stop accepting new HTTP connections and drain in-flight requests
  if (server) {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        console.warn("[SHUTDOWN] Drain timeout reached. Forcing socket closure.");
        resolve();
      }, timeoutMs);

      server.close((err) => {
        clearTimeout(timer);
        if (err) {
          console.warn("[SHUTDOWN] Error while closing HTTP server:", safeError(err));
        } else {
          console.log("[SHUTDOWN] HTTP server closed cleanly.");
        }
        resolve();
      });
    });
  }

  // 3. Disconnect Redis and Prisma
  try {
    await redis.quit();
    console.log("[SHUTDOWN] Redis connection closed.");
  } catch (err) {
    console.warn("[SHUTDOWN] Error closing Redis:", safeError(err));
  }

  try {
    await prisma.$disconnect();
    console.log("[SHUTDOWN] Prisma client disconnected.");
  } catch (err) {
    console.warn("[SHUTDOWN] Error disconnecting Prisma:", safeError(err));
  }

  // 4. Flush Sentry error tracking
  try {
    await flushErrorTracking();
  } catch {}

  console.log("[SHUTDOWN] Graceful shutdown completed.");
}

let activeHttpServer: Server | null = null;

const onShutdownSignal = (signal: string) => async () => {
  try {
    await gracefulShutdown(activeHttpServer, signal);
    process.exit(0);
  } catch (err) {
    console.error(`[SHUTDOWN] Fatal error during ${signal}:`, safeError(err));
    process.exit(1);
  }
};

process.on("SIGTERM", onShutdownSignal("SIGTERM"));
process.on("SIGINT", onShutdownSignal("SIGINT"));

// ─── Startup ──────────────────────────────────────────────────────────────────
if (require.main === module) {
  initErrorTracking();
  activeHttpServer = app.listen(PORT, async () => {
    console.log(`🏥 Pav Dental API running on port ${PORT}`);
    console.log(`[VAN ETA] Routing: ${describeRoutingProvider()}`);
    try {
      await redis.connect();
    } catch {
      console.warn("[Redis] Could not connect on startup — will retry lazily");
    }

    // Start audit monitoring services
    startAuditMonitoring();

    // A new deployment with no shell: BOOTSTRAP_ADMIN_EMAIL creates the first
    // admin once (see lib/bootstrap-admin.ts). Does nothing when one exists.
    void bootstrapAdminFromEnv();

    // Start background jobs (slot hold sweeper and notification dispatcher)
    startBackgroundJobs();

    // Probe the van-coverage backend (PostGIS vs JS fallback), backfill
    // polygon geometry when PostGIS is available, and defuse the derived-
    // geometry trigger when it is not.
    getCoverageBackend().catch((err) =>
      console.warn("[VAN COVERAGE] Startup probe failed:", safeError(err))
    );
  });
}

export default app;
