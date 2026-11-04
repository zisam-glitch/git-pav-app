import { spawn } from "child_process";
import path from "path";
import { prisma } from "../lib/prisma";
import { verifyAuditIntegrity } from "../lib/audit-integrity";
import { acquireAuditExclusive, releaseAuditExclusive } from "../../test/audit-exclusive";

// AU-1 regression: several API processes appending at once must still produce
// one unbroken hash chain. Each child is a separate Node process (its own
// in-process queue), so only the database lock can keep them in order.
const WRITERS = 3;
const WRITES_PER_PROCESS = 15;

function runWriter(index: number): Promise<void> {
  const script = `
    const { createAuditLogWithIntegrity } = require("./src/lib/audit-integrity");
    const { prisma } = require("./src/lib/prisma");
    (async () => {
      for (let i = 0; i < ${WRITES_PER_PROCESS}; i++) {
        await createAuditLogWithIntegrity({ action: "test.audit_chain_concurrency", resourceId: "writer-${index}-" + i });
      }
      await prisma.$disconnect();
    })().catch((err) => { console.error(err); process.exit(1); });
  `;
  const rawUrl = process.env.DATABASE_URL || "";
  const cleanUrl = rawUrl.replace(/([?&])connection_limit=\d+(&|$)/, "$1").replace(/[?&]$/, "");
  const dbUrl = cleanUrl
    ? `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}connection_limit=1&pool_timeout=30`
    : undefined;
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsx", "-e", script], {
      cwd: path.resolve(__dirname, "../.."),
      env: { ...process.env, NODE_ENV: "test", ...(dbUrl ? { DATABASE_URL: dbUrl } : {}) },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`writer ${index} failed: ${stderr}`))));
  });
}

describe("audit hash chain under concurrent writers", () => {
  jest.setTimeout(60_000);

  // Wait for the tamper/retention suite to finish with the shared rows first.
  beforeAll(acquireAuditExclusive, 5 * 60_000);
  afterAll(releaseAuditExclusive);

  it("stays valid when several processes append at the same time", async () => {
    await Promise.all(Array.from({ length: WRITERS }, (_, i) => runWriter(i)));
    const result = await verifyAuditIntegrity(100_000);
    if ((result.issues ?? []).length > 0) {
      // Say what the broken rows are and what sits around them, so a CI failure explains itself.
      const ids = (result.issues ?? []).map((issue) => BigInt(/log (\d+)/.exec(issue)?.[1] ?? "0"));
      const around = await prisma.auditLog.findMany({
        where: { id: { gte: ids[0] - BigInt(3), lte: ids[ids.length - 1] + BigInt(2) } },
        orderBy: [{ timestampUtc: "asc" }, { id: "asc" }],
        select: { id: true, action: true, timestampUtc: true, archived: true, metadata: true },
      });
      console.error("Broken audit rows and neighbours:", JSON.stringify(around, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 1));
    }
    expect(result.issues ?? []).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
