import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { query } from "@/lib/db/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const orders = await query(
      `
      SELECT o.*,
        u.email as user_email,
        u.name as user_name,
        u.phone as user_phone,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'name', p.name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price
        )) FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = o.id) as items,
        (SELECT json_agg(json_build_object(
          'id', os.id,
          'discount_id', os.discount_id,
          'amount_off', os.amount_off
        )) FROM order_discounts os WHERE os.order_id = o.id) as discounts,
        (SELECT json_build_object(
          'id', os.id,
          'shipping_method_id', os.shipping_method_id,
          'tracking_number', os.tracking_number,
          'tracking_url', os.tracking_url,
          'shipped_at', os.shipped_at,
          'delivered_at', os.delivered_at
        )) FROM order_shipping os WHERE os.order_id = o.id) as shipping,
        (SELECT json_agg(json_build_object(
          'id', p.id,
          'stripe_payment_intent_id', p.stripe_payment_intent_id,
          'amount', p.amount,
          'status', p.status,
          'created_at', p.created_at
        )) FROM payments p WHERE p.order_id = o.id) as payments
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `,
      [id],
    );

    if (!orders[0]) {
      return NextResponse.json({ error: "Order not found" }, { status: 404, headers: CORS_HEADERS });
    }

    return NextResponse.json(orders[0], { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[GET /api/v1/admin/orders/:id]", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "status",
      "customer_email",
      "customer_phone",
      "shipping_address",
      "billing_address",
      "notes",
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "shipping_address" || field === "billing_address") {
          values.push(JSON.stringify(body[field]));
        } else {
          values.push(body[field]);
        }
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400, headers: CORS_HEADERS });
    }

    // Get old values for audit log
    const oldRecord = await query("SELECT * FROM orders WHERE id = $1", [id]);
    if (!oldRecord[0]) {
      return NextResponse.json({ error: "Order not found" }, { status: 404, headers: CORS_HEADERS });
    }

    // Setting the status alone would say "refunded" with no money returned.
    if (body.status === "refunded" && oldRecord[0].status !== "refunded") {
      return NextResponse.json(
        { error: "Use the Refund action, so the customer is refunded through Stripe" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    values.push(new Date().toISOString());
    updates.push(`updated_at = $${values.length}`);

    values.push(id);
    const sql = `UPDATE orders SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const updated = await query(sql, values);

    // Log the action if status changed
    if (body.status && body.status !== oldRecord[0].status) {
      await query(
        `INSERT INTO audit_logs (action, entity_type, entity_id, old_values, new_values, user_id, ip_address, user_agent)
         VALUES ('order_status_changed', 'order', $1, $2, $3, $4, $5, $6)`,
        [
          id,
          JSON.stringify({ status: oldRecord[0].status }),
          JSON.stringify({ status: body.status }),
          null,
          request.headers.get("x-forwarded-for"),
          request.headers.get("user-agent"),
        ],
      );
    }

    return NextResponse.json(updated[0], { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[PATCH /api/v1/admin/orders/:id]", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
