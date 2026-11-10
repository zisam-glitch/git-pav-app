/**
 * Patients never see a payment provider's raw error text (checklist E1).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { plainBookingError, plainPaymentError } from "../features/payment/payment-errors";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n💳 PLAIN PAYMENT ERRORS\n");

const raw = { code: "Failed", message: "Your card was declined. Decline code: insufficient_funds (pi_3Nx...)" };
assert(!plainPaymentError(raw).includes("pi_") && !plainPaymentError(raw).includes("Decline code"), "A declined card does not show the provider's text");
assert(plainPaymentError({ code: "Timeout" }).includes("too long"), "A timeout says it took too long");
assert(plainPaymentError(undefined).length > 10, "No error object still gives a plain line");

const offline = new TypeError("Network request failed");
assert(plainBookingError(offline).includes("Check your connection"), "A lost connection says so");
assert(plainBookingError(new Error("That time has just been taken. Please choose another.")) === "That time has just been taken. Please choose another.", "Our server's plain messages are kept");
assert(!plainBookingError(new Error("undefined is not a function")).includes("undefined"), "A technical message is replaced");
assert(plainBookingError("weird") === "Something went wrong with your booking. Please try again.", "A non-error gets the general line");

const summary = readFileSync(join(__dirname, "../app/(patient)/booking/summary.tsx"), "utf8");
assert(!/Alert\.alert\([^)]*\.message\)/.test(summary.replace(/outcome\.message/g, "")), "The booking screen never alerts with a provider message");
assert(!/err\?\.message \?\? "Could not process payment/.test(summary), "The booking screen does not alert with a raw caught message");
const payment = readFileSync(join(__dirname, "../features/booking/booking-payment.ts"), "utf8");
assert(payment.includes("deps.report(paid.error"), "The original error still goes to the error reporter");
assert(summary.includes("report: reportCaughtError"), "The booking screen hands the real reporter to the payment code");

console.log("\n🎉 ALL PLAIN PAYMENT ERROR TESTS PASSED!\n");
