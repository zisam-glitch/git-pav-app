import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { communicationService } from "../lib/communication-service";
import * as push from "../lib/patient-push";
import { keysForThread, photoKeyPrefix, MAX_MESSAGE_PHOTOS } from "../lib/message-photos";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

describe("keysForThread", () => {
  const id = "11111111-1111-1111-1111-111111111111";
  it("keeps only this conversation's keys, once each, up to the limit", () => {
    const own = `${photoKeyPrefix(id)}a.png`;
    expect(keysForThread(id, [own, own, "messages/other/a.png", "triage/x/a.png", `${photoKeyPrefix(id)}../x.png`, 5])).toEqual([own]);
    const many = Array.from({ length: 10 }, (_, i) => `${photoKeyPrefix(id)}${i}.png`);
    expect(keysForThread(id, many)).toHaveLength(MAX_MESSAGE_PHOTOS);
    expect(keysForThread(id, "nope")).toEqual([]);
  });
});

describe("Photos in messages (V53)", () => {
  let server: http.Server;
  let baseUrl: string;
  let emailSpy: jest.SpyInstance;
  let pushSpy: jest.SpyInstance;
  const tag = crypto.randomUUID().slice(0, 8);
  const threadIds: string[] = [];
  let patientToken = "";
  let strangerToken = "";
  let clinicianToken = "";
  let clinicianProfileId = "";

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;
    emailSpy = jest.spyOn(communicationService, "sendEmail").mockResolvedValue({ success: true, messageId: "mock" });
    pushSpy = jest.spyOn(push, "sendUserNotification").mockResolvedValue(undefined);

    const mk = (label: string, role: "patient" | "clinician") =>
      prisma.user.create({ data: { email: `mph-${label}-${tag}@example.test`, passwordHash: "x", role } });
    const pu = await mk("pat", "patient");
    const su = await mk("stranger", "patient");
    const cu = await mk("clin", "clinician");
    await prisma.patientProfile.create({ data: { userId: pu.id, firstName: "Pho", lastName: "To" } });
    await prisma.patientProfile.create({ data: { userId: su.id, firstName: "Stan", lastName: "Ger" } });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { uniqueGdc } = require("../../test/unique-gdc");
    const clinician = await prisma.clinicianProfile.create({ data: { userId: cu.id, fullName: "Dr. Photo", gdcNumber: uniqueGdc(), roleTitle: "Dentist" } });
    clinicianProfileId = clinician.id;
    const sess = () => crypto.randomUUID();
    patientToken = signAccessToken({ sub: pu.id, role: "patient", sessionId: sess() });
    strangerToken = signAccessToken({ sub: su.id, role: "patient", sessionId: sess() });
    clinicianToken = signAccessToken({ sub: cu.id, role: "clinician", sessionId: sess() });
  });

  afterAll(async () => {
    emailSpy.mockRestore();
    pushSpy.mockRestore();
    await prisma.message.deleteMany({ where: { threadId: { in: threadIds } } }).catch(() => {});
    await prisma.messageThread.deleteMany({ where: { id: { in: threadIds } } }).catch(() => {});
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  const json = (method: string, token: string, path: string, body?: unknown) =>
    fetch(`${baseUrl}/api/messages${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  const upload = (token: string, threadId: string, bytes: Buffer) => {
    const form = new FormData();
    form.append("photo", new Blob([bytes], { type: "image/png" }), "p.png");
    return fetch(`${baseUrl}/api/messages/${threadId}/photos`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  };
  const newThread = async () => {
    const res = await json("POST", patientToken, "", { subject: "Photo test", body: "See attached", recipientClinicianId: clinicianProfileId });
    const t = (await res.json()) as { id: string };
    threadIds.push(t.id);
    return t.id;
  };

  it("lets the patient send a photo, and the dentist sees it with a link", async () => {
    const id = await newThread();
    const up = await upload(patientToken, id, PNG);
    expect(up.status).toBe(201);
    const { key } = (await up.json()) as { key: string };
    expect(key.startsWith(photoKeyPrefix(id))).toBe(true);

    const reply = await json("POST", patientToken, `/${id}/reply`, { body: "", attachmentKeys: [key] });
    expect(reply.status).toBe(201);
    const sent = (await reply.json()) as { message: { attachments: { url: string }[] } };
    expect(sent.message.attachments).toHaveLength(1);

    const list = (await (await json("GET", clinicianToken, "")).json()) as { id: string; hasAttachment: boolean; messages: { attachments: { url: string }[] }[] }[];
    const mine = list.find((t) => t.id === id)!;
    expect(mine.hasAttachment).toBe(true);
    expect(mine.messages.some((m) => m.attachments.length === 1)).toBe(true);
  });

  it("refuses a file that is not an image, a stranger, and a message with nothing in it", async () => {
    const id = await newThread();
    expect((await upload(patientToken, id, Buffer.from("<html>not a picture</html>"))).status).toBe(400);
    expect((await upload(strangerToken, id, PNG)).status).toBe(404);
    expect((await json("POST", patientToken, `/${id}/reply`, { body: "" })).status).toBe(400);
  });

  it("ignores a photo key that belongs to another conversation", async () => {
    const a = await newThread();
    const b = await newThread();
    const { key } = (await (await upload(patientToken, a, PNG)).json()) as { key: string };
    const res = await json("POST", patientToken, `/${b}/reply`, { body: "Hello", attachmentKeys: [key] });
    const out = (await res.json()) as { message: { attachments: unknown[] } };
    expect(out.message.attachments).toHaveLength(0);
  });
});
