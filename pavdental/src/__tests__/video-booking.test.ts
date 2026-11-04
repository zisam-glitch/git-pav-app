/**
 * Booking a video consult (plan J4).
 *
 * Every "video consult" button opened the triage intake with no appointment,
 * so the patient answered the questions and was then told the consultation
 * couldn't be found. A video consult is a booked appointment: the buttons now
 * book the video service, and the intake is opened for that appointment from
 * the confirmation screen and the appointment page.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { bookingChannelFor, channelParam, firstBookingStep } from "../features/booking/start-booking";
import { useBookingStore } from "../features/booking/booking-store";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n📹 RUNNING VIDEO BOOKING TESTS (J4)...\n");

// ─── Channel and first step come from the service ────────────────────────────
assert(bookingChannelFor({ supportedChannels: ["video"] }) === "video", "a video-only service is booked as video");
assert(bookingChannelFor({ supportedChannels: ["clinic", "van"] }) === "clinic", "a clinic service is booked as a clinic visit");
assert(bookingChannelFor({ supportedChannels: ["clinic", "video"] }, "video") === "video", "the patient's choice of video wins when offered");
assert(bookingChannelFor({ supportedChannels: ["clinic"] }, "video") === "clinic", "video isn't forced on a service that doesn't offer it");
assert(bookingChannelFor({ supportedChannels: ["van"] }) === "van", "a van-only service goes to the van");
assert(firstBookingStep("video") === "/(patient)/booking/clinician-picker", "video skips choosing a clinic");
assert(firstBookingStep("clinic") === "/(patient)/booking/clinic-picker", "clinic visits choose a clinic first");
assert(firstBookingStep("van") === "/(patient)/van/service-area", "van visits start with the coverage check");
assert(channelParam("video") === "video" && channelParam("nope") === null, "only real channels are read from the route");

// ─── A video booking carries no leftover clinic ──────────────────────────────
useBookingStore.getState().setClinic({ id: "clinic-1", name: "Synthetic Clinic" } as never);
useBookingStore.getState().setChannel("video");
assert(useBookingStore.getState().clinic === null, "switching to video drops a clinic from an earlier booking");
useBookingStore.getState().resetDraft();

// ─── No button opens the intake without an appointment ───────────────────────
const src = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
const entryPoints = [
  "app/(patient)/(tabs)/home.tsx",
  "components/emergency-triage-modal.tsx",
  "app/(patient)/van/service-area.tsx",
  "app/(patient)/van/not-covered.tsx",
];
for (const file of entryPoints) {
  const code = src(file);
  assert(!/["']\/\(patient\)\/video\/intake["']/.test(code), `${file} doesn't open the intake without an appointment`);
  assert(code.includes("service-catalog?channel=video"), `${file} books a video consult instead`);
}

// ─── The intake is opened for the booked appointment ─────────────────────────
const confirmed = src("app/(patient)/booking/confirmed.tsx");
assert(
  /pathname: "\/\(patient\)\/video\/intake"[^}]*params: \{ appointmentId \}/.test(confirmed),
  "confirmation screen opens the intake for the new video appointment"
);
assert(!confirmed.includes("Add to calendar"), "no 'Add to calendar' button that doesn't add anything");
assert(!/confirmation email/.test(confirmed), "doesn't promise a confirmation email the server never sends");
for (const invented of ['"Dental Checkup"', '"Pav Dental Central Practice"', '"Selected Time"']) {
  assert(!confirmed.includes(invented), `confirmation screen doesn't invent ${invented}`);
}
const detail = src("app/(patient)/appointments/[id].tsx");
assert(
  /pathname: "\/\(patient\)\/video\/intake" as never, params: \{ appointmentId: booking\.id \}/.test(detail),
  "appointment page opens the intake for that appointment"
);
assert(detail.includes('booking.channel === "video"'), "appointment page only offers it for video appointments");

console.log("\n🎉 ALL VIDEO BOOKING TESTS PASSED (0 FAILURES)!\n");
