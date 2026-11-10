import { plainBookingError, plainPaymentError, type SheetError } from "../payment/payment-errors";

/**
 * The booking payment, as a plain function with its dependencies handed in, so
 * every path (paid, cancelled, declined, a lost connection) can be tested
 * without a screen or Stripe. The booking screen only calls this and shows the
 * outcome.
 *
 * Order of events: create the booking (a hold), ask the server to prepare the
 * payment (the amount is the server's), take payment in Stripe's sheet or the
 * phone's wallet, then ask the server to confirm. The Stripe webhook confirms
 * the same way, so a failed confirm call after payment is not an error.
 */

export type PaymentMethod = "wallet" | "card";

export interface BookingInput {
  service?: { id: string } | null;
  slot?: { id: string; startTimeUtc?: string; endTimeUtc?: string; clinicianId?: string; clinicId?: string } | null;
  channel: string | null;
  clinic?: { id?: string } | null;
  clinician?: { id?: string } | null;
  dependantId?: string | null;
  /** A rewards voucher code, only when the patient chose to use it. */
  voucherCode?: string;
  /** One key per visit to the screen: a retry gets the same booking back. */
  attemptKey: string;
  method: PaymentMethod;
}

export interface PreparedPayment {
  clientSecret: string | null;
  paymentIntentId: string;
  publishableKey: string;
  amountPence: number;
  customerId: string | null;
  customerEphemeralKeySecret: string | null;
  isMock: boolean;
}

export interface PayResult {
  error?: SheetError;
  /** Where a sheet error happened: setting the sheet up, or showing it. */
  stage?: "setup" | "present";
}

export interface PaymentDeps {
  createAppointment(data: Record<string, unknown>, attemptKey: string): Promise<{ id: string }>;
  createPaymentIntent(appointmentId: string, voucherCode?: string): Promise<PreparedPayment>;
  confirmAppointment(appointmentId: string, paymentIntentId: string): Promise<unknown>;
  /** Start Stripe with the key the server names. */
  initStripe(publishableKey: string): Promise<unknown>;
  payWithWallet(intent: PreparedPayment): Promise<PayResult>;
  payWithSheet(intent: PreparedPayment): Promise<PayResult>;
  /** Called the moment money has been collected, before the confirm call. */
  onPaid(): void;
  /** Called with errors worth reporting (scrubbed by the reporter). */
  report(error: unknown, source: string): void;
}

export type PaymentOutcome =
  | { kind: "confirmed"; appointmentId: string }
  /** The patient closed the sheet. Nothing to say. */
  | { kind: "cancelled" }
  /** Missing service or time: send them back to choose. */
  | { kind: "incomplete"; redirect: "service-catalog" | "slot-picker"; title: string; message: string }
  | { kind: "failed"; title: string; message: string };

export async function runBookingPayment(deps: PaymentDeps, input: BookingInput): Promise<PaymentOutcome> {
  const { service, slot } = input;
  if (!service || !slot) {
    return {
      kind: "incomplete",
      redirect: "service-catalog",
      title: "Incomplete Booking",
      message: "Please select a service and time slot before continuing.",
    };
  }
  if (!slot.startTimeUtc || !slot.endTimeUtc) {
    return {
      kind: "incomplete",
      redirect: "slot-picker",
      title: "Invalid Slot",
      message: "Selected slot is missing timing details. Please choose another slot.",
    };
  }

  try {
    // 1. The booking, held while they pay.
    const appointment = await deps.createAppointment(
      {
        serviceId: service.id,
        // Clinic visits and video consults are booked here; van visits use the van flow.
        channel: input.channel ?? "clinic",
        // "Any practitioner" leaves these empty, which the API rejects: send
        // nothing so it picks the dentist itself.
        clinicianId: input.clinician?.id || slot.clinicianId || undefined,
        clinicId: input.channel === "video" ? undefined : input.clinic?.id || slot.clinicId || undefined,
        startTimeUtc: slot.startTimeUtc,
        endTimeUtc: slot.endTimeUtc,
        slotId: slot.id,
        dependantId: input.dependantId ?? undefined,
      },
      input.attemptKey
    );

    // 2. The payment, prepared by the server: the amount is its decision.
    const intent = await deps.createPaymentIntent(appointment.id, input.voucherCode);

    // Local development runs Stripe in mock mode: no card to take, the server
    // confirms the mock payment directly (the server refuses mock keys when deployed).
    if (intent.isMock) {
      await deps.confirmAppointment(appointment.id, intent.paymentIntentId);
      deps.onPaid();
      return { kind: "confirmed", appointmentId: appointment.id };
    }

    if (!intent.clientSecret) throw new Error("Payment setup failed - no client secret received");
    if (intent.publishableKey) await deps.initStripe(intent.publishableKey);

    // 3. Take the payment.
    const paid = input.method === "wallet" ? await deps.payWithWallet(intent) : await deps.payWithSheet(intent);
    if (paid.error) {
      // Closing the sheet is a choice, not a failure.
      if (paid.error.code === "Canceled" && paid.stage !== "setup") return { kind: "cancelled" };
      deps.report(paid.error, paid.stage === "setup" ? "payment sheet setup failed" : "payment failed");
      return { kind: "failed", title: "Payment failed", message: plainPaymentError(paid.error) };
    }

    // 4. Money is collected. Ask the server to confirm; the webhook will too,
    // so if this call fails the confirmed screen still waits for it.
    deps.onPaid();
    await deps.confirmAppointment(appointment.id, intent.paymentIntentId).catch(() => {});
    return { kind: "confirmed", appointmentId: appointment.id };
  } catch (err) {
    deps.report(err, "booking payment failed");
    return { kind: "failed", title: "Something went wrong", message: plainBookingError(err) };
  }
}
