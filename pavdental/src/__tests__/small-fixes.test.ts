/**
 * A batch of small truth fixes (R17, R20, R24, R26, R28, R29).
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { bookingStep } from "../features/booking/booking-steps";
import { parseDob } from "../features/onboarding/dob";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🧹 SMALL FIXES\n");

// R26
assert(JSON.stringify(bookingStep("clinic", "time")) === JSON.stringify({ current: 4, total: 5 }), "A clinic visit counts 4 of 5 at the time picker");
assert(JSON.stringify(bookingStep("video", "dentist")) === JSON.stringify({ current: 2, total: 4 }), "A video consult goes 1, 2, 3, 4 (no skipped step)");
assert(JSON.stringify(bookingStep("video", "pay")) === JSON.stringify({ current: 4, total: 4 }), "A video consult ends at 4 of 4");

// R20
const now = new Date("2026-11-10T12:00:00Z");
assert(parseDob("15/04/1990", now) === "1990-04-15", "A real date of birth is accepted");
assert(parseDob("31/02/2010", now) === null, "31 February is refused");
assert(parseDob("10/11/2027", now) === null, "A date in the future is refused");
assert(parseDob("10/11/2026", now) === "2026-11-10", "A baby born today is accepted");
assert(parseDob("01/01/1800", now) === null, "A date over 120 years ago is refused");
assert(parseDob("1990-04-15", now) === null, "The wrong format is refused");

const src = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
// R24
assert(!src("app/(patient)/booking/clinician-picker.tsx").includes("reviews"), "No link promising reviews (there are none)");
// R28
assert(!existsSync(join(__dirname, "../app/(auth)/guest-limit.tsx")), "The guest-mode screen is gone");
assert(!src("app/(auth)/_layout.tsx").includes("guest-limit"), "The auth layout no longer lists it");
// R29
assert(!/telUrl:\s*"tel:\d+"/.test(src("config/practice.ts")), "The dial link follows the practice phone setting");
// R17
const jobs = readFileSync(join(__dirname, "../../../backend/src/lib/background-jobs.ts"), "utf8");
assert(!jobs.includes("Free cancellations available up to 48 hours prior"), "The 48-hour reminder no longer says free cancellation ends now");

console.log("\n🎉 ALL SMALL FIX TESTS PASSED!\n");
