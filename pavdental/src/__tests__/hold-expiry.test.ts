/**
 * The hold countdown runs on this phone's clock (B8).
 *
 * The server's holdExpiresAt is a time on the server's clock. A phone that is
 * a few minutes fast or slow would show the wrong time left, so the countdown
 * starts from when the answer arrived and lasts the hold's length.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { holdExpiryOnThisPhone } from "../features/booking/booking-api";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n⏳ HOLD COUNTDOWN ON THE PHONE'S CLOCK (B8)\n");

const phoneNow = Date.parse("2026-11-09T10:00:00Z");
const serverSaysExpiry = Date.parse("2026-11-09T10:05:00Z"); // server clock is 5 minutes behind the phone

assert(
  holdExpiryOnThisPhone({ holdDurationSeconds: 600, holdExpiresAt: serverSaysExpiry }, phoneNow) === phoneNow + 600_000,
  "A 10-minute hold shows 10 minutes left even when the server's clock differs"
);
assert(
  holdExpiryOnThisPhone({ holdDurationSeconds: 0, holdExpiresAt: serverSaysExpiry }, phoneNow) === serverSaysExpiry,
  "Without a hold length it falls back to the server's time"
);

const picker = readFileSync(join(__dirname, "../app/(patient)/booking/slot-picker.tsx"), "utf8");
assert(picker.includes("setHoldExpiry(holdExpiryOnThisPhone("), "The slot picker sets the countdown from the phone's clock");
assert(!/setHoldExpiry\(res\.holdExpiresAt\)/.test(picker), "The slot picker no longer uses the server's clock time");

console.log("\n🎉 ALL HOLD COUNTDOWN TESTS PASSED!\n");
