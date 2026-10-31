/**
 * Van request address (plan J5).
 *
 * The service-area screen used to store the coverage sector name
 * ("WC - West Central London") as the patient's postcode, and the address
 * screen showed it in a read-only field (with "SW1A 1AA" as a made-up
 * fallback). The server rejects anything that isn't a UK postcode, so no van
 * request from the app could go through.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { useVanStore } from "../features/van/van-store";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

// Same rule the server applies (backend/src/schemas/van-dispatch.ts).
const SERVER_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/;

console.log("\n🚐 RUNNING VAN REQUEST ADDRESS TESTS (J5)...\n");

// ─── The payload carries the postcode the patient confirmed ──────────────────
const store = useVanStore.getState();
store.resetDraft();
assert(useVanStore.getState().city === "", "no invented default city");
store.setLocationCoverage({ postcode: "SW1A 1AA", lat: 51.5014, lng: -0.1419, isCovered: true, availability: null });
store.setAccessDetails({ addressLine1: "1 Example Street", city: "London", postcode: "sw1a1aa", parkingType: "private_driveway" });
const payload = useVanStore.getState().getAccessDetailsPayload();
assert(payload.postcode === "SW1A 1AA", "postcode typed on the address screen is sent, in the spaced form");
assert(SERVER_POSTCODE.test(payload.postcode), "sent postcode passes the server's UK postcode rule");
assert(payload.lat === 51.5014 && payload.lng === -0.1419, "sends the location from the coverage check");

// ─── The screens never use the sector name or a made-up postcode ─────────────
const read = (p: string) => readFileSync(join(__dirname, "../app/(patient)/van", p), "utf8");
const serviceArea = read("service-area.tsx");
const accessDetails = read("access-details.tsx");

assert(!/postcode:\s*result\.activeSector/.test(serviceArea), "service area never stores the sector name as the postcode");
assert(/postcode:\s*result\.postcode/.test(serviceArea), "service area stores the server's postcode");
assert(!serviceArea.includes('"Pav Dental Van #1"'), "service area doesn't invent a van name");
assert(!accessDetails.includes('"SW1A 1AA"'), "address screen has no made-up postcode value");
assert(!/editable=\{false\}/.test(accessDetails), "postcode field can be edited");
assert(/onChangeText=\{setPostcode\}/.test(accessDetails), "postcode field updates the postcode");
assert(/UK_POSTCODE\.test\(postcode\.trim\(\)\)/.test(accessDetails), "address screen checks the postcode before continuing");

console.log("\n🎉 ALL VAN REQUEST ADDRESS TESTS PASSED (0 FAILURES)!\n");
