import { PrismaClient } from "@prisma/client";
import {
  withJobLease,
  JOB_LOCK_IDS,
  runRetentionSweepWithLock,
  checkPushReceiptsWithLock,
  awardMissedVisitPointsWithLock,
  issueMissedReferralVouchersWithLock,
} from "../lib/background-jobs";
import { prisma } from "../lib/prisma";

describe("BE-23 (AUD-13, ADR-0002): Background job leadership via leases", () => {
  describe("withJobLease primitives", () => {
    it("acquires lock and executes runner when not locked", async () => {
      let executed = false;
      const res = await withJobLease(JOB_LOCK_IDS.SLOT_EXPIRY, async () => {
        executed = true;
        return "ok";
      });
      expect(res.acquired).toBe(true);
      expect(res.result).toBe("ok");
      expect(executed).toBe(true);
    });

    it("skips runner when another concurrent runner holds the lock", async () => {
      const lockId = 29999;
      let runner1Executed = false;
      let runner2Executed = false;

      // Runner 1 holds lock for 300ms
      const p1 = withJobLease(lockId, async () => {
        runner1Executed = true;
        await new Promise((resolve) => setTimeout(resolve, 300));
        return "runner1-done";
      });

      // Small pause to guarantee runner 1 acquired lock first
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Runner 2 attempts to acquire the exact same lock while runner 1 is active
      const p2 = withJobLease(lockId, async () => {
        runner2Executed = true;
        return "runner2-done";
      });

      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1.acquired).toBe(true);
      expect(r1.result).toBe("runner1-done");
      expect(runner1Executed).toBe(true);

      // Runner 2 must have cleanly skipped
      expect(r2.acquired).toBe(false);
      expect(r2.result).toBeUndefined();
      expect(runner2Executed).toBe(false);
    });

    it("releases the lease when the job finishes", async () => {
      const lockId = 29998;
      // First run
      const r1 = await withJobLease(lockId, async () => 42);
      expect(r1.acquired).toBe(true);
      expect(r1.result).toBe(42);

      // Second run after commit
      const r2 = await withJobLease(lockId, async () => 99);
      expect(r2.acquired).toBe(true);
      expect(r2.result).toBe(99);
    });

    it("releases the lease when the job throws", async () => {
      const lockId = 29997;
      await expect(
        withJobLease(lockId, async () => {
          throw new Error("Job failed internally");
        })
      ).rejects.toThrow("Job failed internally");

      // Subsequent attempt acquires lock without being blocked by leaked locks
      const r2 = await withJobLease(lockId, async () => "recovered");
      expect(r2.acquired).toBe(true);
      expect(r2.result).toBe("recovered");
    });
  });

  describe("leases", () => {
    it("runs a job that queries the database on a pool of one connection", async () => {
      const url = new URL(process.env.DATABASE_URL as string);
      url.searchParams.set("connection_limit", "1");
      url.searchParams.set("pool_timeout", "3");
      const singleConnection = new PrismaClient({ datasourceUrl: url.toString() });
      try {
        const res = await withJobLease(
          29990,
          async () => {
            const rows = await singleConnection.$queryRaw<{ one: number }[]>`SELECT 1 AS one`;
            return rows[0].one;
          },
          { db: singleConnection }
        );
        expect(res).toEqual({ acquired: true, result: 1 });
      } finally {
        await singleConnection.$disconnect();
      }
    });

    it("holds no transaction open while the job runs", async () => {
      const lockId = 29991;
      let inTransactionDuringJob = true;
      await withJobLease(lockId, async () => {
        const rows = await prisma.$queryRaw<{ state: string }[]>`
          SELECT state FROM pg_stat_activity
          WHERE datname = current_database() AND state = 'idle in transaction' AND query LIKE '%job_leases%'
        `;
        inTransactionDuringJob = rows.length > 0;
      });
      expect(inTransactionDuringJob).toBe(false);
    });

    it("takes over a lease whose holder died", async () => {
      const lockId = 29992;
      await prisma.jobLease.create({
        data: { id: lockId, holder: "crashed-instance", expiresAt: new Date(Date.now() - 1000) },
      });
      const res = await withJobLease(lockId, async () => "took over");
      expect(res).toEqual({ acquired: true, result: "took over" });
    });

    it("doesn't take a lease that is still running elsewhere", async () => {
      const lockId = 29993;
      await prisma.jobLease.create({
        data: { id: lockId, holder: "other-instance", expiresAt: new Date(Date.now() + 60000) },
      });
      let ran = false;
      const res = await withJobLease(lockId, async () => {
        ran = true;
      });
      expect(res.acquired).toBe(false);
      expect(ran).toBe(false);
      // Not ours, so it isn't released either.
      expect(await prisma.jobLease.findUnique({ where: { id: lockId } })).not.toBeNull();
      await prisma.jobLease.delete({ where: { id: lockId } });
    });

    it("renews the lease while a long job runs, so it can't be taken over", async () => {
      const lockId = 29994;
      let secondRan = false;
      const first = withJobLease(lockId, () => new Promise((resolve) => setTimeout(resolve, 900)), {
        leaseMs: 300,
        renewMs: 100,
      });
      await new Promise((resolve) => setTimeout(resolve, 600));
      const second = await withJobLease(lockId, async () => {
        secondRan = true;
      });
      await first;
      expect(second.acquired).toBe(false);
      expect(secondRan).toBe(false);
    });
  });

  describe("Concurrent runners for AUD-13 specified jobs", () => {
    it("coordinates retention sweep between two concurrent runners", async () => {
      const [r1, r2] = await Promise.all([
        runRetentionSweepWithLock(),
        runRetentionSweepWithLock(),
      ]);

      const acquiredCount = (r1.acquired ? 1 : 0) + (r2.acquired ? 1 : 0);
      expect(acquiredCount).toBe(1);
    });

    it("coordinates push receipts check between two concurrent runners", async () => {
      const [r1, r2] = await Promise.all([
        checkPushReceiptsWithLock(),
        checkPushReceiptsWithLock(),
      ]);

      const acquiredCount = (r1.acquired ? 1 : 0) + (r2.acquired ? 1 : 0);
      expect(acquiredCount).toBe(1);
    });

    it("coordinates rewards catch-up between two concurrent runners", async () => {
      const [r1, r2] = await Promise.all([
        awardMissedVisitPointsWithLock(),
        awardMissedVisitPointsWithLock(),
      ]);

      const acquiredCount = (r1.acquired ? 1 : 0) + (r2.acquired ? 1 : 0);
      expect(acquiredCount).toBe(1);
    });

    it("coordinates referral vouchers catch-up between two concurrent runners", async () => {
      const [r1, r2] = await Promise.all([
        issueMissedReferralVouchersWithLock(),
        issueMissedReferralVouchersWithLock(),
      ]);

      const acquiredCount = (r1.acquired ? 1 : 0) + (r2.acquired ? 1 : 0);
      expect(acquiredCount).toBe(1);
    });
  });
});
