// Rescheduling: what the app offers, and what it asks the patient to confirm.
// The server decides; these only keep the app from offering a dead end.
import {
  RESCHEDULE_MIN_NOTICE_HOURS,
  TOO_LATE_MESSAGE,
  offerableSlots,
  rescheduleQuestion,
  rescheduleState,
} from "../features/booking/reschedule";
import fs from "fs";
import path from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

const now = new Date("2031-03-10T10:00:00Z");
const inHours = (h: number) => new Date(now.getTime() + h * 3_600_000).toISOString();
const clinic = (hours: number, over: Partial<{ status: string; channel: string }> = {}) => ({
  status: over.status ?? "confirmed",
  channel: over.channel ?? "clinic",
  startTimeUtc: inHours(hours),
});

console.log("\n🗓️  RUNNING RESCHEDULE TESTS...\n");

// ─── The rule ────────────────────────────────────────────────────────────────
assert(RESCHEDULE_MIN_NOTICE_HOURS === 48, "the notice is 48 hours (owner decision, 5 Nov)");
assert(rescheduleState(clinic(48), now) === "allowed", "exactly 48 hours ahead can be moved");
assert(rescheduleState(clinic(300), now) === "allowed", "well ahead can be moved");
assert(rescheduleState(clinic(47.9), now) === "too_late", "a minute under 48 hours is too late to move");
assert(rescheduleState(clinic(2), now) === "too_late", "a visit this afternoon is too late to move");
assert(rescheduleState(clinic(100, { channel: "video" }), now) === "allowed", "a video visit can be moved");
assert(rescheduleState(clinic(100, { channel: "van" }), now) === "not_movable", "a van visit can't be moved");
assert(rescheduleState(clinic(100, { status: "draft_hold" }), now) === "not_movable", "an unpaid hold can't be moved");
assert(rescheduleState(clinic(100, { status: "cancelled" }), now) === "not_movable", "a cancelled booking can't be moved");
assert(rescheduleState(clinic(100, { status: "completed" }), now) === "not_movable", "a finished visit can't be moved");
assert(rescheduleState(clinic(-3), now) === "not_movable", "a visit in the past can't be moved");

// ─── What the patient is told ────────────────────────────────────────────────
assert(/48 hours/.test(TOO_LATE_MESSAGE) && /cancel and book again/.test(TOO_LATE_MESSAGE), "inside the window it says cancel and book again");
assert(/cancellation terms apply/.test(TOO_LATE_MESSAGE), "it says the cancellation terms apply");
const question = rescheduleQuestion("2031-03-17T09:00:00Z");
assert(/Move your booking to Monday 17 March at 09:00 UK time\?/.test(question), "the question names the new day and UK time");
assert(/deposit stays with the booking/.test(question) && /nothing more to pay/.test(question), "the question says the deposit stays");
assert(/10:30 UK time/.test(rescheduleQuestion("2031-07-14T09:30:00Z")), "the question uses UK summer time");

// ─── The times offered ──────────────────────────────────────────────────────
const slot = (id: string, startTimeUtc: string | undefined, isAvailable = true) => ({ id, startTimeUtc, isAvailable });
const offered = offerableSlots(
  [
    slot("late", "2031-03-12T15:00:00Z"),
    slot("taken", "2031-03-12T09:00:00Z", false),
    slot("past", "2031-03-09T09:00:00Z"),
    slot("early", "2031-03-12T09:30:00Z"),
    slot("no-time", undefined),
  ],
  now,
);
assert(offered.map((s) => s.id).join(",") === "early,late", "only free future times are offered, soonest first");
assert(offerableSlots([], now).length === 0, "no slots offers nothing");

// ─── The screen uses the rule, and the detail page offers it only when it applies ──
const src = (file: string) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const detail = src("app/(patient)/appointments/[id].tsx");
const screen = src("app/(patient)/appointments/reschedule.tsx");
const layout = src("app/(patient)/appointments/_layout.tsx");
assert(detail.includes("rescheduleState(booking)"), "the detail page asks the shared rule whether to offer Reschedule");
assert(detail.includes('title="Reschedule"'), "the detail page has a Reschedule button");
assert(/state === "allowed"|rescheduleOffer === "allowed"/.test(detail), "the Reschedule button only shows when moving is allowed");
assert(detail.includes("TOO_LATE_MESSAGE"), "inside the window the detail page explains instead of offering a dead end");
assert(layout.includes('name="reschedule"'), "the reschedule screen is registered");
assert(screen.includes("rescheduleState("), "the screen re-checks the rule, so a deep link to a booking that can't move is stopped");
assert(screen.includes("rescheduleQuestion("), "the screen confirms with the shared question");
assert(screen.includes("useRescheduleAppointmentMutation"), "the screen moves the booking through the API");
assert(!screen.includes("createPaymentIntent") && !screen.includes("confirmAppointment(") && !screen.includes("cancelAppointment("), "the screen never takes, confirms or refunds a payment");

console.log("\n✅ ALL RESCHEDULE TESTS PASSED\n");
