/**
 * When a held slot runs out, the patient keeps their booking (R8).
 *
 * Before, the draft was wiped and the time picker bounced them back to the
 * treatment list. Now only the slot and its countdown are dropped.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { useBookingStore } from "../features/booking/booking-store";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n⌛ HOLD EXPIRY KEEPS THE BOOKING (R8)\n");

const s = useBookingStore.getState();
const service = { id: "check-up", name: "Check-up" } as never;
const clinic = { id: "c1", name: "Pav Dental" } as never;
const clinician = { id: "d1", fullName: "Dr Example" } as never;
s.setChannel("clinic");
s.setService(service);
s.setClinic(clinic);
s.setClinician(clinician);
s.setSlot({ id: "slot1" } as never);
s.setHoldExpiry(Date.now() + 600_000);

assert(typeof useBookingStore.getState().releaseSlot === "function", "The store can release just the slot");
useBookingStore.getState().releaseSlot();
const after = useBookingStore.getState();
assert(after.slot === null && after.holdExpiresAt === null, "The slot and its countdown are cleared");
assert(after.service === service && after.clinic === clinic && after.clinician === clinician && after.channel === "clinic", "Treatment, clinic, dentist and channel are kept");

const summary = readFileSync(join(__dirname, "../app/(patient)/booking/summary.tsx"), "utf8");
assert(!/resetDraft\(\)/.test(summary), "The summary screen never wipes the draft when a hold runs out");
assert((summary.match(/releaseSlot\(\)/g) ?? []).length >= 3, "All three expiry paths release only the slot");
assert(!summary.includes("Slot Reservation Expired"), "Wording: 'Slot Reservation Expired' is plain English now");

console.log("\n🎉 ALL HOLD EXPIRY TESTS PASSED!\n");
