import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { query, withTransaction } from "@/lib/db/client";
import { processRefund } from "@/lib/shop/refunds";
import { getStripe } from "@/lib/shop/stripe";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Payments aren't configured" }, { status: 503, headers: CORS_HEADERS });
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json().catch(() => ({}));

    const result = await processRefund(
      {
        query,
        transaction: withTransaction,
        createStripeRefund: async ({ paymentIntent, amountPence, idempotencyKey }) => {
          const refund = await stripe.refunds.create(
            { payment_intent: paymentIntent, amount: amountPence, reason: "requested_by_customer" },
            { idempotencyKey },
          );
          return refund.id;
        },
      },
      {
        orderId: id,
        refundAmount: body.refundAmount,
        reason: body.reason,
        restockItems: body.restockItems,
        ipAddress: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent"),
      },
    );

    return NextResponse.json(result.body, { status: result.status, headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/admin/orders/[id]/refund]", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
