import http from "http";
import crypto from "crypto";
import app from "../server";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";

// A service is only booked on a channel it offers (plan J4). The app used to
// book every service as a clinic visit, including the video-only triage, and
// the server accepted it. Synthetic data only.
describe("booking a service on a channel it offers", () => {
  let server: http.Server;
  let baseUrl: string;
  let patientToken = "";
  const tag = crypto.randomUUID().slice(0, 8);
  let profileId = "";

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const user = await prisma.user.create({
      data: { email: `channel-${tag}@example.test`, passwordHash: "x", role: "patient" },
    });
    const profile = await prisma.patientProfile.create({
      data: { userId: user.id, firstName: "Synthetic", lastName: "Patient" },
    });
    profileId = profile.id;
    patientToken = signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { patientId: profileId } });
    await prisma.patientProfile.deleteMany({ where: { id: profileId } });
    // The user is kept: deleting it would null the actor on its audit entries
    // after they were hashed, which breaks the audit chain for every later check.
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const book = async (serviceId: string, channel: string, clinicId?: string) => {
    const start = new Date(Date.now() + 3 * 86400000);
    const res = await fetch(`${baseUrl}/api/booking/appointments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${patientToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        channel,
        ...(clinicId ? { clinicId } : {}),
        startTimeUtc: start.toISOString(),
        endTimeUtc: new Date(start.getTime() + 15 * 60000).toISOString(),
      }),
    });
    return { status: res.status, body: (await res.json()) as { error?: string } };
  };

  it("refuses a video-only service booked as a clinic visit", async () => {
    const videoOnly = await prisma.service.findFirst({
      where: { isActive: true, supportedChannels: { equals: ["video"] } },
    });
    if (!videoOnly) throw new Error("seed has no video-only service");
    const clinic = await prisma.clinic.findFirstOrThrow();

    const result = await book(videoOnly.id, "clinic", clinic.id);
    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/can't be booked that way/);
  });

  it("refuses a clinic-only service booked as a video consult", async () => {
    const clinicOnly = await prisma.service.findFirst({
      where: { isActive: true, NOT: { supportedChannels: { has: "video" } } },
    });
    if (!clinicOnly) throw new Error("seed has no service without video");

    const result = await book(clinicOnly.id, "video");
    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/can't be booked that way/);
  });

  it("lets a video service through to the slot check", async () => {
    const video = await prisma.service.findFirstOrThrow({
      where: { isActive: true, supportedChannels: { has: "video" } },
    });
    // Not a real free slot, so it stops at the availability check: anything
    // but the channel refusal shows the channel was accepted.
    const result = await book(video.id, "video");
    expect(result.body.error ?? "").not.toMatch(/can't be booked that way/);
  });
});
