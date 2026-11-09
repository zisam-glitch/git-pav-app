/**
 * Booking confirmation screen (B4, B5).
 *
 * It must ask about the appointment that was just paid for, never "the first
 * one in the list" (the list is sorted latest first, so that is the patient's
 * furthest-away visit), and stop asking once it is confirmed.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { watchConfirmation, type ConfirmationOutcome } from "../features/booking/confirmation-watch";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function watch(id: string | undefined, answers: Array<string | null | Error>, timeoutMs = 200) {
  const asked: string[] = [];
  let outcome: ConfirmationOutcome | null = null;
  const stop = watchConfirmation(
    id,
    async (askedId) => {
      asked.push(askedId);
      const next = answers.length > 1 ? answers.shift()! : answers[0];
      if (next instanceof Error) throw next;
      return next === null ? null : { status: next };
    },
    (o) => {
      outcome = o;
    },
    { intervalMs: 10, timeoutMs }
  );
  return { asked, stop, outcome: () => outcome };
}

async function run() {
  console.log("\n✅ RUNNING BOOKING CONFIRMATION WATCH TESTS (B4, B5)...\n");

  const confirmedLater = watch("appt-paid", ["draft_hold", "draft_hold", "confirmed"]);
  await wait(80);
  assert(confirmedLater.outcome() === "confirmed", "Reports confirmed once the server says so");
  assert(confirmedLater.asked.every((id) => id === "appt-paid"), "Only ever asks about the paid appointment");
  const askedWhenConfirmed = confirmedLater.asked.length;
  await wait(60);
  assert(confirmedLater.asked.length === askedWhenConfirmed, "Stops asking once confirmed");

  const flaky = watch("appt-paid", [new Error("offline"), "confirmed"]);
  await wait(60);
  assert(flaky.outcome() === "confirmed", "A failed check is retried, not treated as the end");

  const never = watch("appt-paid", ["draft_hold"], 50);
  await wait(100);
  assert(never.outcome() === "timeout", "Gives up with a timeout when it never confirms");
  const askedAtTimeout = never.asked.length;
  await wait(40);
  assert(never.asked.length === askedAtTimeout, "Stops asking after the timeout");

  const noId = watch(undefined, ["confirmed"]);
  assert(noId.outcome() === "missing", "Without an appointment id it says so straight away");
  assert(noId.asked.length === 0, "Without an appointment id it asks the server nothing");

  const leaving = watch("appt-paid", ["draft_hold"]);
  leaving.stop();
  const askedAtStop = leaving.asked.length;
  await wait(50);
  assert(leaving.asked.length === askedAtStop && leaving.outcome() === null, "Leaving the screen stops the checks");

  const screen = readFileSync(join(__dirname, "../app/(patient)/booking/confirmed.tsx"), "utf8");
  assert(!screen.includes("fetchMyAppointments"), "The screen no longer loads the whole appointment list");
  assert(!/appointments\[0\]/.test(screen), "The screen never guesses with the first appointment in a list");
  assert(screen.includes("watchConfirmation("), "The screen uses the single-appointment watcher");

  console.log("\n🎉 ALL BOOKING CONFIRMATION WATCH TESTS PASSED!\n");
}

run().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
