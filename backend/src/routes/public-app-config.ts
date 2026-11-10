import { Router, Request, Response } from "express";
import { readAppConfig } from "../lib/app-config";

const router = Router();

// ─── GET /api/public/app-config ───────────────────────────────────────────────
// Public: the app asks before anyone has signed in. Contains no patient data.
router.get("/", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  return res.json(readAppConfig());
});

export default router;
