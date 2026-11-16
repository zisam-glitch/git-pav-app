import { verifyAuditIntegrity, applyAuditRetentionPolicy, checkAuditFailures } from "./audit-integrity";
import { communicationService } from "./communication-service";
import { env } from "../config/env";
import { safeError } from "./log-safety";
import { logger } from "./structured-logging";

// Audit monitoring configuration
const AUDIT_CONFIG = {
  integrityCheckIntervalMs: 60 * 60 * 1000, // 1 hour
  retentionCheckIntervalMs: 24 * 60 * 60 * 1000, // 24 hours
  retentionDays: 365, // 1 year
  failureCheckIntervalMs: 5 * 60 * 1000, // 5 minutes
};

let integrityCheckTimer: NodeJS.Timeout | null = null;
let retentionCheckTimer: NodeJS.Timeout | null = null;
let failureCheckTimer: NodeJS.Timeout | null = null;

// Schedule periodic integrity checks
export function startAuditMonitoring() {
  logger.info("[AUDIT MONITORING] Starting audit monitoring services");

  // Integrity verification every hour
  integrityCheckTimer = setInterval(async () => {
    try {
      const result = await verifyAuditIntegrity({ limit: 1000, newest: true });
      if (!result.verified) {
        logger.error("[AUDIT INTEGRITY] Integrity check failed", undefined, { issues: result.issues });
        await communicationService.sendEmail({
          to: env.opsAlertEmail,
          subject: "[AUDIT INTEGRITY] Hash Chain Verification Failed",
          html: `<p>Audit log integrity verification failed:</p><pre>${JSON.stringify(result.issues, null, 2)}</pre>`,
          text: `Audit log integrity verification failed: ${JSON.stringify(result.issues)}`,
        }).catch(() => {});
      } else {
        logger.info(`[AUDIT INTEGRITY] Verified ${result.checkedCount} audit logs`);
      }
    } catch (error) {
      logger.error("[AUDIT INTEGRITY] Integrity check error", undefined, safeError(error));
    }
  }, AUDIT_CONFIG.integrityCheckIntervalMs);

  // Retention policy check daily
  retentionCheckTimer = setInterval(async () => {
    try {
      const result = await applyAuditRetentionPolicy(AUDIT_CONFIG.retentionDays);
      logger.info(`[AUDIT RETENTION] ${result.message}`);
    } catch (error) {
      logger.error("[AUDIT RETENTION] Retention policy error", undefined, safeError(error));
    }
  }, AUDIT_CONFIG.retentionCheckIntervalMs);

  // Failure rate check every 5 minutes
  failureCheckTimer = setInterval(async () => {
    try {
      const result = await checkAuditFailures();
      if (result.thresholdExceeded) {
        logger.error(`[AUDIT FAILURES] High failure rate detected: ${result.failureCount} failures in 24h`);
        await communicationService.sendEmail({
          to: env.opsAlertEmail,
          subject: `[AUDIT FAILURES] ${result.failureCount} failures in 24h`,
          html: `<p>Audit failure threshold exceeded: ${result.failureCount} events in 24 hours.</p>`,
          text: `Audit failure threshold exceeded: ${result.failureCount} events in 24 hours.`,
        }).catch(() => {});
      }
    } catch (error) {
      logger.error("[AUDIT FAILURES] Failure check error", undefined, safeError(error));
    }
  }, AUDIT_CONFIG.failureCheckIntervalMs);

  // Run initial checks
  runInitialChecks();
}

// Run initial checks on startup
async function runInitialChecks() {
  try {
    logger.info("[AUDIT MONITORING] Running initial integrity check");
    const integrityResult = await verifyAuditIntegrity({ limit: 1000, newest: true });
    if (!integrityResult.verified) {
      logger.error("[AUDIT MONITORING] Initial integrity check failed", undefined, { issues: integrityResult.issues });
    } else {
      logger.info(`[AUDIT MONITORING] Initial integrity check passed: ${integrityResult.checkedCount} logs verified`);
    }
  } catch (error) {
    logger.error("[AUDIT MONITORING] Initial integrity check error", undefined, safeError(error));
  }

  try {
    logger.info("[AUDIT MONITORING] Running initial failure check");
    const failureResult = await checkAuditFailures();
    logger.info(`[AUDIT MONITORING] Initial failure check: ${failureResult.failureCount} failures in 24h`);
  } catch (error) {
    logger.error("[AUDIT MONITORING] Initial failure check error", undefined, safeError(error));
  }
}

// Stop audit monitoring
export function stopAuditMonitoring() {
  logger.info("[AUDIT MONITORING] Stopping audit monitoring services");

  if (integrityCheckTimer) {
    clearInterval(integrityCheckTimer);
    integrityCheckTimer = null;
  }

  if (retentionCheckTimer) {
    clearInterval(retentionCheckTimer);
    retentionCheckTimer = null;
  }

  if (failureCheckTimer) {
    clearInterval(failureCheckTimer);
    failureCheckTimer = null;
  }
}

// Manual trigger for integrity check (for health checks)
export async function manualIntegrityCheck() {
  return verifyAuditIntegrity({ limit: 1000, newest: true });
}

// Manual trigger for retention policy (for admin operations)
export async function manualRetentionCheck(retentionDays?: number) {
  return applyAuditRetentionPolicy(retentionDays || AUDIT_CONFIG.retentionDays);
}
