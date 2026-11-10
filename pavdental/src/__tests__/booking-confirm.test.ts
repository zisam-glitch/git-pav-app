/**
 * Clinic booking confirmation (plan M1).
 *
 * In local development the server runs Stripe in mock mode and says so with
 * `isMock: true`. The summary screen must confirm the booking on the server
 * instead of handing the mock secret to the Stripe PaymentSheet (which can't
 * open it). After a real PaymentSheet payment it also asks the server to
 * confirm, so a slow or missing webhook doesn't leave the patient waiting.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { confirmAppointment } from "../features/booking/booking-api";
import { useAuthStore } from "../features/auth/auth-store";
import { API_URL } from "../features/auth/auth-api";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

async function run() {
  console.log("\n💳 RUNNING CLINIC BOOKING CONFIRMATION TESTS (M1)...\n");

  // ─── confirmAppointment sends the right request ────────────────────────────
  useAuthStore.getState().setAuth("test-access-token", {
    id: "usr_1",
    sub: "usr_1",
    email: "patient@example.test",
    role: "patient",
    emailVerified: true,
    phoneVerified: true,
    isMfaEnabled: false,
    mfaEnabled: false,
  });

  const calls: { url: string; init: RequestInit }[] = [];
  const realFetch = global.fetch;
  (globalThis as { fetch: unknown }).fetch = async (url: string, init: RequestInit = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("bad-appt")) {
      return new Response(JSON.stringify({ error: "Payment does not belong to this appointment" }), { status: 409 });
    }
    return new Response(JSON.stringify({ id: "appt-1", appointmentStatus: "confirmed", depositPaidPence: 2000 }), {
      status: 200,
    });
  };

  try {
    const result = await confirmAppointment("appt-1", "pi_mock_appt1");
    const call = calls[0];
    assert(call?.url === `${API_URL}/api/booking/appointments/appt-1/confirm`, "calls the appointment's confirm endpoint");
    assert(call?.init.method === "PATCH", "uses PATCH");
    assert(
      JSON.parse(String(call?.init.body)).stripePaymentId === "pi_mock_appt1",
      "sends the payment intent id so the server can check it belongs to this booking"
    );
    assert(result.appointmentStatus === "confirmed", "returns the confirmed status");

    let message = "";
    await confirmAppointment("bad-appt", "pi_other").catch((err: Error) => (message = err.message));
    assert(message === "Payment does not belong to this appointment", "surfaces the server's error message");
  } finally {
    global.fetch = realFetch;
  }

  // ─── The summary screen uses it in the right places ────────────────────────
  // The steps live in booking-payment.ts (tested for behaviour in
  // src/__component__/booking-payment.test.ts); the Stripe sheets in use-stripe-pay.ts.
  const summary = readFileSync(join(__dirname, "../app/(patient)/booking/summary.tsx"), "utf8");
  const payment = readFileSync(join(__dirname, "../features/booking/booking-payment.ts"), "utf8");
  const stripePay = readFileSync(join(__dirname, "../features/booking/use-stripe-pay.ts"), "utf8");
  const mockBranch = payment.indexOf("if (intent.isMock)");
  const sheetStep = payment.indexOf("deps.payWithSheet(intent)");
  assert(mockBranch !== -1, "payment code checks the server's isMock flag");
  assert(mockBranch < sheetStep, "the mock check happens before the PaymentSheet is opened");
  assert(
    /if \(intent\.isMock\) \{[\s\S]*?deps\.confirmAppointment\(appointment\.id, intent\.paymentIntentId\)[\s\S]*?return \{ kind: "confirmed"/.test(payment),
    "mock mode confirms on the server and skips the PaymentSheet"
  );
  const afterSheet = payment.indexOf("deps.confirmAppointment(appointment.id, intent.paymentIntentId)", sheetStep);
  assert(sheetStep !== -1 && afterSheet > sheetStep, "after a real payment the server is asked to confirm");

  // Each button pays the way it says, and the patient confirms the payment
  // themselves: the card button opens a card-only sheet with a "Pay £x"
  // button, and the wallet button opens Apple Pay / Google Pay.
  assert(/handlePayDeposit\("card"\)/.test(summary) && /handlePayDeposit\("wallet"\)/.test(summary), "the card and wallet buttons take different payment routes");
  assert(/paymentMethodOrder: \["card"\]/.test(stripePay) && /primaryButtonLabel: `Pay \$\{formatGbp\(intent\.amountPence\)\}`/.test(stripePay), "the card sheet shows cards and a Pay button with the amount");
  assert(!/applePay: \{ merchantCountryCode: "GB" \}/.test(stripePay.slice(stripePay.indexOf("payWithSheet"))), "the card sheet doesn't offer the wallet as well");
  assert(/confirmPlatformPayPayment\(intent\.clientSecret/.test(stripePay), "the wallet button uses the phone's own wallet sheet");
  assert(/\{walletReady && \(/.test(summary), "the wallet button only shows where the wallet can pay");

  console.log("\n🎉 ALL CLINIC BOOKING CONFIRMATION TESTS PASSED (0 FAILURES)!\n");
}

run().catch((err) => {
  console.error("❌ FAILED:", err);
  process.exit(1);
});
