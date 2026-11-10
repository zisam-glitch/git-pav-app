/**
 * Van screens keep the picked treatment and promise nothing unconfirmed
 * (R16, R27).
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

console.log("\n🚐 VAN (R16, R27)\n");

const read = (f: string) => readFileSync(join(__dirname, "../app/(patient)/van", f), "utf8");
const access = read("access-details.tsx");
const confirm = read("confirm.tsx");
const area = read("service-area.tsx");

assert(/useBookingStore/.test(access) && access.includes("pickedServiceId"), "The van screens start from the treatment picked in the catalogue (R16)");
assert(/useState<string>\(store\.serviceId \|\| pickedServiceId/.test(access), "A treatment already chosen is kept before falling back to the first one");
assert(!access.includes("7.4m"), "No unconfirmed vehicle size");
assert(!access.includes("will be provided on arrival"), "No promise of a permit or voucher");
assert(!confirm.includes("~20–30 min") && !area.includes("~20–30 min"), "No invented arrival time");
assert(!confirm.includes("within 4 minutes"), "No invented operator response time");
assert(!area.includes("Coordinates:"), "No raw GPS coordinates shown to the patient");

console.log("\n🎉 ALL VAN TESTS PASSED!\n");
