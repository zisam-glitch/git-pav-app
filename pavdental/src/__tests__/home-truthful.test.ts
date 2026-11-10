/**
 * Home says only true things (R22, R6).
 */

import { readFileSync } from "fs";
import { join } from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🏠 HOME (R22, R6)\n");

const home = readFileSync(join(__dirname, "../app/(patient)/(tabs)/home.tsx"), "utf8");

assert(!home.includes("bellDot"), "The bell has no always-on unread dot (R6)");
assert(!/showBalance/.test(home) && !home.includes("••••"), "No hide-my-name toggle left over from a banking template");
assert(!home.includes("Dental Examination & Polish"), "No made-up treatment name");
assert(!home.includes("Central Practice"), "No made-up clinic name");
assert(!/\|\| "En Route"/.test(home), "No made-up van status");
assert(!home.includes('label: "Surgery"'), "Restorative is not labelled Surgery");
assert(home.includes("appointmentBadge(nextAppointment)"), "The next-visit badge follows the booking's status");
assert(!/Math\.round\(\(srv\.pricePence \|\| 0\) \* 0\.25\)/.test(home), "No guessed 25% deposit");
assert(!home.includes("onPressInfo"), "The info button that opened the whole catalogue is gone");

console.log("\n🎉 ALL HOME TESTS PASSED!\n");
