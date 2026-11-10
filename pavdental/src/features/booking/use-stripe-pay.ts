import { initStripe, useStripe, PlatformPay } from "@stripe/stripe-react-native";
import { colors } from "@/theme";
import { formatGbp } from "@/lib/money";
import type { PayResult, PreparedPayment } from "./booking-payment";

const MERCHANT_ID = "merchant.com.pavdental.app";

/**
 * The Stripe-specific part of paying: the phone's wallet sheet and the card
 * sheet. Everything about the booking itself lives in booking-payment.ts.
 */
export function useStripePay() {
  const { initPaymentSheet, presentPaymentSheet, confirmPlatformPayPayment } = useStripe();

  return {
    initStripe: (publishableKey: string) => initStripe({ publishableKey, merchantIdentifier: MERCHANT_ID }),

    /** Apple Pay or Google Pay, in the phone's own sheet. */
    async payWithWallet(intent: PreparedPayment): Promise<PayResult> {
      const { error } = await confirmPlatformPayPayment(intent.clientSecret as string, {
        applePay: {
          merchantCountryCode: "GB",
          currencyCode: "GBP",
          cartItems: [
            {
              label: "Pav Dental deposit",
              // The wallet sheet wants a plain decimal string, not "£85.00".
              amount: (intent.amountPence / 100).toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate,
            },
          ],
        },
        googlePay: {
          merchantCountryCode: "GB",
          currencyCode: "GBP",
          merchantName: "Pav Dental",
          testEnv: process.env.EXPO_PUBLIC_APP_ENV !== "production",
        },
      });
      return { error: error ?? undefined };
    },

    /** Stripe's card sheet: saved cards, or a new one. */
    async payWithSheet(intent: PreparedPayment): Promise<PayResult> {
      const { error: setupError } = await initPaymentSheet({
        merchantDisplayName: "Pav Dental",
        paymentIntentClientSecret: intent.clientSecret as string,
        // Saved cards appear in the sheet, which also offers to save a new one.
        ...(intent.customerId && intent.customerEphemeralKeySecret
          ? { customerId: intent.customerId, customerEphemeralKeySecret: intent.customerEphemeralKeySecret }
          : {}),
        returnURL: "pavdental://stripe-return",
        // No delayed payment methods (SEPA, BACS ...): the slot hold lasts 10 minutes (WH-1/MB-2).
        allowsDelayedPaymentMethods: false,
        // Cards only: the wallet has its own button.
        paymentMethodOrder: ["card"],
        primaryButtonLabel: `Pay ${formatGbp(intent.amountPence)}`,
        appearance: {
          colors: {
            primary: colors.ink as string,
            background: colors.systemBackground as string,
            componentBackground: colors.secondaryBackground as string,
            componentText: colors.label as string,
            placeholderText: colors.secondaryLabel as string,
          },
        },
      });
      if (setupError) return { error: setupError, stage: "setup" };

      // The patient enters or picks a card and taps Pay.
      const { error: presentError } = await presentPaymentSheet();
      return presentError ? { error: presentError, stage: "present" } : {};
    },
  };
}
