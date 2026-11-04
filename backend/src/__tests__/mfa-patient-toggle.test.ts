import http from "http";
import crypto from "crypto";
import argon2 from "argon2";
import app from "../server";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { otpService } from "../lib/otp-service";
import { redis } from "../lib/redis";

// Patients turn two-step sign-in on with a code, and off with their password
// and a fresh code (plan Phase 4). Staff can't turn it off. Users are kept
// after the test (deleting one rewrites its audit entries). Synthetic data only.
describe("patient two-step sign-in on and off", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const PASSWORD = "Synthetic-Passw0rd!";

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function makeUser(role: "patient" | "clinician", n: number) {
    const user = await prisma.user.create({
      data: {
        email: `mfa-${role}-${n}-${tag}@example.test`,
        passwordHash: await argon2.hash(PASSWORD, { type: argon2.argon2id }),
        role,
        mfaEnabled: role !== "patient",
      },
    });
    await redis.del(`mfa-disable:${user.id}`, `mfa:${user.id}`);
    return { user, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  const post = async (path: string, token: string, body?: unknown) => {
    const res = await fetch(`${baseUrl}/api/auth${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return { status: res.status, body: (await res.json()) as { error?: string; message?: string } };
  };
  const freshCode = async (userId: string) =>
    (await otpService.createAndSendOTP({ userId, email: "x@example.test", purpose: "mfa_step_up" })).code;
  const mfaEnabled = async (id: string) => (await prisma.user.findUniqueOrThrow({ where: { id } })).mfaEnabled;

  it("turns on with a code and off with the password and a code", async () => {
    const { user, token } = await makeUser("patient", 1);

    expect((await post("/mfa/verify", token, { code: await freshCode(user.id) })).status).toBe(200);
    expect(await mfaEnabled(user.id)).toBe(true);

    const wrongPassword = await post("/mfa/disable", token, { password: "not-it", code: await freshCode(user.id) });
    expect(wrongPassword.status).toBe(403);
    expect(await mfaEnabled(user.id)).toBe(true);

    await freshCode(user.id);
    const wrongCode = await post("/mfa/disable", token, { password: PASSWORD, code: "000000" });
    expect(wrongCode.status).toBe(400);
    expect(await mfaEnabled(user.id)).toBe(true);

    const ok = await post("/mfa/disable", token, { password: PASSWORD, code: await freshCode(user.id) });
    expect(ok.status).toBe(200);
    expect(await mfaEnabled(user.id)).toBe(false);
  });

  it("needs both the password and a code", async () => {
    const { token } = await makeUser("patient", 2);
    expect((await post("/mfa/disable", token, { password: PASSWORD })).status).toBe(400);
    expect((await post("/mfa/disable", token, { code: "123456" })).status).toBe(400);
  });

  it("doesn't let staff turn it off", async () => {
    const { user, token } = await makeUser("clinician", 3);
    const res = await post("/mfa/disable", token, { password: PASSWORD, code: await freshCode(user.id) });
    expect(res.status).toBe(409);
    expect(await mfaEnabled(user.id)).toBe(true);
  });
});
