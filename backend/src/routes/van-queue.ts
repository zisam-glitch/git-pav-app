// backend/src/routes/van-queue.ts
// Operator queue ordering: server-side optimization + manual reorder.
// Mounted at /api/van/shift in server.ts (alongside the shift routes in
// routes/van.ts).
//
// Contracts (consumed by pavdental/src/features/van/van-api.ts):
// - POST /api/van/shift/optimize
//     → reorders the operator's queued stops into the minimum-driving-time
//       order (exact permutation search over the routing matrix; queue is
//       capped at 5). Returns { reordered: n, order: requestId[] }.
// - POST /api/van/shift/queue/reorder  { order: requestId[] }
//     → applies the operator's manual ordering. Must be a permutation of the
//       currently queued (not yet started) stops; in-progress stops are
//       pinned ahead of the reordered block.
//
// Both endpoints renumber queue positions transactionally and are scoped to
// the operator's own active shift.

import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { reorderQueueSchema } from "../schemas/van-dispatch";
import { optimizeStopOrder, Point } from "../lib/van-eta";
import { broadcastEtaUpdates } from "../lib/van-eta-broadcast";
import { safeError } from "../lib/log-safety";

const router = Router();

async function requireActiveShift(
  req: AuthRequest,
  res: Response
): Promise<{ operatorId: string; shiftId: string } | null> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorised" });
    return null;
  }
  if (req.user.role !== "operator") {
    res.status(403).json({ error: "Requires operator role" });
    return null;
  }

  const operatorProfile = await prisma.operatorProfile.findUnique({
    where: { userId: req.user.sub },
    select: { id: true },
  });
  if (!operatorProfile) {
    res.status(403).json({ error: "Operator profile required" });
    return null;
  }

  const shift = await prisma.vanShift.findFirst({
    where: {
      operatorId: operatorProfile.id,
      status: { in: ["online", "paused"] },
      endedAt: null,
    },
    select: { id: true },
  });
  if (!shift) {
    res.status(404).json({ error: "No active shift" });
    return null;
  }

  return { operatorId: operatorProfile.id, shiftId: shift.id };
}

/**
 * Applies a new order to the unstarted stops under the shift lock (N2). Stops
 * already under way stay ahead of them, keeping their own order, and the whole
 * queue is numbered 1..n so no two stops share a place. Re-reads the queue
 * inside the lock: if it changed since the caller looked (an accept, a cancel),
 * nothing is written and the caller is told.
 */
async function applyQueuedOrder(
  shiftId: string,
  orderedIds: string[]
): Promise<{ ok: true } | { ok: false; currentOrder: string[] }> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${shiftId}`}))`;
      const [pinned, queued] = await Promise.all([
        tx.vanServiceRequest.findMany({
          where: { shiftId, status: "in_progress" },
          select: { id: true },
          orderBy: [{ queuePosition: "asc" }, { id: "asc" }],
        }),
        tx.vanServiceRequest.findMany({
          where: { shiftId, status: "accepted", phase: "queued" },
          select: { id: true },
          orderBy: [{ queuePosition: "asc" }, { id: "asc" }],
        }),
      ]);
      const queuedIds = new Set(queued.map((q) => q.id));
      const isPermutation =
        orderedIds.length === queued.length &&
        new Set(orderedIds).size === orderedIds.length &&
        orderedIds.every((id) => queuedIds.has(id));
      if (!isPermutation) return { ok: false as const, currentOrder: queued.map((q) => q.id) };

      const all = [...pinned.map((p) => p.id), ...orderedIds];
      for (let i = 0; i < all.length; i++) {
        await tx.vanServiceRequest.update({ where: { id: all[i] }, data: { queuePosition: i + 1 } });
      }
      return { ok: true as const };
    },
    { maxWait: 10_000, timeout: 30_000 }
  );
}

function refreshEtas(shiftId: string): void {
  // The order changed, so every patient's ETA may have too.
  void broadcastEtaUpdates(shiftId).catch((err) =>
    console.error("[VAN ETA PUSH] post-reorder broadcast failed:", safeError(err))
  );
}

const staleQueueResponse = (currentOrder: string[]) => ({
  error: "Order does not match the current queue",
  message: "Refresh the queue and try again — another change may have landed first.",
  currentOrder,
});

// ─── POST /api/van/shift/optimize ────────────────────────────────────────
router.post("/optimize", requireAuth, async (req: AuthRequest, res: Response) => {
  const ctx = await requireActiveShift(req, res);
  if (!ctx) return;

  const queued = await prisma.vanServiceRequest.findMany({
    where: { shiftId: ctx.shiftId, status: "accepted", phase: "queued" },
    select: { id: true, patientLat: true, patientLng: true, queuePosition: true },
    orderBy: { queuePosition: "asc" },
  });

  if (queued.length <= 1) {
    return res.json({
      reordered: 0,
      order: queued.map((q) => q.id),
      message: "Nothing to optimize — fewer than two unstarted stops.",
    });
  }

  // Optimal order for the unstarted stops. In-progress stops are pinned:
  // the van is already committed to them, so the optimizer only sequences
  // what comes after.
  const inProgress = await prisma.vanServiceRequest.findMany({
    where: { shiftId: ctx.shiftId, status: "in_progress" },
    select: { id: true, patientLat: true, patientLng: true },
    orderBy: { queuePosition: "asc" },
  });

  // Origin: where the van will be when it is free (the last stop under way),
  // else its current position; with no GPS fix yet, the first queued stop.
  const shift = await prisma.vanShift.findUnique({
    where: { id: ctx.shiftId },
    select: { lastLat: true, lastLng: true },
  });
  const lastPinned = inProgress[inProgress.length - 1];
  const stopPoints: Point[] = queued.map((q) => ({ lat: q.patientLat, lng: q.patientLng }));
  const origin: Point = lastPinned
    ? { lat: lastPinned.patientLat, lng: lastPinned.patientLng }
    : shift?.lastLat != null && shift?.lastLng != null
      ? { lat: shift.lastLat, lng: shift.lastLng }
      : stopPoints[0];

  const optimal = await optimizeStopOrder(origin, stopPoints);
  const orderedIds = optimal.map((i) => queued[i].id);
  const changed = orderedIds.some((id, i) => queued[i].id !== id);

  if (changed) {
    const applied = await applyQueuedOrder(ctx.shiftId, orderedIds);
    if (!applied.ok) return res.status(409).json(staleQueueResponse(applied.currentOrder));
    refreshEtas(ctx.shiftId);
  }

  return res.json({
    reordered: changed ? orderedIds.length : 0,
    order: orderedIds,
    pinnedInProgress: inProgress.map((s) => s.id),
    message: changed
      ? "Queue reordered for minimum driving time."
      : "Queue is already optimal.",
  });
});

// ─── POST /api/van/shift/queue/reorder ───────────────────────────────────
router.post(
  "/queue/reorder",
  requireAuth,
  validateBody(reorderQueueSchema),
  async (req: AuthRequest, res: Response) => {
    const ctx = await requireActiveShift(req, res);
    if (!ctx) return;

    const { order } = req.body as { order: string[] };

    // The submitted order must be exactly a permutation of the queued stops —
    // no dropping, duplicating, or touching in-progress/completed stops. The
    // check runs inside the lock.
    const applied = await applyQueuedOrder(ctx.shiftId, order);
    if (!applied.ok) return res.status(409).json(staleQueueResponse(applied.currentOrder));

    refreshEtas(ctx.shiftId);
    return res.json({ success: true, order });
  }
);

export default router;
