import type Stripe from "stripe";

import type { PlacedOrder } from "./checkout-order.ts";
import { stripeLineItems } from "./pricing.ts";

// Stripe's minimum is 30 minutes. An unpaid order holds its discount use until then.
const CHECKOUT_EXPIRES_SECONDS = 60 * 60;

/** Everything sent to Stripe for a placed order, shared by the route and the test-mode check. */
export function checkoutSessionParams(options: {
  placed: PlacedOrder;
  customerEmail: string;
  cartSessionId: string;
  storefrontUrl: string;
  orderLink: string;
}): Stripe.Checkout.SessionCreateParams {
  const { placed, customerEmail, cartSessionId, storefrontUrl, orderLink } = options;
  const metadata = { orderId: placed.orderId, cartSessionId };
  return {
    payment_method_types: ["card"],
    line_items: stripeLineItems(placed.lines, placed.totals, placed.shippingName),
    mode: "payment",
    customer_email: customerEmail,
    success_url: `${storefrontUrl}/order/${placed.orderId}?access=${orderLink}`,
    cancel_url: `${storefrontUrl}/checkout`,
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRES_SECONDS,
    metadata,
    // A failed card is reported on the payment intent, not the session. A free order has none.
    ...(placed.totals.totalPence > 0 ? { payment_intent_data: { metadata } } : {}),
  };
}
