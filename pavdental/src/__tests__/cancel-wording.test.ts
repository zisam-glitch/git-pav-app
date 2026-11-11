/**
 * One cancellation message everywhere (R3, R25).
 *
 * The bookings list used to promise a refund whatever the notice, while the
 * detail screen gave the real policy. Both now use one text, and the refund
 * timing reads the same on every screen.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { CANCELLATION_SHEET_MESSAGE, REFUND_TIMING } from "../features/booking/cancellation-policy";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n💷 CANCELLATION WORDING (R3, R25)\n");

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
const list = read("app/(patient)/(tabs)/appointments.tsx");
const detail = read("app/(patient)/appointments/[id].tsx");
const cancelled = read("app/(patient)/appointments/cancelled.tsx");

assert(/full/.test(CANCELLATION_SHEET_MESSAGE) && /half/.test(CANCELLATION_SHEET_MESSAGE) && /kept/.test(CANCELLATION_SHEET_MESSAGE), "The message states full, half and no refund");
assert(list.includes("cancellationSheetMessage()"), "The bookings list uses the shared message");
assert(detail.includes("cancellationSheetMessage()"), "The detail screen uses the shared message");
assert(!/refunded by your bank within 5 working days/.test(list), "The list no longer promises a refund within 5 days");
assert(cancelled.includes("REFUND_TIMING"), "The cancelled screen uses the shared refund timing");
assert(!/5 to 10 working days/.test(cancelled), "No hard-coded refund timing on the cancelled screen");
assert(REFUND_TIMING.includes("5 to 10 working days"), "Refund timing is 5 to 10 working days");
assert(!cancelled.includes("Find another time"), "'Find another time' (empty draft, bounced to the catalogue) is gone");

console.log("\n🎉 ALL CANCELLATION WORDING TESTS PASSED!\n");
