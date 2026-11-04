import crypto from "crypto";
import { prisma } from "./prisma";
import { communicationService } from "./communication-service";
import { env } from "../config/env";

let auditWriteQueue: Promise<unknown> = Promise.resolve();

// Arbitrary constant key for a Postgres transaction-scoped advisory lock. It
// serialises chain appends across every API process and replica, so two writers
// can never chain off the same "last" entry (AU-1). The in-process queue above
// still stops one process from queueing many connections on the lock.
const AUDIT_CHAIN_LOCK_KEY = 7_201_884_310;
const AUDIT_TX_MAX_WAIT_MS = 10_000;
const AUDIT_TX_TIMEOUT_MS = 20_000;

export function getAuditHmacSecret(): string {
  return env.auditHmacSecret || env.auditIpHmacSecret || "dev_audit_hmac_secret_change_me";
}

/**
 * Deterministic JSON stringifier that sorts object keys recursively (AU-3).
 * Ensures identical serialization before and after round-tripping through Postgres JSON/JSONB.
 */
export function canonicalJsonStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalJsonStringify).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(
    (key) => JSON.stringify(key) + ":" + canonicalJsonStringify(obj[key])
  );
  return "{" + pairs.join(",") + "}";
}

/**
 * Builds the canonical string representation of an audit log entry for hash chaining.
 * AU-3: Covers all fields: action, actorId, resourceId, sessionId, ipHash, metadata, and timestamp.
 */
export function buildAuditDataString(data: {
  action: string;
  actorId?: string | null;
  resourceId?: string | null;
  sessionId?: string | null;
  ipHash?: string | null;
  metadata?: unknown;
  timestamp: string;
}): string {
  return canonicalJsonStringify({
    action: data.action,
    actorId: data.actorId ?? null,
    resourceId: data.resourceId ?? null,
    sessionId: data.sessionId ?? null,
    ipHash: data.ipHash ?? null,
    metadata: data.metadata ?? {},
    timestamp: data.timestamp,
  });
}

/**
 * Computes HMAC-SHA256 integrity hash using the external HMAC secret (AU-3).
 */
export function computeAuditIntegrityHash(previousHash: string, dataString: string): string {
  return crypto
    .createHmac("sha256", getAuditHmacSecret())
    .update((previousHash || "") + dataString)
    .digest("hex");
}

