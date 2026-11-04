import { NextResponse } from "next/server";

import { withTransaction } from "@/lib/db/client";
import { rateLimit } from "@/lib/rate-limit";
import { abandonOrder, CheckoutRejected, parseCheckoutBody, placeOrder } from "@/lib/shop/checkout-order";
import { checkoutSessionParams } from "@/lib/shop/checkout-session";
import { createOrderAccessToken } from "@/lib/shop/order-access";
import { getStripe } from "@/lib/shop/stripe";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: Request) {
  const limited = await rateLimit(request, "checkout");
  if (limited) return limited;

  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payments aren't available right now. You haven't been charged." },
        { status: 503, headers: CORS_HEADERS },
      );
    }

    const input = parseCheckoutBody(await request.json());
    const placed = await withTransaction((tx) => placeOrder(tx, input));

    const storefrontUrl = process.env.WEBSITE_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080";

    try {
      const orderLink = await createOrderAccessToken(placed.orderId);
      const session = await stripe.checkout.sessions.create(
        checkoutSessionParams({
          placed,
          customerEmail: input.customerEmail,
          cartSessionId: input.cartSessionId,
          storefrontUrl,
          orderLink,
        }),
      );
      if (!session.url) throw new Error("Stripe returned no checkout URL");

      await withTransaction((tx) =>
        tx("UPDATE orders SET stripe_session_id = $1 WHERE id = $2", [session.id, placed.orderId]),
      );

      return NextResponse.json(
        { orderId: placed.orderId, sessionId: session.id, url: session.url, total: placed.totals.totalPence / 100 },
        { status: 201, headers: CORS_HEADERS },
      );
    } catch (error) {
      // Never send the customer to a confirmation page for an order nobody can pay.
      console.error("[POST /api/v1/checkout] Payment page failed", error instanceof Error ? error.name : "unknown");
      await withTransaction((tx) => abandonOrder(tx, placed.orderId));
      return NextResponse.json(
        { error: "We couldn't open the payment page. You haven't been charged. Please try again." },
        { status: 502, headers: CORS_HEADERS },
      );
    }
  } catch (error) {
    if (error instanceof CheckoutRejected) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: CORS_HEADERS });
    }
    console.error("[POST /api/v1/checkout]", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Checkout failed" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
