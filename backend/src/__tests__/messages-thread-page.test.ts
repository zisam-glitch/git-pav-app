import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { encryptField } from "../lib/encryption";

describe("Inbox: light list and one paged conversation (V50)", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  let patientToken = "";
  let otherToken = "";
  let threadId = "";
  const messageIds: string[] = [];

  const get = (token: string, path: string) =>
    fetch(`${baseUrl}/api/messages${path}`, { headers: { Authorization: `Bearer ${token}` } });

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;

    const pu = await prisma.user.create({ data: { email: `tp-pat-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    await prisma.patientProfile.create({ data: { userId: pu.id, firstName: "Pia", lastName: "Paged" } });
    const ou = await prisma.user.create({ data: { email: `tp-oth-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    await prisma.patientProfile.create({ data: { userId: ou.id, firstName: "Olly", lastName: "Other" } });
    patientToken = signAccessToken({ sub: pu.id, role: "patient", sessionId: crypto.randomUUID() });
    otherToken = signAccessToken({ sub: ou.id, role: "patient", sessionId: crypto.randomUUID() });

    const thread = await prisma.messageThread.create({
      data: {
        patientUserId: pu.id,
        senderName: "Pav Dental Practice Team",
        subject: JSON.stringify(await encryptField("Paging")),
        preview: "",
      },
    });
    threadId = thread.id;
    // Five messages, one minute apart, oldest first.
    for (let i = 1; i <= 5; i++) {
      const m = await prisma.message.create({
        data: {
          threadId,
          senderRole: i % 2 ? "patient" : "admin",
          senderName: i % 2 ? "Pia Paged" : "Pav Dental Practice Team",
          body: JSON.stringify(await encryptField(`message ${i}`)),
          sentAt: new Date(Date.UTC(2026, 10, 1, 9, i)),
        },
      });
      messageIds.push(m.id);
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  it("the summary list carries the last message as the preview and no message bodies", async () => {
    const res = await get(patientToken, "?view=summary");
    expect(res.status).toBe(200);
    const list = (await res.json()) as Array<{ id: string; preview: string; messages: unknown[] }>;
    const row = list.find((t) => t.id === threadId)!;
    expect(row.preview).toContain("message 5");
    expect(row.messages).toEqual([]);
  });

  it("the default list still returns every message", async () => {
    const list = (await (await get(patientToken, "")).json()) as Array<{ id: string; messages: unknown[] }>;
    expect(list.find((t) => t.id === threadId)!.messages).toHaveLength(5);
  });

  it("opens one conversation: the newest page, oldest first, with a cursor for older ones", async () => {
    const res = await get(patientToken, `/${threadId}?limit=2`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { subject: string; messages: Array<{ body: string }>; hasMore: boolean; nextBefore: string | null };
    expect(body.subject).toBe("Paging");
    expect(body.messages.map((m) => m.body)).toEqual(["message 4", "message 5"]);
    expect(body.hasMore).toBe(true);
    expect(body.nextBefore).toBe(messageIds[3]);
  });

  it("pages back to the start without repeating or skipping a message", async () => {
    const seen: string[] = [];
    let before: string | null = null;
    for (let guard = 0; guard < 5; guard++) {
      const res: Response = await get(patientToken, `/${threadId}?limit=2${before ? `&before=${before}` : ""}`);
      const body = (await res.json()) as { messages: Array<{ body: string }>; hasMore: boolean; nextBefore: string | null };
      seen.unshift(...body.messages.map((m) => m.body));
      if (!body.hasMore) break;
      before = body.nextBefore;
    }
    expect(seen).toEqual(["message 1", "message 2", "message 3", "message 4", "message 5"]);
  });

  it("does not show another patient's conversation", async () => {
    const res = await get(otherToken, `/${threadId}`);
    expect(res.status).toBe(404);
  });

  it("rejects a cursor that is not a message in this conversation", async () => {
    const res = await get(patientToken, `/${threadId}?before=${crypto.randomUUID()}`);
    expect(res.status).toBe(400);
  });

  it("rejects a bad id or limit", async () => {
    expect((await get(patientToken, "/not-a-guid")).status).toBe(400);
    expect((await get(patientToken, `/${threadId}?limit=500`)).status).toBe(400);
  });
});
