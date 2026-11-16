import { env } from "../config/env";
import { prisma } from "./prisma";
import { logger } from "./structured-logging";

// Retention sweeps (CS-23, decisions log #9, draft pending legal review).
// Van location history is kept 30 days. Clinical records and audit logs are
// never deleted automatically: the report counts the ones past their period
// so the DPO can review them. Until RETENTION_ENFORCE is "true" nothing is
// deleted at all, only counted.

export const VAN_LOCATION_RETENTION_DAYS = 30;
export const AUDIT_RETENTION_YEARS = 8;
const DELETE_BATCH = 5000;

const daysAgo = (now: Date, days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const yearsAgo = (now: Date, years: number) => {
  const d = new Date(now);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d;
};
const startOfUtcDay = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

export async function retentionReport(now = new Date()) {
  const vanCutoff = daysAgo(now, VAN_LOCATION_RETENTION_DAYS);
  const [vanLocationPings, endedShiftsWithLocation, clinicalRecordsPastRetention, auditLogsPastRetention] = await Promise.all([
    prisma.vanLocationPing.count({ where: { recordedAt: { lt: vanCutoff } } }),
    prisma.vanShift.count({ where: { endedAt: { lt: vanCutoff }, lastLat: { not: null } } }),
    prisma.patientProfile.count({ where: { erasedAt: { not: null }, retainUntil: { lt: startOfUtcDay(now) } } }),
    prisma.auditLog.count({ where: { timestampUtc: { lt: yearsAgo(now, AUDIT_RETENTION_YEARS) } } }),
  ]);
  return {
    enforced: env.retentionEnforce,
    vanLocationCutoff: vanCutoff.toISOString(),
    // Deleted daily once enforced.
    vanLocationPings,
    endedShiftsWithLocation,
    // Report only: these need a person to decide.
    clinicalRecordsPastRetention,
    auditLogsPastRetention,
  };
}

/** Deletes van location history older than 30 days, in batches. Counts only unless enforce is set. */
export async function applyVanLocationRetention(opts: { enforce?: boolean; now?: Date } = {}) {
  const enforce = opts.enforce ?? env.retentionEnforce;
  const cutoff = daysAgo(opts.now ?? new Date(), VAN_LOCATION_RETENTION_DAYS);
  if (!enforce) {
    return {
      enforced: false,
      pingsDeleted: 0,
      shiftsCleared: 0,
      wouldDelete: await prisma.vanLocationPing.count({ where: { recordedAt: { lt: cutoff } } }),
    };
  }

  let pingsDeleted = 0;
  for (;;) {
    const batch = await prisma.vanLocationPing.findMany({ where: { recordedAt: { lt: cutoff } }, select: { id: true }, take: DELETE_BATCH });
    if (batch.length === 0) break;
    pingsDeleted += (await prisma.vanLocationPing.deleteMany({ where: { id: { in: batch.map((p) => p.id) } } })).count;
    if (batch.length < DELETE_BATCH) break;
  }
  // A finished shift's last known position is location history too.
  const shiftsCleared = (
    await prisma.vanShift.updateMany({
      where: { endedAt: { lt: cutoff }, lastLat: { not: null } },
      data: { lastLat: null, lastLng: null, lastLocationAt: null },
    })
  ).count;
  return { enforced: true, pingsDeleted, shiftsCleared, wouldDelete: 0 };
}

/** The daily sweep: logs counts only, never personal data. */
export async function runRetentionSweep() {
  const van = await applyVanLocationRetention();
  const report = await retentionReport();
  logger.info(
    `[RETENTION] van pings deleted=${van.pingsDeleted} pending=${report.vanLocationPings} (enforced=${van.enforced}); ` +
      `clinical records past retention=${report.clinicalRecordsPastRetention}; audit logs past retention=${report.auditLogsPastRetention}`
  );
  return { van, report };
}
