/**
 * The dentist's next-days view groups visits by UK day (video plan V40).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { groupByUkDay, WEEK_DAYS } from "../features/clinician/week-schedule";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n📅 WEEK SCHEDULE\n");

const now = new Date("2026-11-10T10:00:00Z"); // Tuesday, UK time is GMT
const visit = (id: string, startTimeUtc: string, channel = "video") => ({ id, startTimeUtc, channel });

const groups = groupByUkDay(
  [
    visit("late", "2026-11-10T16:00:00Z"),
    visit("early", "2026-11-10T09:00:00Z", "clinic"),
    visit("tomorrow", "2026-11-11T09:30:00Z"),
    visit("far", "2026-11-17T09:30:00Z"), // 8th day: outside the window
    visit("bad", "not a date"),
  ],
  { now },
);

assert(groups.length === WEEK_DAYS, "There is one group for each day in the window, even empty ones");
assert(groups[0].label === "Today" && groups[1].label === "Tomorrow", "The first two days are named Today and Tomorrow");
assert(groups[2].label === "Thu 12 Nov", "Later days carry the weekday and date");
assert(groups[0].items.map((i) => i.id).join() === "early,late", "A day's visits come earliest first");
assert(groups[1].items.length === 1 && groups[2].items.length === 0, "A quiet day is an empty group");
assert(!groups.some((g) => g.items.some((i) => i.id === "far" || i.id === "bad")), "Visits beyond the window, and unreadable times, are left out");

const videoOnly = groupByUkDay([visit("v", "2026-11-10T09:00:00Z"), visit("c", "2026-11-10T10:00:00Z", "clinic")], { now, channel: "video" });
assert(videoOnly[0].items.length === 1 && videoOnly[0].items[0].id === "v", "The video filter keeps only video consults");

// A late-evening UTC time on the clocks-forward side is the next UK day.
const summer = groupByUkDay([visit("night", "2026-06-10T23:30:00Z")], { now: new Date("2026-06-10T08:00:00Z") });
assert(summer[1].items.length === 1, "23:30 UTC in summer is 00:30 UK time, so it belongs to the next day");

// The screen offers the view and passes no scope, so the server returns every upcoming visit.
const screen = readFileSync(join(__dirname, "../app/(clinician)/schedule.tsx"), "utf8");
assert(screen.includes("groupByUkDay"), "The schedule screen uses the grouping");
assert(screen.includes("Next 7 days"), "The schedule screen offers a next-7-days view");

console.log("\n🎉 ALL WEEK SCHEDULE TESTS PASSED!\n");
