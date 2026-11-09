/**
 * The appointment screen says only true things (R9, R23, and plan §4 item 7).
 *
 * - A cancelled booking never offers check-in.
 * - The address, who the visit is for, the price and the balance come from the
 *   booking itself.
 * - A failed load is not reported as "not found".
 */

import { readFileSync } from "fs";
import { join } from "path";
import {
  canCheckIn,
  clinicAddressLine,
  visitFor,
  priceLabel,
  balanceLabel,
  directionsUrl,
} from "../features/booking/appointment-detail";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n📋 APPOINTMENT SCREEN (R9, R23, directions, who, price)\n");

const now = Date.parse("2026-11-10T10:00:00Z");
const in5h = new Date(now + 5 * 3600_000).toISOString();
const in3d = new Date(now + 72 * 3600_000).toISOString();

assert(canCheckIn({ status: "confirmed", channel: "clinic", startTimeUtc: in5h }, now), "A confirmed clinic visit within 24 hours offers check-in");
assert(!canCheckIn({ status: "cancelled", channel: "clinic", startTimeUtc: in5h }, now), "A cancelled visit does not offer check-in (R9)");
assert(!canCheckIn({ status: "completed", channel: "clinic", startTimeUtc: in5h }, now), "A completed visit does not offer check-in");
assert(!canCheckIn({ status: "draft_hold", channel: "clinic", startTimeUtc: in5h }, now), "An unpaid hold does not offer check-in");
assert(!canCheckIn({ status: "confirmed", channel: "video", startTimeUtc: in5h }, now), "A video visit does not offer check-in");
assert(!canCheckIn({ status: "confirmed", channel: "clinic", startTimeUtc: in3d }, now), "A visit three days away does not offer check-in yet");

assert(clinicAddressLine({ name: "Pav Dental", address: "786 Leeds Road", postcode: "BD3 9TY" }) === "Pav Dental, 786 Leeds Road, BD3 9TY", "Address line joins name, street and postcode");
assert(clinicAddressLine({ name: "Pav Dental" }) === "Pav Dental", "Address line copes with a missing street");
assert(clinicAddressLine(null) === null, "No clinic, no address line");

assert(visitFor({ dependant: { firstName: "Asha", lastName: "Khan" } }) === "Asha Khan", "A child's visit names the child");
assert(visitFor({ dependant: null }) === "You", "Your own visit says You");

assert(priceLabel(8500) === "£85.00", "Price shows pounds");
assert(priceLabel(undefined) === null, "No price, no price row");
assert(balanceLabel({ totalPricePence: 8500, depositPaidPence: 2500, status: "confirmed" }) === "£60.00", "Balance is total minus deposit");
assert(balanceLabel({ totalPricePence: 2000, depositPaidPence: 2500, status: "confirmed" }) === "£0.00", "Balance never goes below zero");
assert(balanceLabel({ totalPricePence: 8500, depositPaidPence: 2500, status: "cancelled" }) === null, "A cancelled visit has no balance");

const url = directionsUrl({ name: "Pav Dental", address: "786 Leeds Road", postcode: "BD3 9TY" });
assert(!!url && url.includes(encodeURIComponent("786 Leeds Road")), "Directions link carries the encoded address");
assert(directionsUrl(null) === null, "No clinic, no directions");

const screen = readFileSync(join(__dirname, "../app/(patient)/appointments/[id].tsx"), "utf8");
assert(screen.includes("canCheckIn("), "The screen asks canCheckIn before showing the check-in card");
assert(!/within24h && booking\.channel !== "video"/.test(screen), "The check-in card no longer checks only the time");
assert(!screen.includes("addressLine1"), "The screen no longer reads a clinic field that does not exist");
assert(/isError/.test(screen) && screen.includes("couldn't load"), "A failed load gets its own message");
assert(screen.includes("PRACTICE_CONFIG.telUrl"), "The screen can call the practice");
assert(screen.includes("directionsUrl("), "The screen can open directions");

console.log("\n🎉 ALL APPOINTMENT SCREEN TESTS PASSED!\n");
