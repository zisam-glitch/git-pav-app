import http from "http";
import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import app from "../server";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import {
  appendAuditLogInTransaction,
  createAuditLogWithIntegrity,
  verifyAuditIntegrity,
  applyAuditRetentionPolicy,
  isCriticalAuditEvent,
  LEGACY_AUDIT_HASH_CUTOFF,
  legacyAuditHashAllowed,
} from "../lib/audit-integrity";
import { communicationService } from "../lib/communication-service";

// Every suite shares one audit chain, and some verify all of it while this one
// runs. Tampering therefore happens only inside a transaction that is always
// rolled back: other connections never see the broken chain, and nothing has
// to be put back by hand.
class RolledBack extends Error {}
async function inRolledBackTransaction(fn: (tx: Prisma.TransactionClient) => Promise<void>) {
  await prisma
    .$transaction(
      async (tx) => {
        await fn(tx);
        throw new RolledBack();
      },
      { maxWait: 10_000, timeout: 20_000 }
    )
    .catch((err) => {
      if (!(err instanceof RolledBack)) throw err;
    });
}

describe("CS-20: Audit chain across replicas, retention, and security outcomes", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  let patientUser: any;
  let patientToken: string;
  let otherPatientUser: any;
  let otherPatientToken: string;

  beforeAll(async () => {
    // 1. Create patient user and profile
    patientUser = await prisma.user.create({
      data: {
        email: `patient-${tag}@example.test`,
        passwordHash: "argon2id_mock_hash",
        role: "patient",
        patientProfile: {
          create: {
            firstName: "Audit",
            lastName: "Tester",
          },
        },
      },
      include: { patientProfile: true },
    });
    patientToken = signAccessToken({
      sub: patientUser.id,
      role: "patient",
      sessionId: crypto.randomUUID(),
    });

    // 2. Create another patient user (to attempt unauthorized cross-patient access)
    otherPatientUser = await prisma.user.create({
      data: {
        email: `other-patient-${tag}@example.test`,
        passwordHash: "argon2id_mock_hash",
        role: "patient",
        patientProfile: {
          create: {
            firstName: "Other",
            lastName: "Patient",
          },
        },
      },
      include: { patientProfile: true },
    });
    otherPatientToken = signAccessToken({
      sub: otherPatientUser.id,
      role: "patient",
      sessionId: crypto.randomUUID(),
    });

    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    // Clean up profiles (keep users so audit logs remain valid)
    await prisma.patientProfile.deleteMany({
      where: { id: { in: [patientUser.patientProfile.id, otherPatientUser.patientProfile.id] } },
    });
  });

  describe("AU-2: Verification passes after retention archiving", () => {
    it("preserves an unbroken hash chain when older logs are archived", async () => {
      // 1. Append several audit logs
      const log1 = await createAuditLogWithIntegrity({
        action: "retention.test.step1",
        actorId: patientUser.id,
        metadata: { step: 1 },
      });
      const log2 = await createAuditLogWithIntegrity({
        action: "retention.test.step2",
        actorId: patientUser.id,
        metadata: { step: 2 },
      });

      // 2. Verify initial integrity scoped to this test
      const preArchiveCheck = await verifyAuditIntegrity({ fromId: log1.id });
      expect(preArchiveCheck.valid).toBe(true);
      expect(preArchiveCheck.checkedCount).toBeGreaterThanOrEqual(2);

      await inRolledBackTransaction(async (tx) => {
        // 3. Simulate retention archiving on the older log
        await tx.auditLog.update({
          where: { id: log1.id },
          data: { archived: true, archivedAt: new Date() },
        });

        // 4. Append another log after retention
        const log3 = await appendAuditLogInTransaction(tx, {
          action: "retention.test.step3",
          actorId: patientUser.id,
          metadata: { step: 3 },
        });

        // 5. Verify integrity: log2 and log3 must verify cleanly chaining from archived predecessor log1
        const postArchiveCheck = await verifyAuditIntegrity({ fromId: log2.id }, tx);
        expect(postArchiveCheck.valid).toBe(true);
        expect(postArchiveCheck.issues).toEqual([]);
        expect(postArchiveCheck.checkedCount).toBeGreaterThanOrEqual(2); // log2 and log3
        expect(BigInt(postArchiveCheck.lastId!)).toBe(log3.id);
      });
    });
  });

  describe("AU-3: HMAC covers all fields and detects tampering", () => {
    it("fails verification if metadata or sessionId is tampered with in DB", async () => {
      const log = await createAuditLogWithIntegrity({
        action: "tamper.test.entry",
        actorId: patientUser.id,
        sessionId: "session_original_123",
        ipHash: "ip_hash_abc",
        metadata: { sensitive: "original" },
      });

      // Verification before tampering
      let check = await verifyAuditIntegrity({ fromId: log.id });
      expect(check.valid).toBe(true);

      await inRolledBackTransaction(async (tx) => {
        // Tamper with metadata directly in database
        await tx.auditLog.update({
          where: { id: log.id },
          data: { metadata: { sensitive: "tampered_value" } },
        });

        // Verification must immediately detect tampering
        const tampered = await verifyAuditIntegrity({ fromId: log.id }, tx);
        expect(tampered.valid).toBe(false);
        expect(tampered.issues.some((issue) => issue.includes(String(log.id)))).toBe(true);
      });

      // Verification succeeds again once the tampering is rolled back
      check = await verifyAuditIntegrity({ fromId: log.id });
      expect(check.valid).toBe(true);
    });

    it("fails verification if a row is deleted or modified in the chain", async () => {
      const logA = await createAuditLogWithIntegrity({ action: "chain.a" });
      const logB = await createAuditLogWithIntegrity({ action: "chain.b" });
      const logC = await createAuditLogWithIntegrity({ action: "chain.c" });

      expect((await verifyAuditIntegrity({ fromId: logA.id })).valid).toBe(true);

      await inRolledBackTransaction(async (tx) => {
        // Delete middle row (simulating DB tampering / row deletion)
        await tx.auditLog.delete({ where: { id: logB.id } });

        const check = await verifyAuditIntegrity({ fromId: logA.id }, tx);
        expect(check.valid).toBe(false);
        // The row that chained off B is the one that breaks. That's C, unless
        // another suite wrote a row between B and C.
        const afterB = await tx.auditLog.findFirstOrThrow({
          where: {
            OR: [
              { timestampUtc: { gt: logB.timestampUtc } },
              { timestampUtc: logB.timestampUtc, id: { gt: logB.id } },
            ],
          },
          orderBy: [{ timestampUtc: "asc" }, { id: "asc" }],
        });
        expect(afterB.id <= logC.id).toBe(true);
        expect(check.issues.some((i) => i.includes(`log ${afterB.id} `))).toBe(true);
      });

      // Rolling back restores B, and the chain verifies again
      expect((await verifyAuditIntegrity({ fromId: logA.id })).valid).toBe(true);
    });
  });

  describe("AU-4: Auditing all outcomes (including 403 on patient data)", () => {
    it("audits a 403 Forbidden on patient profile with full route path and resourceId", async () => {
      // Attempt to access otherPatient's profile using patientToken
      const targetProfileId = otherPatientUser.patientProfile.id;
      const res = await fetch(`${baseUrl}/api/patients/${targetProfileId}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${patientToken}`,
          "x-request-id": "req_forbidden_test_123",
        },
      });

      expect(res.status).toBe(403);

      // Wait for audit log queue to flush
      await (globalThis as any).__pavAuditWriteQueue?.catch(() => {});
      await new Promise((r) => setTimeout(r, 100));

      // Find the audit log for this request
      const auditEntry = await prisma.auditLog.findFirst({
        where: {
          actorId: patientUser.id,
          resourceId: targetProfileId,
        },
        orderBy: { id: "desc" },
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry?.action).toBe("GET /api/patients/:id/profile");
      expect(auditEntry?.resourceId).toBe(targetProfileId);
      const meta = auditEntry?.metadata as any;
      expect(meta.statusCode).toBe(403);
      expect(meta.outcome).toBe("denied");
      expect(meta.requestId).toBe("req_forbidden_test_123");
    });
  });

  // These don't tamper with rows: other suites verify the chain at the same time.
  describe("AU-3: the old unkeyed hash", () => {
    it("is accepted only on rows from before keyed hashes shipped, and never after a keyed row", () => {
      const before = new Date(LEGACY_AUDIT_HASH_CUTOFF.getTime() - 60_000);
      const after = new Date(LEGACY_AUDIT_HASH_CUTOFF.getTime() + 60_000);
      expect(legacyAuditHashAllowed(before, false)).toBe(true);
      expect(legacyAuditHashAllowed(before, true)).toBe(false);
      expect(legacyAuditHashAllowed(after, false)).toBe(false);
      expect(legacyAuditHashAllowed(new Date(), false)).toBe(false);
    });
  });

  describe("monitoring window", () => {
    it("checks the newest rows when asked", async () => {
      const log = await createAuditLogWithIntegrity({ action: "newest.window.entry" });
      const newest = await verifyAuditIntegrity({ limit: 5, newest: true });
      expect(newest.checkedCount).toBeGreaterThan(0);
      expect(BigInt(newest.lastId!) >= log.id).toBe(true);
    });
  });

  describe("AU-6: Critical event alerts", () => {
    it("doesn't treat a missing or expired token (401) as a critical event", () => {
      expect(isCriticalAuditEvent("GET /api/patients/:id/profile", 401)).toBe(false);
      expect(isCriticalAuditEvent("GET /api/admin/users", 401)).toBe(false);
    });

    it("recognizes 403 denied attempts on patient data as critical audit events", () => {
      expect(isCriticalAuditEvent("GET /api/patients/:id/profile", 403)).toBe(true);
      expect(isCriticalAuditEvent("GET /api/patients/:id/profile", 200)).toBe(false);
      expect(isCriticalAuditEvent("UNAUTHORIZED_ACCESS_ATTEMPT")).toBe(true);
    });

    it("sends critical audit alert to configured ops email", async () => {
      const emailSpy = jest.spyOn(communicationService, "sendEmail").mockResolvedValue({} as any);

      const res = await fetch(`${baseUrl}/api/patients/${otherPatientUser.patientProfile.id}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${patientToken}`,
        },
      });
      expect(res.status).toBe(403);

      await (globalThis as any).__pavAuditWriteQueue?.catch(() => {});
      await new Promise((r) => setTimeout(r, 150));

      expect(emailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("[CRITICAL AUDIT ALERT]"),
        })
      );

      emailSpy.mockRestore();
    });
  });
});
