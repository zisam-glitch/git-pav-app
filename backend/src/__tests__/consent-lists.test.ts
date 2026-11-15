import http from "http";
import crypto from "crypto";
import express from "express";
import "express-async-errors";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import consentsRouter from "../routes/consents";
import { errorHandler } from "../middleware/error-handler";

describe("Consent lists are bounded and still correct (I2)", () => {
  let appServer: http.Server;
  let appUrl: string;
  let token: string;
  let profileId: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const ids: string[] = [];

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/consents", consentsRouter);
    app.use(errorHandler);
    appServer = http.createServer(app);
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    appUrl = `http://localhost:${(appServer.address() as any).port}`;

    const user = await prisma.user.create({
      data: { email: `consent-lists-${tag}@example.test`, passwordHash: "synthetic_hash", role: "patient" },
    });
    const profile = await prisma.patientProfile.create({
      data: { userId: user.id, firstName: "Imogen", lastName: "Hale", dob: new Date("1990-02-03") },
    });
    profileId = profile.id;
    token = signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() });

    // data_processing: v1 withdrawn, v2 withdrawn, v3 granted. marketing: v1 granted, v2 withdrawn.
    const rows = [
      { consentType: "data_processing", version: 1, isGranted: false },
      { consentType: "data_processing", version: 2, isGranted: false },
      { consentType: "data_processing", version: 3, isGranted: true },
      { consentType: "marketing", version: 1, isGranted: true },
      { consentType: "marketing", version: 2, isGranted: false },
    ];
    for (const r of rows) {
      const made = await prisma.consentRecord.create({
        data: { patientProfileId: profileId, lawfulBasis: "consent", ...r },
      });
      ids.push(made.id);
    }
  });

  afterAll(async () => {
    await prisma.consentRecord.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    await new Promise<void>((resolve) => appServer.close(() => resolve()));
  });

  it("/current returns the newest granted version of each type, once", async () => {
    const res = await fetch(`${appUrl}/api/consents/current`, { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { consentType: string; version: number }[];
    const summary = body.map((c) => `${c.consentType}:${c.version}`).sort();
    expect(summary).toEqual(["data_processing:3", "marketing:1"]);
  });

  it("/history still lists every version when withdrawn ones are included", async () => {
    const res = await fetch(`${appUrl}/api/consents/history?includeWithdrawn=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(5);
  });
});
