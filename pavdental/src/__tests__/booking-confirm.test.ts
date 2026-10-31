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
  global.fetch = (async (url: string, init: RequestInit = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("bad-appt")) {
      return new Response(JSON.stringify({ error: "Payment does not belong to this appointment" }), { status: 409 });
    }
    return new Response(JSON.stringify({ id: "appt-1", appointmentStatus: "confirmed", depositPaidPence: 2000 }), {
      status: 200,
    });
  }) as typeof fetch;

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
  const summary = readFileSync(join(__dirname, "../app/(patient)/booking/summary.tsx"), "utf8");
  const mockBranch = summary.indexOf("if (intent.isMock)");
  const sheetInit = summary.indexOf("await initPaymentSheet(");
  assert(mockBranch !== -1, "summary screen checks the server's isMock flag");
  assert(mockBranch < sheetInit, "the mock check happens before the PaymentSheet is opened");
  assert(
    /if \(intent\.isMock\) \{[\s\S]*?confirmAppointment\(appt\.id, intent\.paymentIntentId\)[\s\S]*?return;/.test(summary),
    "mock mode confirms on the server and skips the PaymentSheet"
  );
  const present = summary.indexOf("await presentPaymentSheet()");
  const afterSheet = summary.indexOf("confirmAppointment(appt.id, intent.paymentIntentId)", present);
  assert(present !== -1 && afterSheet > present, "after a real payment the server is asked to confirm");

  console.log("\n🎉 ALL CLINIC BOOKING CONFIRMATION TESTS PASSED (0 FAILURES)!\n");
}

run().catch((err) => {
  console.error("❌ FAILED:", err);
  process.exit(1);
});
