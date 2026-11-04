import fs from "fs";
import os from "os";
import path from "path";

// Jest runs test files in parallel workers against one database. Two audit
// suites can't overlap: the tamper/retention suite edits, archives and deletes
// rows on purpose, and the concurrency suite verifies the whole chain. If they
// overlap, the second reads a row the first has changed for a moment and
// reports tampering that never happened. Each takes this lock for the whole
// file. Other suites only append, which is safe either way.
const LOCK_DIR = path.join(os.tmpdir(), "pav-audit-exclusive.lock");
const STALE_MS = 3 * 60_000;
const POLL_MS = 100;
const GIVE_UP_MS = 4 * 60_000;

function breakIfStale() {
  try {
    if (Date.now() - fs.statSync(LOCK_DIR).mtimeMs > STALE_MS) fs.rmSync(LOCK_DIR, { recursive: true, force: true });
  } catch {
    // Lock vanished between calls; the next mkdir decides.
  }
}

export async function acquireAuditExclusive(): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      fs.mkdirSync(LOCK_DIR);
      return;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
      breakIfStale();
      if (Date.now() - start > GIVE_UP_MS) throw new Error("Timed out waiting for the audit test lock");
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  }
}

export function releaseAuditExclusive(): void {
  fs.rmSync(LOCK_DIR, { recursive: true, force: true });
}
