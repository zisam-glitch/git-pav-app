import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { listShopperAccounts } from "@/lib/users.server";

/**
 * GET /api/v1/admin/users
 * Returns all users from the database
 */
export async function GET(request: Request) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const users = await listShopperAccounts();

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
