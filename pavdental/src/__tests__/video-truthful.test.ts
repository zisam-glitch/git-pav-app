/**
 * Video screens say only what happened, and never invent an answer (R12, R13, R19).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { canSaveConsult, consultPayload, FOLLOW_UP_OPTIONS } from "../features/video/consult-form";
import { waitingRoomOpen } from "../features/video/waiting-room-window";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🎥 VIDEO (R12, R13, R19)\n");

const now = Date.parse("2026-11-10T10:00:00Z");
const at = (mins: number) => new Date(now + mins * 60_000).toISOString();

assert(!waitingRoomOpen({ startTimeUtc: at(3 * 24 * 60), endTimeUtc: at(3 * 24 * 60 + 20) }, now), "The waiting room is closed three days early (R12)");
assert(!waitingRoomOpen({ startTimeUtc: at(11), endTimeUtc: at(31) }, now), "Closed 11 minutes before the start");
assert(waitingRoomOpen({ startTimeUtc: at(9), endTimeUtc: at(29) }, now), "Open 9 minutes before the start");
assert(waitingRoomOpen({ startTimeUtc: at(-5), endTimeUtc: at(15) }, now), "Open once the visit has started");
assert(!waitingRoomOpen({ startTimeUtc: at(-30), endTimeUtc: at(-10) }, now), "Closed after the slot has ended");

const read = (f: string) => readFileSync(join(__dirname, "../app/(patient)", f), "utf8");
const intake = read("video/intake.tsx");
const photos = read("video/photos.tsx");
const review = read("video/photo-review.tsx");
const summary = read("video/summary.tsx");
const detail = read("appointments/[id].tsx");

assert(/painLevels = \[0, 1/.test(intake), "Pain can be 0 (R19)");
assert(intake.includes("3 to 7 days"), "There is an option between 2 days and a week (R19)");
assert(!photos.includes("|| '5'"), "A missing pain score is not turned into 5 on the photos screen");
assert(!/: 5;/.test(review), "A missing pain score is not turned into 5 on the review screen");
assert(/summaryData\?\.status === "completed"/.test(summary), "'Completed' is shown only when the visit is completed (R13)");
assert(detail.includes("waitingRoomOpen(booking)"), "The appointment screen offers the waiting room only when it is open (R12)");

// The dentist can write to the patient from the consult room (V49)
const consultRoom = readFileSync(join(__dirname, "../app/(clinician)/consult-room.tsx"), "utf8");
assert(consultRoom.includes("/api/appointment-messages/") && consultRoom.includes("Message patient"), "The dentist can message the patient from the consult room");
assert(consultRoom.includes("did not send"), "A failed message to the patient is shown as a failure");

// The end-of-consult form saves only what the dentist wrote (V34)
const empty = { diagnosis: "  ", notes: "", plan: "", followUp: "none" as const };
assert(!canSaveConsult(empty), "A visit cannot be completed with nothing recorded");
assert(canSaveConsult({ ...empty, notes: "Rinse with salt water" }) && canSaveConsult({ ...empty, followUp: "clinic" }), "Advice, or a follow-up, is enough to complete the visit");
const payload = consultPayload("a1", { diagnosis: " Sore gum ", notes: "", plan: "", followUp: "van" });
assert(payload.diagnosis === "Sore gum" && payload.notes === undefined && payload.treatmentPlan === undefined, "Empty fields are left out, not filled with a stock sentence");
assert(payload.followUpRecommended === "van", "The follow-up the dentist chose is sent");
assert(FOLLOW_UP_OPTIONS.map((o) => o.key).join() === "none,clinic,van,video", "The follow-up choices match the server");
assert(!consultRoom.includes("Consultation concluded via video call."), "No stock sentence is saved as the dentist's notes");

console.log("\n🎉 ALL VIDEO TESTS PASSED!\n");
