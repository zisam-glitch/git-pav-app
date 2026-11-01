import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { pavApi } from "@/lib/pav-api.server";

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
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));

    const queryParams = new URLSearchParams();
    queryParams.set("role", "patient");
    queryParams.set("page", String(page));
    queryParams.set("limit", String(limit));
    if (search) queryParams.set("search", search);

    const res = await pavApi(`/api/admin/users?${queryParams.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error || "Failed to fetch patients" },
        { status: res.status, headers: CORS_HEADERS },
      );
    }

    const json = (await res.json()) as { users: any[]; total: number; page: number; limit: number };
    const patients = (json.users || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      // Town and postcode only; the full address stays in the app record.
      address: u.details,
      created_at: u.createdAt,
    }));

    return NextResponse.json({ data: patients, total: json.total, page: json.page, limit: json.limit }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[GET /api/v1/admin/patients]", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
