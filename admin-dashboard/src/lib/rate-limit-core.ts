import { createHash } from "node:crypto";

import type { QueryFn } from "@/lib/db/client";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/** Stored instead of the raw value, so the counters hold no IP address or email. */
export function rateLimitKey(name: string, identifier: string): string {
  const hash = createHash("sha256").update(identifier.trim().toLowerCase()).digest("hex");
  return `${name}:${hash}`;
}

/** Counts one request in a fixed window. One atomic statement, so concurrent requests can't slip through. */
export async function hitRateLimit(
  query: QueryFn,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const [row] = await query<{ count: number; retry_after: number }>(
    `INSERT INTO rate_limit_counters (key, count, window_ends_at)
     VALUES ($1, 1, now() + make_interval(secs => $2))
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limit_counters.window_ends_at <= now() THEN 1 ELSE rate_limit_counters.count + 1 END,
       window_ends_at = CASE
         WHEN rate_limit_counters.window_ends_at <= now() THEN now() + make_interval(secs => $2)
         ELSE rate_limit_counters.window_ends_at
       END
     RETURNING count, CEIL(EXTRACT(EPOCH FROM window_ends_at - now()))::int AS retry_after`,
    [key, windowSeconds],
  );
  return { allowed: row.count <= limit, retryAfterSeconds: Math.max(1, row.retry_after) };
}

export async function deleteExpiredRateLimits(query: QueryFn): Promise<void> {
  await query("DELETE FROM rate_limit_counters WHERE window_ends_at <= now()");
}
