import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { communicationService } from "../lib/communication-service";

describe("Inbox sends cannot double (V47, V58)", () => {
  let server: http.Server;
  let baseUrl: string;
  let sendEmailSpy: jest.SpyInstance;
  const tag = crypto.randomUUID().slice(0, 8);
  const threadIds: string[] = [];
  let token = "";

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;
    sendEmailSpy = jest
      .spyOn(communicationService, "sendEmail")
      .mockImplementation(async () => ({ success: true, messageId: "mock" }));

    const user = await prisma.user.create({
      data: { email: `nds-${tag}@example.test`, passwordHash: "x", role: "patient" },
    });
    await prisma.patientProfile.create({ data: { userId: user.id, firstName: "Nia", lastName: "Doubletap" } });
    token = signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    sendEmailSpy.mockRestore();
    await prisma.message.deleteMany({ where: { threadId: { in: threadIds } } }).catch(() => {});
    await prisma.messageThread.deleteMany({ where: { id: { in: threadIds } } }).catch(() => {});
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  const send = (path: string, body: unknown, key?: string) =>
    fetch(`${baseUrl}/api/messages${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(key ? { "Idempotency-Key": key } : {}),
      },
      body: JSON.stringify(body),
    });

  it("a retried create with the same key makes one thread, and returns the readable subject", async () => {
    const key = `msg-create-${tag}-1`;
    const payload = { subject: "Question about my appointment", body: "Hello there" };
    const first = await send("", payload, key);
    expect(first.status).toBe(201);
    const a = (await first.json()) as { id: string; subject: string };
    threadIds.push(a.id);
    expect(a.subject).toBe("Question about my appointment");

    const retry = await send("", payload, key);
    expect(retry.status).toBe(201);
    const b = (await retry.json()) as { id: string };
    expect(b.id).toBe(a.id);

    const count = await prisma.messageThread.count({ where: { id: a.id } });
    expect(count).toBe(1);
  });

  it("a retried reply with the same key adds one message", async () => {
    const created = (await (await send("", { subject: "Reply test", body: "First" })).json()) as { id: string };
    threadIds.push(created.id);
    const key = `msg-reply-${tag}-1`;
    const r1 = await send(`/${created.id}/reply`, { body: "Second" }, key);
    const r2 = await send(`/${created.id}/reply`, { body: "Second" }, key);
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    expect(await prisma.message.count({ where: { threadId: created.id } })).toBe(2);
  });

  it("rejects a malformed key", async () => {
    const res = await send("", { subject: "Bad key", body: "x" }, "no good!");
    expect(res.status).toBe(400);
  });
});
