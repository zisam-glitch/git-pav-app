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
import { sendPatientNotification } from "../lib/patient-push";
import { broadcastEtaUpdates } from "../lib/van-eta-broadcast";
import { safeError } from "../lib/log-safety";

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

    // Compare-and-set: of two taps at once only one moves the stop, so the
    // patient is told once (N5).
    const moved = await prisma.vanServiceRequest.updateMany({
      where: { id: stop.id, phase: { in: ["queued", "en_route"] }, status: { in: ["accepted", "in_progress"] } },
      data: { phase: "on_site", status: "in_progress" },
    });
    if (moved.count !== 1) {
      const current = await prisma.vanServiceRequest.findUnique({ where: { id: stop.id }, select: { phase: true } });
      return res.json({ ok: true, phase: current?.phase ?? stop.phase });
    }

    // VS-1: Send "Van Has Arrived" notification to patient (same as van.ts phase update)
    await sendPatientNotification(
      stop.patientId,
      "Van Has Arrived",
      "The dental van has arrived at your location. Please be ready for your appointment.",
      { requestId: stop.id, phase: "on_site" }
    );

    // VS-1: Broadcast ETA updates for remaining stops on shift
    void broadcastEtaUpdates(shift.id).catch((err) =>
      console.error("[VAN ETA PUSH] check-in broadcast failed:", safeError(err))
    );

    return res.json({ ok: true, phase: "on_site" });
  }
);

export default router;
