/**
 * Starting a van visit (plan J5).
 *
 * Every van service also offers clinic visits, and a service is booked as a
 * clinic visit unless the patient asked for something else, so the treatment
 * catalog never led to the van. The only other way in, "Book van to my home"
 * after a video consult, skipped choosing a service, so the review screen then
 * said "No service selected". Both now go through the catalog filtered to van
 * services, which books the chosen service as a van visit.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { bookingChannelFor, channelParam, firstBookingStep } from "../features/booking/start-booking";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🚐 RUNNING VAN ENTRY TESTS (J5)...\n");

// The catalog's ?channel=van books a clinic-or-van service as a van visit.
const asked = channelParam("van");
assert(asked === "van", "?channel=van is read from the route");
assert(bookingChannelFor({ supportedChannels: ["clinic", "van"] }, asked) === "van", "a clinic-or-van service is booked as a van visit when the van is asked for");
assert(firstBookingStep("van") === "/(patient)/van/service-area", "which starts with the coverage check");

const src = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

const home = src("app/(patient)/(tabs)/home.tsx");
assert(home.includes("service-catalog?channel=van"), "home has a way to book a van visit");

const summary = src("app/(patient)/video/summary.tsx");
assert(summary.includes("service-catalog?channel=van"), "'Book van to my home' chooses a van service first");
assert(!/["']\/\(patient\)\/van\/service-area["']/.test(summary), "'Book van to my home' doesn't skip choosing a service");

const catalog = src("app/(patient)/booking/service-catalog.tsx");
assert(/onlyChannel === "van"/.test(catalog), "the catalog says when it's showing van services");

// ─── Outside the van's areas ─────────────────────────────────────────────────
// Coverage is the service areas staff draw for each van, not a radius, and the
// screen can't know how far outside them the patient is (M1 1AE, in
// Manchester, was told it "sits just outside"). Nothing plans routes fortnightly.
const notCovered = src("app/(patient)/van/not-covered.tsx");
for (const claim of ["15-mile", "mile radius", "just outside", "fortnightly"]) {
  assert(!notCovered.includes(claim), `out-of-area screen doesn't claim "${claim}"`);
}

console.log("\n🎉 ALL VAN ENTRY TESTS PASSED (0 FAILURES)!\n");
