import { Router, Request, Response } from "express";
import { bookingPolicies } from "../lib/booking-policies";

const router = Router();

// ─── GET /api/public/policies ─────────────────────────────────────────────────
// Public: the booking rules (cancellation refunds, reschedule notice, check-in and
// waiting-room windows), so the app shows what the server does. No patient data.
router.get("/", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "public, max-age=300");
  return res.json(bookingPolicies());
});

export default router;