export function scrubAuditMetadata(meta: unknown, seen = new WeakSet()): unknown {
  if (!meta || typeof meta !== "object") return meta;
  if (meta instanceof Date) return meta;
  if (seen.has(meta)) return "[CIRCULAR]";
  seen.add(meta);
  if (Array.isArray(meta)) return meta.map((item) => scrubAuditMetadata(item, seen));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta as Record<string, unknown>)) {
    const lk = k.toLowerCase();
    if (
      lk === "email" ||
      lk.endsWith("email") ||
      lk === "password" ||
      lk.endsWith("password") ||
      lk === "vouchercode" ||
      lk === "voucher_code"
    ) {
      out[k] = "[REDACTED]";
    } else if (lk === "path" || lk === "url" || lk === "originalurl") {
      out[k] = typeof v === "string" ? v.split("?")[0] : v;
    } else if (typeof v === "object" && v !== null) {
      out[k] = scrubAuditMetadata(v, seen);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Audit log integrity using hash chains
// Each log entry contains a hash of the previous entry to detect tampering
export async function createAuditLogWithIntegrity(data: {
  action: string;
  actorId?: string | null;
  resourceId?: string | null;
  sessionId?: string | null;
  ipHash?: string | null;
  metadata?: any;
}) {
  const append = async (db: Pick<typeof prisma, "auditLog">) => {
    // Get the most recent non-archived audit log for hash chaining
    const lastLog =
      typeof db.auditLog?.findFirst === "function"
        ? await db.auditLog.findFirst({
            where: { archived: false },
            orderBy: [{ timestampUtc: "desc" }, { id: "desc" }],
            select: { integrityHash: true, id: true, timestampUtc: true },
          })
        : null;

    // AU-2: If there are no active logs (e.g. all previous logs were archived by retention),
    // seed the chain off the last archived row so the chain stays unbroken across retention boundaries.
    let previousHash = lastLog?.integrityHash || "";
    let previousTimestamp = lastLog?.timestampUtc;

    if (!lastLog && typeof db.auditLog?.findFirst === "function") {
      const lastArchived = await db.auditLog.findFirst({
        where: { archived: true },
        orderBy: [{ timestampUtc: "desc" }, { id: "desc" }],
        select: { integrityHash: true, timestampUtc: true },
      });
      if (lastArchived) {
        previousHash = lastArchived.integrityHash || "";
        previousTimestamp = lastArchived.timestampUtc;
      }
    }

    // Strictly after the previous entry: verification orders by timestamp then id,
    // so an equal timestamp could sort out of chain order.
    let now = new Date();
    if (previousTimestamp && now.getTime() <= previousTimestamp.getTime()) {
      now = new Date(previousTimestamp.getTime() + 1);
    }
    const nowIso = now.toISOString();

    // Hash what the database will hand back. Postgres JSON drops undefined values
    // and turns a Date into a string, so hashing the raw object would make an
    // untouched row fail verification and read as tampering.
    const sanitizedMetadata = JSON.parse(JSON.stringify(scrubAuditMetadata(data.metadata) ?? {}));

    // Create HMAC hash chain covering all audit fields (AU-3)
    const dataString = buildAuditDataString({
      action: data.action,
      actorId: data.actorId ?? null,
      resourceId: data.resourceId ?? null,
      sessionId: data.sessionId ?? null,
      ipHash: data.ipHash ?? null,
      metadata: sanitizedMetadata,
      timestamp: nowIso,
    });

    const integrityHash = computeAuditIntegrityHash(previousHash, dataString);

    return db.auditLog.create({
      data: {
        action: data.action,
        actorId: data.actorId ?? null,
        resourceId: data.resourceId ?? null,
        sessionId: data.sessionId ?? null,
        ipHash: data.ipHash ?? null,
        metadata: sanitizedMetadata as any,
        integrityHash,
        timestampUtc: now,
        archived: false,
      },
    });
  };

  const run = () =>
    typeof prisma.$transaction === "function"
      ? prisma.$transaction(
          async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(${AUDIT_CHAIN_LOCK_KEY}::bigint)`;
            return append(tx);
          },
          // Time spent waiting for the chain lock counts against the timeout.
          // Prisma's 5 s default dropped entries when another process held the
          // lock for a while under load, so allow a longer queue.
          { maxWait: AUDIT_TX_MAX_WAIT_MS, timeout: AUDIT_TX_TIMEOUT_MS }
        )
      : append(prisma);

  const resultPromise = auditWriteQueue.then(run, run);
  auditWriteQueue = resultPromise.catch(() => {});
  (globalThis as { __pavAuditWriteQueue?: Promise<unknown> }).__pavAuditWriteQueue = auditWriteQueue;
  return resultPromise;
}

export type VerifyAuditOptions =
  | number
  | {
      limit?: number;
      offset?: number;
      windowHours?: number;
      /** Check the most recent rows instead of the oldest. */
      newest?: boolean;
      fromId?: bigint;
    };

// Rows from before keyed hashes (AU-3) shipped may carry the old unkeyed
// SHA-256. Anything later must carry the HMAC, or the HMAC means nothing.
export const LEGACY_AUDIT_HASH_CUTOFF = new Date("2026-10-25T00:00:00Z");

export function legacyAuditHashAllowed(timestampUtc: Date, afterKeyedRow: boolean): boolean {
  return !afterKeyedRow && timestampUtc < LEGACY_AUDIT_HASH_CUTOFF;
}

// Verify audit log integrity by checking hash chain (AU-2, AU-3)
export async function verifyAuditIntegrity(options: VerifyAuditOptions = 1000) {
  await auditWriteQueue.catch(() => {});

  const limit = typeof options === "number" ? options : options.limit ?? 1000;
  const offset = typeof options === "object" ? options.offset ?? 0 : 0;
  const windowHours = typeof options === "object" ? options.windowHours : undefined;
  const fromId = typeof options === "object" ? options.fromId : undefined;
  const newest = typeof options === "object" ? options.newest ?? false : false;

  const whereClause: any = { archived: false };
  if (windowHours) {
    whereClause.timestampUtc = { gte: new Date(Date.now() - windowHours * 60 * 60 * 1000) };
  }
  if (fromId) {
    whereClause.id = { gte: fromId };
  }

  const order = newest ? "desc" : "asc";
  const rows = await prisma.auditLog.findMany({
    where: whereClause,
    orderBy: [{ timestampUtc: order }, { id: order }],
    take: limit,
    skip: offset,
    select: {
      id: true,
      action: true,
      actorId: true,
      resourceId: true,
      sessionId: true,
      ipHash: true,
      metadata: true,
      timestampUtc: true,
      integrityHash: true,
    },
  });

  const logs = newest ? rows.reverse() : rows;

  if (logs.length === 0) {
    return {
      valid: true,
      verified: true,
      checkedCount: 0,
      issues: [],
    };
  }

  // AU-2: Seed previousHash from the immediate predecessor row before logs[0].
  // If logs[0] is the very first unarchived entry after a retention sweep, predecessor
  // will be the last archived row, guaranteeing unbroken chain verification across retention boundaries.
  let previousHash = "";
  const firstLog = logs[0];

  const predecessor = await prisma.auditLog.findFirst({
    where: {
      OR: [
        { timestampUtc: { lt: firstLog.timestampUtc } },
        { timestampUtc: firstLog.timestampUtc, id: { lt: firstLog.id } },
      ],
    },
    orderBy: [{ timestampUtc: "desc" }, { id: "desc" }],
    select: { integrityHash: true },
  });

  if (predecessor?.integrityHash) {
    previousHash = predecessor.integrityHash;
  }

  const issues: string[] = [];
  let seenKeyedHash = false;

  for (const log of logs) {
    if (!log.integrityHash) {
      issues.push(`Missing integrity hash - possible tampering for log ${log.id} at ${log.timestampUtc.toISOString()}`);
      continue;
    }

    const dataString = buildAuditDataString({
      action: log.action,
      actorId: log.actorId,
      resourceId: log.resourceId,
      sessionId: log.sessionId,
      ipHash: log.ipHash,
      metadata: log.metadata,
      timestamp: log.timestampUtc.toISOString(),
    });

    const expectedHmac = computeAuditIntegrityHash(previousHash, dataString);

    if (log.integrityHash === expectedHmac) {
      seenKeyedHash = true;
    } else {
      // Old unkeyed SHA-256, accepted only for pre-AU-3 rows and never after a keyed one
      const legacyAllowed = legacyAuditHashAllowed(log.timestampUtc, seenKeyedHash);
      const legacyDataString = JSON.stringify({
        action: log.action,
        actorId: log.actorId,
        resourceId: log.resourceId,
        timestamp: log.timestampUtc.toISOString(),
      });
      const legacySha256 = crypto
        .createHash("sha256")
        .update(previousHash + legacyDataString)
        .digest("hex");

      if (!legacyAllowed || log.integrityHash !== legacySha256) {
        issues.push(`Integrity check failed for log ${log.id} at ${log.timestampUtc.toISOString()}`);
      }
    }

    previousHash = log.integrityHash || "";
  }

  return {
    valid: issues.length === 0,
    verified: issues.length === 0,
    checkedCount: logs.length,
    firstId: logs[0].id.toString(),
    lastId: logs[logs.length - 1].id.toString(),
    issues,
  };
}

// Audit retention policy - logs older than retention period are archived
export async function applyAuditRetentionPolicy(retentionDays: number = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // Count logs to be archived
  const countResult = await prisma.auditLog.count({
    where: {
      timestampUtc: { lt: cutoffDate },
      archived: false,
    },
  });

  if (countResult === 0) {
    return { archived: 0, message: "No logs to archive" };
  }

  // Mark logs as archived with timestamp
  const result = await prisma.auditLog.updateMany({
    where: {
      timestampUtc: { lt: cutoffDate },
      archived: false,
    },
    data: {
      archived: true,
      archivedAt: new Date(),
    },
  });

  console.log(`[AUDIT ARCHIVE] Archived ${result.count} audit logs older than ${retentionDays} days`);

  return {
    archived: result.count,
    message: `Archived ${result.count} audit logs older than ${retentionDays} days`,
  };
}

// Critical audit event detection for alerting (AU-6)
const CRITICAL_ACTIONS = [
  "UNAUTHORIZED_ACCESS_ATTEMPT",
  "PRIVILEGE_ESCALATION",
  "DATA_BREACH_ATTEMPT",
  "MASS_DATA_EXPORT",
  "ADMIN_ACCOUNT_MODIFIED",
  "SECURITY_POLICY_VIOLATION",
  "AUDIT_INTEGRITY_FAILURE",
];

export function isCriticalAuditEvent(action: string, statusCode?: number): boolean {
  // A 401 is a missing or expired token, which happens all day; only a
  // signed-in user refused access (403) is worth waking someone for.
  if (statusCode === 403) {
    // AU-4 / AU-6: Access denied on sensitive patient, clinical, or admin endpoints
    if (
      action.includes("/patients") ||
      action.includes("/records") ||
      action.includes("/prescriptions") ||
      action.includes("/admin")
    ) {
      return true;
    }
  }
  return CRITICAL_ACTIONS.some((crit) => action.includes(crit));
}

// Send alert for critical audit events (AU-6: uses configured opsAlertEmail)
export async function sendCriticalAuditAlert(log: any) {
  console.error(`[CRITICAL AUDIT ALERT] ${log.action}`, {
    actorId: log.actorId,
    resourceId: log.resourceId,
    timestamp: log.timestampUtc,
    ipHash: log.ipHash,
  });

  await communicationService.sendEmail({
    to: env.opsAlertEmail,
    subject: `[CRITICAL AUDIT ALERT] ${log.action}`,
    html: `<p>A critical security audit event occurred:</p><pre>${JSON.stringify(
      {
        action: log.action,
        actorId: log.actorId,
        resourceId: log.resourceId,
        timestamp: log.timestampUtc,
        ipHash: log.ipHash,
      },
      null,
      2
    )}</pre>`,
    text: `Critical security audit event: ${log.action} (actorId: ${log.actorId}, resourceId: ${log.resourceId})`,
  }).catch((err) => console.error("[AUDIT ALERT] Failed to send email alert:", err));
}

// Audit failure detection and alerting (AU-6: uses configured opsAlertEmail)
export async function checkAuditFailures() {
  const recentFailures = await prisma.auditLog.findMany({
    where: {
      action: { contains: "FAILURE" },
      timestampUtc: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    take: 100,
  });

  if (recentFailures.length > 10) {
    // High failure rate - send alert
    console.error(`[AUDIT FAILURE ALERT] High failure rate: ${recentFailures.length} failures in 24h`);
    await communicationService.sendEmail({
      to: env.opsAlertEmail,
      subject: `[AUDIT FAILURE ALERT] ${recentFailures.length} failures in 24h`,
      html: `<p>High failure rate detected in the last 24 hours (${recentFailures.length} events).</p>`,
      text: `High failure rate detected in the last 24 hours (${recentFailures.length} events).`,
    }).catch((err) => console.error("[AUDIT FAILURE ALERT] Failed to send email:", err));
  }

  return {
    failureCount: recentFailures.length,
    thresholdExceeded: recentFailures.length > 10,
  };
}
