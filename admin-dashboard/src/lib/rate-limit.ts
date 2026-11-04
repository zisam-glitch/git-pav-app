import { NextResponse } from "next/server";

import { query } from "@/lib/db/client";
import { deleteExpiredRateLimits, hitRateLimit, rateLimitKey } from "@/lib/rate-limit-core";

const FIFTEEN_MINUTES = 15 * 60;
const ONE_HOUR = 60 * 60;

export const RATE_LIMITS = {
  login: { limit: 20, windowSeconds: FIFTEEN_MINUTES },
  checkout: { limit: 30, windowSeconds: FIFTEEN_MINUTES },
  discountCheck: { limit: 30, windowSeconds: FIFTEEN_MINUTES },
  orderView: { limit: 120, windowSeconds: FIFTEEN_MINUTES },
  publicForm: { limit: 10, windowSeconds: ONE_HOUR },
} as const;

/** Vercel sets x-real-ip itself, so a caller can't choose their own bucket by sending it. */
function clientIp(request: Request): string {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
}

/**
 * Returns a 429 response when the caller is over the limit, otherwise null. CORS
 * headers come from src/proxy.ts. If the counter can't be reached the request is
 * allowed: losing the shop to a counter fault is worse than a short gap in limits.
 */
export async function rateLimit(
  request: Request,
  name: keyof typeof RATE_LIMITS,
  identifier: string = clientIp(request),
): Promise<NextResponse | null> {
  const { limit, windowSeconds } = RATE_LIMITS[name];
  try {
    const result = await hitRateLimit(query, rateLimitKey(name, identifier), limit, windowSeconds);
    // Occasional tidy-up: there's no background job on serverless.
    if (Math.random() < 0.01) await deleteExpiredRateLimits(query);
    if (result.allowed) return null;
    return NextResponse.json(
      { error: "Too many attempts. Please wait a while and try again." },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
    );
  } catch (error) {
    console.error("[rate limit] Counter unavailable", error instanceof Error ? error.name : "unknown error");
    return null;
  }
}
