import { NextResponse } from "next/server";

import { query } from "@/lib/db/client";
import { rateLimit } from "@/lib/rate-limit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(request: Request) {
  const limited = await rateLimit(request, "discountCheck");
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Discount code is required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const discounts = await query<any>(
      `SELECT * FROM discounts 
       WHERE UPPER(code) = $1 AND is_active = true`,
      [code],
    );

    if (!discounts || discounts.length === 0) {
      return NextResponse.json({ valid: false, message: "Invalid discount code" }, { headers: CORS_HEADERS });
    }

    const discount = discounts[0];
    const now = new Date();

    if (discount.valid_from && new Date(discount.valid_from) > now) {
      return NextResponse.json(
        { valid: false, message: "This promotion has not started yet" },
        { headers: CORS_HEADERS },
      );
    }

    if (discount.valid_until && new Date(discount.valid_until) < now) {
      return NextResponse.json({ valid: false, message: "This promotion has expired" }, { headers: CORS_HEADERS });
    }

    if (discount.max_uses !== null && discount.used_count >= discount.max_uses) {
      return NextResponse.json(
        { valid: false, message: "This code has reached its usage limit" },
        { headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      {
        valid: true,
        discount: {
          id: discount.id,
          code: discount.code,
          type: discount.type,
          value: parseFloat(discount.value),
          min_order_value: discount.min_order_value ? parseFloat(discount.min_order_value) : null,
        },
      },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error("[GET /api/v1/discounts/validate]", error);
    return NextResponse.json(
      { valid: false, message: "Failed to validate discount code" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
