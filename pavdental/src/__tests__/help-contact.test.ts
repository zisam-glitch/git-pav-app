/**
 * Help and contact (plan section 4, item 6).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { helpActions } from "../features/help/help-content";
import { PRACTICE_CONFIG } from "../config/practice";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n☎️ HELP AND CONTACT\n");

const actions = helpActions("Mon–Fri 09:00–17:30");
const byId = (id: string) => actions.find((a) => a.id === id);

assert(byId("call")?.url === PRACTICE_CONFIG.telUrl && !!byId("call")?.title.includes(PRACTICE_CONFIG.phone), "The call row dials the practice number it shows");
assert(byId("call")?.detail === "Mon–Fri 09:00–17:30", "The call row shows the opening hours");
assert(byId("email")?.url === `mailto:${PRACTICE_CONFIG.email}`, "The email row opens the practice address");
assert(byId("urgent")?.url === "tel:111" && byId("emergency")?.url === "tel:999", "111 and 999 are one tap away");

const profile = readFileSync(join(__dirname, "../app/(patient)/(tabs)/profile/index.tsx"), "utf8");
assert(profile.includes('route: "/(patient)/help"'), "The profile lists Help and contact");
assert(readFileSync(join(__dirname, "../app/(patient)/_layout.tsx"), "utf8").includes('name="help"'), "The patient layout lists the help screen");

console.log("\n🎉 ALL HELP TESTS PASSED!\n");
