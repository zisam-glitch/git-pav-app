import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { type OrderStatus, transitionOrderStatus } from "@/lib/order-state-machine";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { status, reason, trackingNumber, trackingUrl } = body;

    if (!status) {
      return NextResponse.json({ error: "Target status is required" }, { status: 400, headers: CORS_HEADERS });
    }

    // Setting the status alone would say "refunded" with no money returned.
    if (status === "refunded") {
      return NextResponse.json(
        { error: "Use the Refund action, so the customer is refunded through Stripe" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const result = await transitionOrderStatus({
      orderId: id,
      toStatus: status as OrderStatus,
      reason,
      trackingNumber,
      trackingUrl,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400, headers: CORS_HEADERS });
    }

    return NextResponse.json(result.order, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/admin/orders/[id]/status]", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
