import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import * as push from "../lib/patient-push";
import { decryptString } from "../lib/encryption";
import { consultSummaryText } from "../lib/appointment-thread";
import { uniqueGdc } from "../../test/unique-gdc";

describe("consultSummaryText", () => {
  it("includes what the dentist recorded and nothing they left out", () => {
    const text = consultSummaryText({ diagnosis: "Sore gum", notes: "Rinse with salt water", treatmentPlan: null, followUpRecommended: "clinic" });
    expect(text).toContain("What they found: Sore gum");
    expect(text).toContain("Advice: Rinse with salt water");
    expect(text).not.toContain("Plan:");
    expect(text).toContain("a visit at the clinic");
  });
  it("says nothing about a follow-up when none is advised", () => {
    expect(consultSummaryText({ followUpRecommended: "none" })).not.toContain("Follow-up");
  });
});

describe("One conversation per video appointment (V48, V49)", () => {
  let server: http.Server;
  let baseUrl: string;
  let pushSpy: jest.SpyInstance;
  const tag = crypto.randomUUID().slice(0, 8);
  let patientToken = "";
  let strangerToken = "";
  let clinicianToken = "";
  let patientUserId = "";
  let clinicianUserId = "";
  let appointmentId = "";

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;
    pushSpy = jest.spyOn(push, "sendUserNotification").mockResolvedValue(undefined);

    const mk = (label: string, role: "patient" | "clinician") =>
      prisma.user.create({ data: { email: `at-${label}-${tag}@example.test`, passwordHash: "x", role } });
    const pu = await mk("pat", "patient");
    const su = await mk("stranger", "patient");
    const cu = await mk("clin", "clinician");
    const patient = await prisma.patientProfile.create({
      data: { userId: pu.id, firstName: "Ada", lastName: "Thread", dob: new Date("1995-05-15"), gender: "female", postcode: "W1D 3QU" },
    });
    await prisma.patientProfile.create({ data: { userId: su.id, firstName: "Sam", lastName: "Stranger" } });
    const clinician = await prisma.clinicianProfile.create({
      data: { userId: cu.id, fullName: "Dr. Thread", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    const service = await prisma.service.findFirstOrThrow();
    const start = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    const appt = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        clinicianId: clinician.id,
        serviceId: service.id,
        channel: "video",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 30 * 60 * 1000),
        status: "in_progress",
        totalPricePence: service.pricePence,
        depositPaidPence: 0,
      },
    });
    appointmentId = appt.id;
    patientUserId = pu.id;
    clinicianUserId = cu.id;
    const sess = () => crypto.randomUUID();
    patientToken = signAccessToken({ sub: pu.id, role: "patient", sessionId: sess() });
    strangerToken = signAccessToken({ sub: su.id, role: "patient", sessionId: sess() });
    clinicianToken = signAccessToken({ sub: cu.id, role: "clinician", sessionId: sess() });
  });

  afterAll(async () => {
    pushSpy.mockRestore();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  const call = (method: string, token: string, path: string, body?: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

  it("has no conversation until someone writes, then exactly one, even for two writers at once", async () => {
    const before = (await (await call("GET", patientToken, `/api/appointment-messages/${appointmentId}`)).json()) as { threadId: string | null };
    expect(before.threadId).toBeNull();

    const [a, b] = await Promise.all([
      call("POST", patientToken, `/api/appointment-messages/${appointmentId}`, { body: "Hello from the waiting room" }),
      call("POST", clinicianToken, `/api/appointment-messages/${appointmentId}`, { body: "Hello from the dentist" }),
    ]);
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    const ta = ((await a.json()) as { threadId: string }).threadId;
    const tb = ((await b.json()) as { threadId: string }).threadId;
    expect(ta).toBe(tb);
    expect(await prisma.messageThread.count({ where: { appointmentId } })).toBe(1);
    expect(await prisma.message.count({ where: { threadId: ta } })).toBe(2);
  });

  it("lets the dentist start writing to the patient, with the real name and a push without content", async () => {
    pushSpy.mockClear();
    const res = await call("POST", clinicianToken, `/api/appointment-messages/${appointmentId}`, { body: "Please send a photo of the area." });
    expect(res.status).toBe(201);
    const out = (await res.json()) as { message: { senderName: string; senderRole: string } };
    expect(out.message.senderName).toBe("Dr. Thread");
    expect(out.message.senderRole).toBe("clinician");
    const [userId, title, body] = pushSpy.mock.calls[0];
    expect(userId).toBe(patientUserId);
    expect(`${title} ${body}`).not.toMatch(/photo|area/i);

    const thread = await prisma.messageThread.findUniqueOrThrow({ where: { appointmentId } });
    expect(thread.patientUnread).toBe(true);
    expect(await decryptString(thread.subject)).toBe("Your video consultation");
  });

  it("pushes the dentist when the patient writes", async () => {
    pushSpy.mockClear();
    await call("POST", patientToken, `/api/appointment-messages/${appointmentId}`, { body: "Thank you" });
    expect(pushSpy.mock.calls[0][0]).toBe(clinicianUserId);
  });

  it("keeps a stranger out", async () => {
    expect((await call("GET", strangerToken, `/api/appointment-messages/${appointmentId}`)).status).toBe(404);
    expect((await call("POST", strangerToken, `/api/appointment-messages/${appointmentId}`, { body: "hi" })).status).toBe(404);
  });

  it("delivers the consult summary into the same conversation when the dentist ends the consult", async () => {
    const end = await call("POST", clinicianToken, "/api/video/end-consult", {
      appointmentId,
      diagnosis: "Synthetic finding",
      notes: "Synthetic advice",
      followUpRecommended: "van",
    });
    expect(end.status).toBe(200);
    const thread = await prisma.messageThread.findUniqueOrThrow({ where: { appointmentId }, include: { messages: { orderBy: { sentAt: "desc" }, take: 1 } } });
    const last = await decryptString(thread.messages[0].body);
    expect(last).toContain("Synthetic finding");
    expect(last).toContain("from the van");
    expect(thread.messages[0].senderRole).toBe("clinician");
  });
});
