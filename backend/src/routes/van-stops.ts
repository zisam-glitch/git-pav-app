// backend/src/routes/van-stops.ts
// Operator-facing van stop check-in.
// Mounted at /api/van/stops in server.ts.
//
// Contract (consumed by pavdental/src/app/(operator)/check-in.tsx):
// - POST /api/van/stops/:id/check-in → { ok: true }
//
// Semantics: marks the stop's phase as `on_site` (van has parked and the
// patient is boarding). Auth-scoped to the operator's own active shift, and
// idempotent — repeated check-ins are accepted no-ops.

import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateParams } from "../middleware/validate";
import { changeVanPhase } from "../lib/van-dispatch";

const router = Router();

const stopIdParamsSchema = z.object({ id: z.string().guid() }).strict();

router.post(
  "/:id/check-in",
  requireAuth,
  validateParams(stopIdParamsSchema),
  async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorised" });
    if (req.user.role !== "operator") {
      return res.status(403).json({ error: "Requires operator role" });
    }

    const operatorProfile = await prisma.operatorProfile.findUnique({
      where: { userId: req.user.sub },
      select: { id: true },
    });
    if (!operatorProfile) return res.status(403).json({ error: "Operator profile required" });

    const shift = await prisma.vanShift.findFirst({
      where: { operatorId: operatorProfile.id, status: { in: ["online", "paused"] }, endedAt: null },
      select: { id: true },
    });
    if (!shift) return res.status(404).json({ error: "No active shift" });

    const stop = await prisma.vanServiceRequest.findUnique({
      where: { id: String(req.params.id) },
      select: { id: true, shiftId: true, status: true, phase: true, patientId: true },
    });
    if (!stop) return res.status(404).json({ error: "Stop not found" });
    if (stop.shiftId !== shift.id) {
      return res.status(403).json({ error: "Stop is not on your active shift" });
    }
    if (!["accepted", "in_progress"].includes(stop.status)) {
      return res.status(409).json({ error: `Stop is ${stop.status} — cannot check in` });
    }
    if (["on_site", "in_treatment", "completed"].includes(stop.phase)) {
      // Idempotent: already checked in (or beyond).
      return res.json({ ok: true, phase: stop.phase });
    }

    // The same rules and the same compare-and-set as every other phase change
    // (lib/van-dispatch.ts): of two taps at once only one moves the stop, so
    // the patient is told once.
    const result = await changeVanPhase({
      shiftId: shift.id,
      requestId: stop.id,
      phase: "on_site",
      actorRole: "operator",
      viaCheckIn: true,
    });
    if (result.status !== 200) return res.status(result.status).json(result.body);
    return res.json({ ok: true, phase: "on_site" });
  }
);

export default router;
