import { NextResponse } from "next/server";

import { verifyShopperToken } from "@/lib/auth/jwt";
import { withTransaction } from "@/lib/db/client";
import { abandonOrder, CheckoutRejected, parseCheckoutBody, placeOrder } from "@/lib/shop/checkout-order";
import { stripeLineItems } from "@/lib/shop/pricing";
import { getStripe } from "@/lib/shop/stripe";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Stripe's minimum is 30 minutes. An unpaid order holds its discount use until then.
const CHECKOUT_EXPIRES_SECONDS = 60 * 60;

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  let rawToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!rawToken) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/(?:^|;\s*)user_token=([^;]+)/);
    if (match) rawToken = decodeURIComponent(match[1]);
  }

  if (!rawToken) return null;

  try {
    const payload = await verifyShopperToken(rawToken);
    return payload?.userId ? String(payload.userId) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payments aren't available right now. You haven't been charged." },
        { status: 503, headers: CORS_HEADERS },
      );
    }

    const input = parseCheckoutBody(await request.json());
    const userId = await getUserIdFromRequest(request);
    const placed = await withTransaction((tx) => placeOrder(tx, input, userId));

    const storefrontUrl = process.env.WEBSITE_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080";
    const metadata = { orderId: placed.orderId, userId: userId || "", cartSessionId: input.cartSessionId };

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: stripeLineItems(placed.lines, placed.totals, placed.shippingName),
        mode: "payment",
        customer_email: input.customerEmail,
        success_url: `${storefrontUrl}/order/${placed.orderId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${storefrontUrl}/checkout`,
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRES_SECONDS,
        metadata,
        // A failed card is reported on the payment intent, not the session.
        ...(placed.totals.totalPence > 0 ? { payment_intent_data: { metadata } } : {}),
      });
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
