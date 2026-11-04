import { NextResponse } from "next/server";

import { STAFF_PURPOSE, signToken } from "@/lib/auth/jwt";
import { pavApiUrl, storeAppSession } from "@/lib/pav-api.server";
import { rateLimit } from "@/lib/rate-limit";

import crypto from "node:crypto";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SESSION_SECONDS = 60 * 60 * 12;

async function startDashboardSession(claims: { email: string; sub?: string }) {
  const token = await signToken({ ...claims, role: "admin", purpose: STAFF_PURPOSE }, SESSION_SECONDS);
  const response = NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_SECONDS,
    path: "/",
  });
  return response;
}

const refuse = (status: number, error: string) => NextResponse.json({ error }, { status, headers: CORS_HEADERS });

/**
 * Staff sign in with their own Pav Dental app account (role admin), so the
 * app's data is changed as them and audited. MFA codes are passed through.
 * Without PAV_API_URL, only a configured ADMIN_PASSWORD_HASH is accepted:
 * there is no built-in default password.
 */
export async function POST(request: Request) {
  const limited = await rateLimit(request, "login");
  if (limited) return limited;

  try {
    const { email, password, mfaCode } = (await request.json()) as {
      email?: string;
      password?: string;
      mfaCode?: string;
    };
    if (!email || !password) return refuse(400, "Email and password are required");

    const base = pavApiUrl();
    if (base) {
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(mfaCode ? { mfaCode } : {}) }),
        cache: "no-store",
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        mfaRequired?: boolean;
        accessToken?: string;
        refreshToken?: string;
        user?: { id: string; email: string; role: string };
      };
      if (res.status === 429) return refuse(429, "Too many attempts. Please wait and try again.");
      if (!res.ok)
        return refuse(401, body.error === "Invalid or expired MFA code" ? body.error : "Invalid email or password");
      if (body.mfaRequired) {
        return NextResponse.json({ mfaRequired: true }, { headers: CORS_HEADERS });
      }
      if (!body.accessToken || !body.refreshToken || !body.user)
        return refuse(502, "Sign-in failed. Please try again.");
      if (body.user.role !== "admin") return refuse(403, "This account doesn't have back-office access");

      await storeAppSession(body.accessToken, body.refreshToken);
      return startDashboardSession({ email: body.user.email, sub: body.user.id });
    }

    // Single-admin fallback for running the dashboard without the app.
    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedHash = process.env.ADMIN_PASSWORD_HASH;
    if (!expectedEmail || !expectedHash) {
      return refuse(503, "Sign-in isn't configured. Set PAV_API_URL (or ADMIN_EMAIL and ADMIN_PASSWORD_HASH).");
    }
    const given = crypto
      .createHash("sha256")
      .update(password + (process.env.ADMIN_SALT ?? ""))
      .digest();
    const expected = Buffer.from(expectedHash, "hex");
    const isValid =
      email === expectedEmail && expected.length === given.length && crypto.timingSafeEqual(given, expected);
    if (!isValid) return refuse(401, "Invalid email or password");
    return startDashboardSession({ email });
  } catch (error) {
    console.error("[POST /api/v1/admin/auth/login]", error instanceof Error ? error.message : "unknown error");
    return refuse(500, "Authentication failed");
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
