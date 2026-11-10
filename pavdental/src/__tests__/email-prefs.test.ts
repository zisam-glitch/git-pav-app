/**
 * The app promises only the messages that are sent (R1, R2).
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

console.log("\n✉️ EMAIL PROMISES (R1, R2)\n");

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
const prefs = read("app/(patient)/(tabs)/profile/notifications.tsx");
const consents = read("app/onboarding/consents.tsx");

assert(!prefs.includes('label="SMS text messages"'), "No SMS switch while no texts are sent");
assert(prefs.includes('label="Email notifications"'), "The Email switch is still there");
assert(!consents.includes("SMS and email reminders"), "Onboarding no longer promises SMS reminders");

console.log("\n🎉 ALL EMAIL PROMISE TESTS PASSED!\n");
