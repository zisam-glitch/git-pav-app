import http from "http";
import crypto from "crypto";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import app from "../server";

// B3: when Redis can't be reached, holding a time must not tell the patient
// that someone else is holding it. Synthetic data only.
describe("holding a slot while Redis is unreachable", () => {
  jest.setTimeout(30_000);

  let server: http.Server;
  let baseUrl = "";
  let token = "";
  const tag = crypto.randomUUID().slice(0, 8);
  const slotId = `slot:2099-01-05:any:2099-01-05T09:00:00.000Z-${tag}`;

  const hold = () =>
    fetch(`${baseUrl}/api/booking/hold-slot`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    }).then(async (r) => ({ status: r.status, body: (await r.json()) as Record<string, unknown> }));

  // Only the slot keys fail, so sign-in checks that use Redis still work.
  const failForSlotKeys = (method: "set" | "get") => {
    const original = (redis[method] as (...args: unknown[]) => unknown).bind(redis);
    return jest.spyOn(redis, method).mockImplementation(((key: string, ...rest: unknown[]) => {
      if (String(key).startsWith("slot:")) return Promise.reject(new Error("connect ECONNREFUSED"));
      return original(key, ...rest);
    }) as never);
  };

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3038, resolve));
    baseUrl = "http://localhost:3038";
    const user = await prisma.user.create({ data: { email: `hold-outage-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    token = signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() });
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await redis.del(slotId).catch(() => {});
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("answers 503 and says to try again when the hold can't be written", async () => {
    failForSlotKeys("set");
    const { status, body } = await hold();
    expect(status).toBe(503);
    expect(String(body.error)).toMatch(/try again/i);
    expect(String(body.error)).not.toMatch(/another patient/i);
  });

  it("answers 503 when the current holder can't be read", async () => {
    jest.spyOn(redis, "set").mockResolvedValueOnce(null as never);
    failForSlotKeys("get");
    const { status, body } = await hold();
    expect(status).toBe(503);
    expect(String(body.error)).not.toMatch(/another patient/i);
  });

  it("still holds the time normally when Redis is up", async () => {
    const { status, body } = await hold();
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.holdDurationSeconds).toBe(600);
  });
});
