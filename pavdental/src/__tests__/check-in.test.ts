/**
 * Check-in is one honest action (R10).
 *
 * It used to show two tick-boxes: the "health declaration" was recorded as a
 * balance payment, the medical-history row opened nothing, no appointment id
 * checked in the first booking in the list, and it said check-in opens 24
 * hours ahead when the server opens it at 48.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { CHECK_IN_OPENS_HOURS } from "../features/booking/appointment-detail";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n✅ CHECK-IN (R10)\n");

const screen = readFileSync(join(__dirname, "../app/(patient)/check-in.tsx"), "utf8");
const detail = readFileSync(join(__dirname, "../app/(patient)/appointments/[id].tsx"), "utf8");

assert(CHECK_IN_OPENS_HOURS === 48, "The app's check-in window matches the server's 48 hours");
assert(!screen.includes("PRE_ARRIVAL_TASKS"), "The tick-box tasks are gone");
assert(!/kind:\s*"balance"/.test(screen), "Nothing is recorded as a balance payment");
assert(!screen.includes("source[0]"), "No appointment id no longer checks in the first booking");
assert(/completedTasks:\s*\[\]/.test(screen), "Check-in records no tasks that weren't done");
assert(!/24 hours/.test(screen), "The screen does not say check-in opens 24 hours ahead");
assert(!detail.includes("forms, consent and balance"), "The appointment card does not promise forms, consent and balance");
assert(/checkedIn/.test(detail), "The appointment screen shows when you are checked in");

console.log("\n🎉 ALL CHECK-IN TESTS PASSED!\n");
