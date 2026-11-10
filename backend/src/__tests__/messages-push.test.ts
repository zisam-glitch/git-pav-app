import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { communicationService } from "../lib/communication-service";
import * as push from "../lib/patient-push";
import { uniqueGdc } from "../../test/unique-gdc";

describe("A new message reaches the other person's phone (V44)", () => {
  let server: http.Server;
  let baseUrl: string;
  let emailSpy: jest.SpyInstance;
  let pushSpy: jest.SpyInstance;
  const tag = crypto.randomUUID().slice(0, 8);
  const threadIds: string[] = [];
  let patientUserId = "";
  let clinicianUserId = "";
  let clinicianProfileId = "";
  let patientToken = "";
  let clinicianToken = "";

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;
    emailSpy = jest.spyOn(communicationService, "sendEmail").mockResolvedValue({ success: true, messageId: "mock" });
    pushSpy = jest.spyOn(push, "sendUserNotification").mockResolvedValue(undefined);

    const pu = await prisma.user.create({ data: { email: `mp-pat-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    await prisma.patientProfile.create({ data: { userId: pu.id, firstName: "Mia", lastName: "Message" } });
    const cu = await prisma.user.create({ data: { email: `mp-clin-${tag}@example.test`, passwordHash: "x", role: "clinician" } });
    const clinician = await prisma.clinicianProfile.create({
      data: { userId: cu.id, fullName: "Dr. Notify", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    patientUserId = pu.id;
    clinicianUserId = cu.id;
    clinicianProfileId = clinician.id;
    patientToken = signAccessToken({ sub: pu.id, role: "patient", sessionId: crypto.randomUUID() });
    clinicianToken = signAccessToken({ sub: cu.id, role: "clinician", sessionId: crypto.randomUUID() });
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

  const post = (path: string, token: string, body: unknown) =>
    fetch(`${baseUrl}/api/messages${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("pushes the dentist when a patient writes to them, and the patient when the dentist answers, without any content", async () => {
    pushSpy.mockClear();
    const created = await post("", patientToken, {
      subject: "My tooth hurts when I drink cold water",
      body: "It started on Monday.",
      recipientClinicianId: clinicianProfileId,
    });
    expect(created.status).toBe(201);
    const thread = (await created.json()) as { id: string };
    threadIds.push(thread.id);

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy.mock.calls[0][0]).toBe(clinicianUserId);

    pushSpy.mockClear();
    const reply = await post(`/${thread.id}/reply`, clinicianToken, { body: "Please avoid very cold drinks for now." });
    expect(reply.status).toBe(201);
    expect(pushSpy).toHaveBeenCalledTimes(1);
    const [userId, title, body, data] = pushSpy.mock.calls[0];
    expect(userId).toBe(patientUserId);
    expect(title).toBe("New message from Pav Dental");
    expect(`${title} ${body}`).not.toMatch(/tooth|cold|Notify|Dr\./i);
    expect(data).toEqual({ type: "message", audience: "patient", threadId: thread.id });

    pushSpy.mockClear();
    await post(`/${thread.id}/reply`, patientToken, { body: "Thank you." });
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy.mock.calls[0][0]).toBe(clinicianUserId);
  });
});
