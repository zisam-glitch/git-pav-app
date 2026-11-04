import { NextResponse } from "next/server";

import { query } from "@/lib/db/client";
import { rateLimit } from "@/lib/rate-limit";
import { canViewOrder } from "@/lib/shop/order-access";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  // Personal details: never kept by a browser or CDN.
  "Cache-Control": "no-store",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The same reply for "doesn't exist" and "not yours", so ids can't be probed.
const notFound = () => NextResponse.json({ error: "Order not found" }, { status: 404, headers: CORS_HEADERS });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const limited = await rateLimit(request, "orderView");
  if (limited) return limited;

  try {
    const { id } = await Promise.resolve(params);
    if (!UUID.test(id)) return notFound();

    const [order] = await query<any>(
      `
      SELECT
        o.id,
        o.created_at,
        o.status,
        o.customer_email,
        o.shipping_address,
        o.subtotal,
        o.shipping_cost,
        o.discount_amount,
        o.tax_amount,
        o.total,
        (
          SELECT json_agg(json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'name', p.name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'image', (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1),
            'variantSku', pv.sku
          ))
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          LEFT JOIN product_variants pv ON oi.variant_id = pv.id
          WHERE oi.order_id = o.id
        ) as items,
        (
          SELECT json_build_object(
            'trackingNumber', os.tracking_number,
            'trackingUrl', os.tracking_url,
            'shippedAt', os.shipped_at
          )
          FROM order_shipping os
          WHERE os.order_id = o.id
          LIMIT 1
        ) as shipping
      FROM orders o
      WHERE o.id = $1
    `,
      [id],
    );
    if (!order) return notFound();

    if (!(await canViewOrder(id, new URL(request.url).searchParams.get("access")))) return notFound();

    return NextResponse.json(order, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[GET /api/v1/orders/[id]]", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
