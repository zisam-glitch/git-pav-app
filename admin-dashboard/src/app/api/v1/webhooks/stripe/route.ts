import { NextResponse } from "next/server";

import Stripe from "stripe";

import { withTransaction } from "@/lib/db/client";
import { handleStripeEvent, verifyStripeEvent } from "@/lib/shop/stripe-events";

export async function POST(req: Request) {
  const body = await req.text();
  const verified = verifyStripeEvent(
    body,
    req.headers.get("stripe-signature"),
    process.env.STRIPE_WEBHOOK_SECRET,
    Stripe.webhooks,
  );
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: verified.status });
  }

  try {
    const { duplicate } = await withTransaction((tx) => handleStripeEvent(tx, verified.event));
    return NextResponse.json({ received: true, duplicate });
  } catch (error) {
    // A 500 makes Stripe retry; the transaction rolled back, so the retry starts clean.
    console.error("[Stripe webhook] Processing failed", verified.event.id, error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
