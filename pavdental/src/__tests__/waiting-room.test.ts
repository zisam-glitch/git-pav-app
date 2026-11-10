/**
 * The waiting room tells the patient what is happening (R12, second half).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { isRunningLate, waitingTrouble } from "../features/video/waiting-state";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🛋️ WAITING ROOM (R12)\n");

assert(waitingTrouble({ failures: 0 }) === null && waitingTrouble({ failures: 2 }) === null, "One or two failed checks is not yet a problem");
assert(waitingTrouble({ failures: 3 }) === "connection", "Three failed checks in a row says the practice cannot be reached");
assert(waitingTrouble({ failures: 0, status: "cancelled" }) === "closed", "A cancelled consultation is closed");
assert(waitingTrouble({ failures: 0, status: "completed" }) === "closed", "A completed consultation is closed");
assert(waitingTrouble({ failures: 0, status: "confirmed" }) === null, "A confirmed consultation is still waiting");

const start = "2026-11-10T10:00:00Z";
assert(!isRunningLate(start, Date.parse("2026-11-10T10:04:00Z")), "Four minutes late is not yet late");
assert(isRunningLate(start, Date.parse("2026-11-10T10:06:00Z")), "Six minutes late is late");
assert(!isRunningLate(null, Date.parse("2026-11-10T11:00:00Z")), "Without a start time nothing is claimed");

const screen = readFileSync(join(__dirname, "../app/(patient)/video/waiting.tsx"), "utf8");
assert(!screen.includes("Ignore transient network errors"), "Errors are no longer ignored for ever");
assert(screen.includes("Message your dentist") && screen.includes("/(patient)/video/message"), "A late or failing waiting room can message the dentist about this visit");
const video = readFileSync(join(__dirname, "../../../backend/src/routes/video.ts"), "utf8");
assert(video.includes('"Your clinician is ready"'), "The patient gets a push when let in");

console.log("\n🎉 ALL WAITING ROOM TESTS PASSED!\n");
