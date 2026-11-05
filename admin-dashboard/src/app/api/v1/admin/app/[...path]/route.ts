import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { pavApi } from "@/lib/pav-api.server";

// Passes the dashboard's opening hours, rota, erasure, team, dentist profile, inbox, referral voucher, app
// appointment, audit log, prescriptions register, consent and data access screens, and van service area and van shift screens through to
// the app backend's /api/admin endpoints, as the signed-in staff member. Only the
// routes below are forwarded; anything else is a 404.
const SEG = "[A-Za-z0-9_-]{1,64}";
const DATE = "\\d{4}-\\d{2}-\\d{2}";
const ALLOWED: Record<string, RegExp[]> = {
  GET: [
    /^overview$/,
    /^clinics$/,
    /^clinicians$/,
    new RegExp(`^clinicians/${SEG}/overrides$`),
    /^erasure-requests$/,
    /^vans$/,
    /^services$/,
    /^messages$/,
    /^users$/,
    /^operators$/,
    new RegExp(`^referral-vouchers/${SEG}$`),
    /^appointments$/,
    /^audit-logs$/,
    /^prescriptions$/,
    /^consents$/,
    /^sar-exports$/,
    /^van-shifts$/,
    /^attention$/,
  ],
  PATCH: [
    new RegExp(`^messages/${SEG}/read$`),
    new RegExp(`^clinicians/${SEG}/profile$`),
    new RegExp(`^services/${SEG}$`),
    new RegExp(`^clinics/${SEG}$`),
    new RegExp(`^vans/${SEG}$`),
    new RegExp(`^appointments/${SEG}/status$`),
  ],
  PUT: [
    new RegExp(`^clinics/${SEG}/hours$`),
    new RegExp(`^clinicians/${SEG}/rota$`),
    /^clinicians\/website-order$/,
    new RegExp(`^clinicians/${SEG}/overrides/${DATE}$`),
  ],
  POST: [
    /^clinics$/,
    new RegExp(`^clinics/${SEG}/closures$`),
    /^clinicians$/,
    /^operators$/,
    /^vans$/,
    new RegExp(`^vans/${SEG}/polygons$`),
    new RegExp(`^vans/${SEG}/assignments$`),
    new RegExp(`^vans/${SEG}/assignments/${SEG}/end$`),
    /^services$/,
    new RegExp(`^erasure-requests/${SEG}/complete$`),
    new RegExp(`^erasure-requests/${SEG}/reject$`),
    new RegExp(`^messages/${SEG}/reply$`),
    new RegExp(`^referral-vouchers/${SEG}/use$`),
  ],
  DELETE: [
    new RegExp(`^clinics/${SEG}/closures/${DATE}$`),
    new RegExp(`^clinicians/${SEG}/overrides/${DATE}$`),
    new RegExp(`^vans/${SEG}/polygons/${SEG}$`),
  ],
};

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: Request, { params }: Context) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const path = (await params).path.join("/");
  if (!ALLOWED[request.method]?.some((pattern) => pattern.test(path))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const query = new URL(request.url).search;
  const body = request.method === "GET" || request.method === "DELETE" ? undefined : await request.text();
  try {
    const res = await pavApi(`/api/admin/${path}${query}`, { method: request.method, body });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json().catch(() => ({ error: "Unexpected response from the app backend" }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`[${request.method} /api/v1/admin/app]`, error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "The app backend couldn't be reached" }, { status: 502 });
  }
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
