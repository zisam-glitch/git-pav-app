// One Idempotency-Key per cancel attempt, kept until it works (checklist D3).
import { readFileSync } from "fs";
import { join } from "path";
import { attemptKey, finishAttempt } from "../lib/attempt-key";

let failed = 0;
const check = (name: string, ok: boolean) => {
  if (ok) console.log(`✓ PASSED: ${name}`);
  else {
    failed++;
    console.error(`✗ FAILED: ${name}`);
  }
};

const k1 = attemptKey("cancel:a1");
check("a retry of the same attempt sends the same key", attemptKey("cancel:a1") === k1);
check("another appointment gets its own key", attemptKey("cancel:a2") !== k1);
check("the key has the shape the server accepts (8 to 128 letters, digits, dashes)", /^[A-Za-z0-9_:-]{8,128}$/.test(k1));
finishAttempt("cancel:a1");
check("after it works, the next attempt gets a new key", attemptKey("cancel:a1") !== k1);

const api = readFileSync(join(__dirname, "../features/booking/booking-api.ts"), "utf8");
const cancel = api.slice(api.indexOf("export async function cancelAppointment"), api.indexOf("// ─── Reschedule"));
check("cancelling sends the key and clears it only on success", cancel.includes('"Idempotency-Key": attemptKey(scope)') && cancel.indexOf("finishAttempt(scope)") > cancel.indexOf("if (!res.ok)"));

if (failed > 0) process.exit(1);
console.log("ATTEMPT KEY TESTS PASSED");
