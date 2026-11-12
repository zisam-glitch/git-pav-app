// A shipped app never confirms a booking, or carries on with a van request, without taking payment (checklist D6).
import { readFileSync } from "fs";
import { join } from "path";
import { runBookingPayment, type PaymentDeps, type PreparedPayment, type BookingInput } from "../features/booking/booking-payment";

let failed = 0;
const check = (name: string, ok: boolean) => {
  if (ok) console.log(`✓ PASSED: ${name}`);
  else {
    failed++;
    console.error(`✗ FAILED: ${name}`);
  }
};

const mockIntent: PreparedPayment = {
  clientSecret: null,
  paymentIntentId: "pi_mock_1",
  publishableKey: "",
  amountPence: 2500,
  customerId: null,
  customerEphemeralKeySecret: null,
  isMock: true,
};
const input = {
  service: { id: "check-up" },
  slot: { id: "s1", startTimeUtc: "2026-11-20T10:00:00Z", endTimeUtc: "2026-11-20T10:30:00Z", clinicianId: "d1", clinicId: "c1" },
  channel: "clinic",
  clinic: { id: "c1" },
  clinician: { id: "d1" },
  attemptKey: "key-1",
  method: "card",
} as unknown as BookingInput;

function deps(allow: boolean | undefined) {
  const calls: string[] = [];
  const d: PaymentDeps = {
    createAppointment: async () => ({ id: "a1" }),
    createPaymentIntent: async () => mockIntent,
    confirmAppointment: async () => {
      calls.push("confirm");
      return {};
    },
    initStripe: async () => {},
    payWithWallet: async () => ({}),
    payWithSheet: async () => ({}),
    onPaid: () => calls.push("paid"),
    report: () => {},
    ...(allow === undefined ? {} : { allowMockPayment: allow }),
  };
  return { d, calls };
}

async function main() {
  const dev = deps(true);
  check("a development build may confirm past a mock Stripe server", (await runBookingPayment(dev.d, input)).kind === "confirmed" && dev.calls.includes("confirm"));

  const shipped = deps(false);
  const out = await runBookingPayment(shipped.d, input);
  check("a build that does not allow it fails plainly and confirms nothing", out.kind === "failed" && shipped.calls.length === 0);

  const forgot = deps(undefined);
  const out2 = await runBookingPayment(forgot.d, input);
  check("leaving the setting out means no: it is deny by default", out2.kind === "failed" && forgot.calls.length === 0);

  const screen = readFileSync(join(__dirname, "../app/(patient)/booking/summary.tsx"), "utf8");
  check("the booking screen allows it only in a development build", screen.includes("allowMockPayment: __DEV__"));

  const van = readFileSync(join(__dirname, "../app/(patient)/van/confirm.tsx"), "utf8");
  check("the van screen stops on a mock-payment server outside development", /isMockPayment && !__DEV__\) \{\s*throw/.test(van));

  if (failed > 0) process.exit(1);
  console.log("MOCK PAYMENT GATE TESTS PASSED");
}
void main();
