/**
 * An empty day is not a dead end in the time picker (plan section 3 and 4, item 12).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { hasBookableTime, nextAvailableDay, MAX_WEEKS_AHEAD } from "../features/booking/next-available";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n📅 NEXT AVAILABLE\n");

const now = Date.parse("2026-11-10T10:00:00Z");
const future = "2026-11-10T14:00:00Z";
const past = "2026-11-10T08:00:00Z";

assert(hasBookableTime([{ isAvailable: true, startTimeUtc: future }], {}, now), "A free future time counts");
assert(!hasBookableTime([{ isAvailable: false, startTimeUtc: future }], {}, now), "A taken time does not");
assert(!hasBookableTime([{ isAvailable: true, startTimeUtc: past }], {}, now), "A time already passed does not");
assert(!hasBookableTime(undefined, {}, now) && !hasBookableTime([], {}, now), "No answer, or no times, is not bookable");
assert(!hasBookableTime([{ isAvailable: true, startTimeUtc: future, clinicianId: "d2" }], { clinicianId: "d1" }, now), "Another dentist's time does not count when one is chosen");

const days = [{ iso: "2026-11-10" }, { iso: "2026-11-11" }, { iso: "2026-11-12" }, { iso: "2026-11-13" }];
assert(nextAvailableDay(days, { "2026-11-12": true, "2026-11-13": true }, "2026-11-10")?.iso === "2026-11-12", "Picks the first later day with a free time");
assert(nextAvailableDay(days, { "2026-11-10": true }, "2026-11-10") === null, "Never goes backwards or stays on the same day");
assert(nextAvailableDay(days, { "2026-11-11": undefined }, "2026-11-10") === null, "A day we have no answer for is not offered");
assert(MAX_WEEKS_AHEAD === 4, "The picker looks at most four weeks ahead");

const picker = readFileSync(join(__dirname, "../app/(patient)/booking/slot-picker.tsx"), "utf8");
assert(picker.includes("Next available:") && picker.includes("Look at the following week"), "The picker offers the next free day and the following week");
assert(!/upcomingUkDates\(7\)/.test(picker), "The picker is no longer fixed at seven days");

console.log("\n🎉 ALL NEXT AVAILABLE TESTS PASSED!\n");
