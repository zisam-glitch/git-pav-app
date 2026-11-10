/**
 * The waiting room tells the patient what is happening (R12, second half).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { cameraProblem, cameraProblemMessage, needsSettings, levelBars } from "../features/video/camera-check-state";
import { isRunningLate, waitingTrouble, patientPresenceLine, waitingStatusLine } from "../features/video/waiting-state";

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

// Presence (V10, V11)
assert(patientPresenceLine({ admitted: false, waiting: true }) === "The patient is in the waiting room.", "The dentist is told the patient is waiting");
assert(patientPresenceLine({ admitted: false, waiting: false }).includes("hasn't come"), "The dentist is told when the patient has not come in");
assert(patientPresenceLine({ admitted: true, waiting: false }).includes("let in"), "Admission wins over presence");
assert(waitingStatusLine({ admitted: false, late: false, opensAt: "2026-11-10T09:50:00Z" }) === "You're early", "Before the window opens the patient is early");
assert(waitingStatusLine({ admitted: false, late: true }) === "Running a few minutes late", "A late start says so");
assert(waitingStatusLine({ admitted: true, late: true }) === "You're in", "Being let in wins over lateness");
assert(screen.includes("/api/video/waiting/") && screen.includes("AppState"), "The waiting room reports in and pauses in the background");
assert(screen.includes("/leave"), "Leaving tells the practice");
assert(!screen.includes("Consultation ready"), "The waiting room does not claim the consultation is ready");

// Pre-call camera and microphone check (V18)
assert(cameraProblem("permissions") === "blocked" && needsSettings("blocked"), "A refused permission sends the patient to Settings");
assert(cameraProblem("cam-in-use") === "in_use" && cameraProblem("mic-in-use") === "in_use" && !needsSettings("in_use"), "A camera in use by another app says so");
assert(cameraProblem("not-found") === "missing" && cameraProblem(undefined) === "other", "A missing camera and an unknown problem are told apart");
assert(cameraProblemMessage("blocked").includes("Settings"), "The blocked message says where to fix it");
assert(levelBars(0) === 0 && levelBars(NaN) === 0 && levelBars(-1) === 0, "Silence lights no bars");
assert(levelBars(0.05) >= 1 && levelBars(1) === 5 && levelBars(0.3) > levelBars(0.05), "Louder sound lights more bars, up to the top");
const check = readFileSync(join(__dirname, "../app/(patient)/video/device-check.tsx"), "utf8");
assert(check.includes("<CameraCheck />"), "The pre-call check tests the camera and microphone");

console.log("\n🎉 ALL WAITING ROOM TESTS PASSED!\n");
