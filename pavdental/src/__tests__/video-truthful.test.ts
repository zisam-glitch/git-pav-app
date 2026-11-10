/**
 * Video screens say only what happened, and never invent an answer (R12, R13, R19).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { canSaveConsult, consultPayload, FOLLOW_UP_OPTIONS } from "../features/video/consult-form";
import { answersFromDraft as tdFromDraft, draftBody as tdBody, hasAnswers as tdHasAnswers } from "../features/video/triage-draft";
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

// Recording: the visit is not recorded, so the intake says so and asks for no consent (decision 4, V32)
const intakeScreen = readFileSync(join(__dirname, "../app/(patient)/video/intake.tsx"), "utf8");
const videoRoutes = readFileSync(join(__dirname, "../../../backend/src/routes/video.ts"), "utf8");
assert(!videoRoutes.includes("enable_recording"), "Rooms are created without recording, so the statement below is true");
assert(intakeScreen.includes("Your video visit is not recorded") && !intakeScreen.includes("dualRecordingConsent"), "The intake says the visit is not recorded and has no recording-consent switch");

// The end-of-consult form saves only what the dentist wrote (V34)
const empty = { diagnosis: "  ", notes: "", plan: "", followUp: "none" as const };
assert(!canSaveConsult(empty), "A visit cannot be completed with nothing recorded");
assert(canSaveConsult({ ...empty, notes: "Rinse with salt water" }) && canSaveConsult({ ...empty, followUp: "clinic" }), "Advice, or a follow-up, is enough to complete the visit");
const payload = consultPayload("a1", { diagnosis: " Sore gum ", notes: "", plan: "", followUp: "van" });
assert(payload.diagnosis === "Sore gum" && payload.notes === undefined && payload.treatmentPlan === undefined, "Empty fields are left out, not filled with a stock sentence");
assert(payload.followUpRecommended === "van", "The follow-up the dentist chose is sent");
assert(FOLLOW_UP_OPTIONS.map((o) => o.key).join() === "none,clinic,van,video", "The follow-up choices match the server");
assert(!consultRoom.includes("Consultation concluded via video call."), "No stock sentence is saved as the dentist's notes");

// Triage answers are saved as the patient goes, and come back (V31)
const tdBlank = { symptomText: "", painLevel: null, hasSwelling: false, duration: null };
assert(!tdHasAnswers(tdBlank) && tdHasAnswers({ ...tdBlank, painLevel: 0 }), "An untouched form saves nothing, a pain score of 0 counts as an answer");
assert(tdBody({ ...tdBlank, symptomText: "Ache", painLevel: 3 }).painLevel === 3, "The draft carries the answers");
const tdBack = tdFromDraft({ symptomText: "Ache", painLevel: 3, hasSwelling: true, duration: "1 to 2 days" });
assert(tdBack.symptomText === "Ache" && tdBack.painLevel === 3 && tdBack.hasSwelling === true && tdBack.duration === "1 to 2 days", "A saved draft comes back");
const tdBad = tdFromDraft({ symptomText: 5, painLevel: 11, hasSwelling: "yes", duration: "Soon" });
assert(Object.keys(tdBad).length === 0 && Object.keys(tdFromDraft(null)).length === 0, "A malformed draft is ignored, not trusted");
const tdIntake = readFileSync(join(__dirname, "../app/(patient)/video/intake.tsx"), "utf8");
assert(tdIntake.includes("/api/video/triage-draft/") && tdIntake.includes("draftLoaded"), "The intake saves and restores its answers, and does not save before the draft has loaded");

console.log("\n🎉 ALL VIDEO TESTS PASSED!\n");
