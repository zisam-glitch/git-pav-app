/**
 * Fixes from walking the clinician day and patient account journeys (plan
 * J8, J10).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { currentBrushingSlot } from "../features/records/brushing";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

const src = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

console.log("\n🧭 RUNNING JOURNEY FIX TESTS (J8, J10)...\n");

// ─── Clinician schedule: a consult under way keeps its buttons ───────────────
const schedule = src("app/(clinician)/schedule.tsx");
assert(/isReady = [^;]*"in_progress"/.test(schedule), "an in-progress appointment still shows its room and record buttons");
assert(!schedule.includes('"Verified Patient"'), "schedule doesn't invent a patient name");
assert(!schedule.includes('"Dental Consultation"'), "schedule doesn't invent a reason for the visit");
assert(!/type: a\.channel \|\| "video"/.test(schedule), "schedule doesn't call an unknown visit a video consult");

// ─── Saving a card says what really happened ─────────────────────────────────
const cards = src("app/(patient)/(tabs)/profile/payment-methods.tsx");
const mockCheck = cards.indexOf("if (isMock)");
assert(mockCheck !== -1 && mockCheck < cards.indexOf("confirmSetupIntent("), "test mode is caught before Stripe is handed a mock secret");
assert(/if \(!setupIntent\?\.paymentMethodId\) \{\s*throw/.test(cards), "no 'Card Added' when Stripe returned no card");

// ─── Brushing log: the right day and session in UK time ──────────────────────
const at = (iso: string) => currentBrushingSlot(new Date(iso));
assert(JSON.stringify(at("2026-10-31T23:30:00Z")) === JSON.stringify({ day: "Sat", session: "pm" }), "Saturday 23:30 UK is Saturday evening");
assert(JSON.stringify(at("2026-11-02T08:00:00Z")) === JSON.stringify({ day: "Mon", session: "am" }), "Monday 08:00 UK is Monday morning");
// In summer the UK is an hour ahead: 23:30 UTC on a Sunday is already Monday morning.
assert(JSON.stringify(at("2026-07-12T23:30:00Z")) === JSON.stringify({ day: "Mon", session: "am" }), "uses UK time, not UTC, across midnight in summer");
const insights = src("app/(patient)/records/insights.tsx");
assert(/logBrushing\.mutate\(\{ \.\.\.slot, durationSec: 120 \}\)/.test(insights), "insights screen can log a brushing session");

console.log("\n🎉 ALL JOURNEY FIX TESTS PASSED (0 FAILURES)!\n");
