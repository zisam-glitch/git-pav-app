import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { query } from "@/lib/db/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(request: Request) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get("variantId");
    const reason = searchParams.get("reason");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIdx = 0;

    if (variantId) {
      paramIdx++;
      whereClause += ` AND il.variant_id = $${paramIdx}`;
      params.push(variantId);
    }

    if (reason) {
      paramIdx++;
      whereClause += ` AND il.reason = $${paramIdx}`;
      params.push(reason);
    }

    const logs = await query(
      `
      SELECT 
        il.*,
        pv.sku,
        pv.attributes,
        p.name as product_name
      FROM inventory_logs il
      JOIN product_variants pv ON il.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      ${whereClause}
      ORDER BY il.created_at DESC
      LIMIT $${paramIdx + 1} OFFSET $${paramIdx + 2}
    `,
      [...params, limit, offset],
    );

    const [countResult] = await query<any>(
      `
      SELECT COUNT(*) as total
      FROM inventory_logs il
      ${whereClause}
    `,
      params,
    );

    return NextResponse.json(
      {
        logs,
        total: parseInt(countResult.total, 10),
        limit,
        offset,
      },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error("[GET /api/v1/admin/inventory/logs]", error);
    return NextResponse.json({ error: "Failed to fetch inventory logs" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
