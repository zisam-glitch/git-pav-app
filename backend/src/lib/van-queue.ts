// backend/src/lib/van-queue.ts
// Queue numbering shared by every path that changes a shift's queue.
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Renumbers a shift's accepted and in-progress stops 1..n in one statement,
 * keeping their current order (VR-8).
 */
export async function renumberQueue(db: Prisma.TransactionClient | typeof prisma, shiftId: string, orderBy: "accepted_at" | "queue_position") {
  const order = orderBy === "accepted_at" ? Prisma.sql`"accepted_at"` : Prisma.sql`"queue_position"`;
  await db.$executeRaw`
    UPDATE "van_service_requests" AS r
    SET "queue_position" = ranked.position
    FROM (
      SELECT "id", ROW_NUMBER() OVER (ORDER BY ${order} ASC NULLS LAST, "id") AS position
      FROM "van_service_requests"
      WHERE "shift_id" = ${shiftId}::uuid AND "status" IN ('accepted', 'in_progress')
    ) AS ranked
    WHERE r."id" = ranked."id" AND r."queue_position" IS DISTINCT FROM ranked.position`;
}
