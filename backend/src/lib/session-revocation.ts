import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { redis } from "./redis";
import { safeError } from "./log-safety";
import { logger } from "./structured-logging";

// CS-08 (AM-1): an access token is a 15-minute JWT, so without this it kept
// working after logout, a password change, a revoked session or a closed
// account. Revoking a session also puts its id on a Redis denylist for as
// long as any access token for it can live, and requireAuth checks it.
//
// A denylist rather than a session lookup per request: it costs one Redis
// EXISTS, and it fails open (back to the 15-minute window) if Redis is down
// rather than taking the API down with it.

/** Longest an access token can live (jwt.ts ACCESS_EXPIRY), plus clock skew. */
const DENYLIST_SECONDS = 16 * 60;
const key = (sessionId: string) => `revoked-session:${sessionId}`;

/** Puts sessions on the denylist. Call after the database has revoked them. */
export async function denySessions(sessionIds: string[]): Promise<void> {
  if (sessionIds.length === 0) return;
  try {
    const pipeline = redis.multi();
    for (const id of sessionIds) pipeline.set(key(id), "1", "EX", DENYLIST_SECONDS);
    await pipeline.exec();
  } catch (err) {
    logger.error("[Sessions] Could not record revoked sessions", undefined, safeError(err));
  }
}

/** Revokes the matching live sessions and denylists them. Returns how many. */
export async function revokeSessions(where: Prisma.AuthSessionWhereInput): Promise<number> {
  // CS-54 (CS-19): When all sessions for a user are revoked (e.g. password change,
  // password reset, or account closure), deactivate their push tokens so logged-out
  // devices stop receiving pushes.
  if (where.userId && typeof where.userId === "string") {
    await prisma.pushToken.updateMany({
      where: { userId: where.userId },
      data: { active: false },
    }).catch(() => {});
  }

  const live = await prisma.authSession.findMany({
    where: { ...where, revokedAt: null },
    select: { id: true },
  });
  if (live.length === 0) return 0;
  const ids = live.map((s) => s.id);
  await prisma.authSession.updateMany({ where: { id: { in: ids } }, data: { revokedAt: new Date() } });
  await denySessions(ids);

  return ids.length;
}

/** True when the session was revoked in the last few minutes. */
export async function isSessionDenied(sessionId: string): Promise<boolean> {
  // Don't queue behind a reconnecting client: an unavailable Redis means the
  // 15-minute token expiry is the only limit, as before this check existed.
  if (redis.status !== "ready") {
    if (redis.status === "wait") redis.connect().catch(() => {});
    return false;
  }
  try {
    return (await redis.exists(key(sessionId))) === 1;
  } catch {
    return false;
  }
}
