/**
 * What the patient is told about their appointments: the next visit on Home,
 * the status badge and the deposit on the appointment page.
 */

import { readFileSync } from "fs";
import { join } from "path";
import {
  appointmentBadge,
  depositPaidLabel,
  nextVisit,
} from "../features/booking/appointment-status";
import { ukDateLabel, ukTime } from "../features/booking/uk-time";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

const src = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

console.log("\n📅 RUNNING APPOINTMENT STATUS TESTS...\n");

const now = Date.parse("2026-11-04T12:00:00Z");
const visit = (id: string, status: string, startTimeUtc: string, endTimeUtc?: string) => ({
  id,
  status,
  startTimeUtc,
  endTimeUtc,
});

// ─── Next visit ──────────────────────────────────────────────────────────────
const visits = [
  visit("later", "confirmed", "2026-11-14T09:00:00Z"),
  visit("soonest", "confirmed", "2026-11-09T09:00:00Z"),
  visit("cancelled", "cancelled", "2026-11-05T09:00:00Z"),
  visit("hold", "draft_hold", "2026-11-05T10:00:00Z"),
  visit("gone", "confirmed", "2026-11-04T09:00:00Z"),
];
assert(nextVisit(visits, now)?.id === "soonest", "next visit is the soonest, not the furthest");
assert(
  nextVisit([visit("c", "cancelled", "2026-11-05T09:00:00Z")], now) === null,
  "a cancelled visit is never the next visit"
);
assert(
  nextVisit([visit("g", "confirmed", "2026-11-04T09:00:00Z")], now) === null,
  "a visit whose time has passed is never the next visit"
);
assert(
  nextVisit([visit("h", "draft_hold", "2026-11-05T09:00:00Z")], now) === null,
  "an unpaid slot hold is never the next visit"
);
assert(
  nextVisit([visit("v", "in_progress", "2026-11-04T11:55:00Z")], now)?.id === "v",
  "a consult under way still counts"
);
assert(nextVisit(undefined, now) === null, "no list, no next visit");

// ─── Badge ───────────────────────────────────────────────────────────────────
const badge = (status: string, start: string, end?: string) =>
  appointmentBadge(visit("x", status, start, end), now);
assert(
  badge("confirmed", "2026-11-04T09:00:00Z").label === "Past",
  "a past visit nobody completed isn't called Completed"
);
assert(badge("completed", "2026-11-04T09:00:00Z").label === "Completed", "a completed visit says so");
assert(badge("no_show", "2026-11-04T09:00:00Z").label === "Missed", "a no-show says Missed");
assert(badge("cancelled", "2026-11-05T09:00:00Z").variant === "danger", "cancelled stays red");
assert(badge("confirmed", "2026-11-05T09:00:00Z").label === "Confirmed", "a future visit says Confirmed");
assert(
  badge("confirmed", "2026-11-04T11:50:00Z", "2026-11-04T12:30:00Z").label === "Confirmed",
  "a visit is not past until its slot ends"
);

// ─── Deposit ─────────────────────────────────────────────────────────────────
assert(depositPaidLabel(2000) === "£20.00", "deposit shows the amount paid");
assert(depositPaidLabel(0) === "—", "nothing paid shows a dash");
assert(depositPaidLabel(undefined) === "—", "unknown shows a dash");

// ─── Times are UK time, whatever the phone's time zone ──────────────────────
assert(ukTime(new Date("2026-11-09T09:00:00Z")) === "09:00", "UK winter time");
assert(ukTime(new Date("2026-07-01T09:00:00Z")) === "10:00", "UK summer time");
assert(
  ukDateLabel(new Date("2026-07-01T23:30:00Z"), { weekday: "short", day: "numeric", month: "short" }) === "Thu 2 Jul",
  "the date is the UK date"
);

// ─── Screens use these ───────────────────────────────────────────────────────
const detail = src("app/(patient)/appointments/[id].tsx");
const home = src("app/(patient)/(tabs)/home.tsx");
const list = src("app/(patient)/(tabs)/appointments.tsx");
const checkIn = src("app/(patient)/check-in.tsx");
for (const [name, screen] of [["page", detail], ["Home", home], ["Bookings", list], ["check-in", checkIn]] as const) {
  assert(screen.includes("ukDateLabel("), `${name} shows the UK date`);
  assert(!/startTimeUtc\)\.toLocale|start\.toLocale/.test(screen), `${name} doesn't use the phone's time zone`);
}
assert(detail.includes("depositPaidLabel(booking.depositPaidPence)"), "the page shows what was paid");
assert(detail.includes("appointmentBadge(booking)"), "the page uses the shared badge");
assert(!detail.includes('title="Reschedule"'), "no Reschedule button until the backend can do it");
assert(home.includes("nextVisit("), "Home picks the next visit with the shared rule");
assert(!home.includes('nextAppointment ? "Confirmed"'), "Home doesn't hard-code Confirmed");

console.log("\n✅ ALL APPOINTMENT STATUS TESTS PASSED\n");
