import { isConnectivityError } from "../../lib/error-scrub";

/** What the payment sheet reports: a code, and a message written for developers. */
export interface SheetError {
  code?: string;
  message?: string;
}

const GENERIC = "Your payment didn't go through. Please check your card details or try another card.";

/**
 * Plain wording for a failed payment. The provider's own message is for
 * developers ("Your card was declined with code 4000..."), so the patient sees
 * ours and the original goes to the error reporter.
 */
export function plainPaymentError(error: SheetError | undefined | null): string {
  switch (error?.code) {
    case "Timeout":
      return "That took too long. Please try again.";
    case "Failed":
    default:
      return GENERIC;
  }
}

/**
 * Plain wording for anything else that went wrong while booking: a lost
 * connection says so; our own server's messages are already written for
 * patients and are kept; anything else gets a general line.
 */
export function plainBookingError(error: unknown): string {
  if (isConnectivityError(error)) return "We couldn't reach the server. Check your connection and try again.";
  const message = error instanceof Error ? error.message : "";
  // Our server's wording is short and plain; a long or technical message is not ours.
  if (message && message.length <= 160 && !/^(TypeError|ReferenceError|SyntaxError)|undefined|\[object/.test(message)) {
    return message;
  }
  return "Something went wrong with your booking. Please try again.";
}
