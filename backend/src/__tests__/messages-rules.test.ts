import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { communicationService } from "../lib/communication-service";
import * as push from "../lib/patient-push";
import { uniqueGdc } from "../../test/unique-gdc";

describe("Inbox rules (V55, V56, V57)", () => {
  let server: http.Server;
  let baseUrl: string;
  let emailSpy: jest.SpyInstance;
  let pushSpy: jest.SpyInstance;
  const tag = crypto.randomUUID().slice(0, 8);
  const threadIds: string[] = [];
  let patientToken = "";
  let patientProfileId = "";
  let treatingClinician = { id: "", userId: "", token: "" };
  let strangerClinician = { id: "", userId: "", token: "" };
  let serviceId = "";
  let price = 0;

  const newClinician = async (label: string, name: string) => {
    const user = await prisma.user.create({ data: { email: `mr-${label}-${tag}@example.test`, passwordHash: "x", role: "clinician" } });
    const profile = await prisma.clinicianProfile.create({ data: { userId: user.id, fullName: name, gdcNumber: uniqueGdc(), roleTitle: "Dentist" } });
    return { id: profile.id, userId: user.id, token: signAccessToken({ sub: user.id, role: "clinician", sessionId: crypto.randomUUID() }) };
  };

  const appointment = (clinicianId: string, status: "completed" | "confirmed", daysAgo: number) => {
    const start = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return prisma.appointment.create({
      data: {
        patientId: patientProfileId,
        clinicianId,
        serviceId,
        channel: "video",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 30 * 60 * 1000),
        status,
        totalPricePence: price,
        depositPaidPence: 0,
      },
    });
  };

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;
    emailSpy = jest.spyOn(communicationService, "sendEmail").mockResolvedValue({ success: true, messageId: "mock" });
    pushSpy = jest.spyOn(push, "sendUserNotification").mockResolvedValue(undefined);

    const pu = await prisma.user.create({ data: { email: `mr-pat-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    const profile = await prisma.patientProfile.create({ data: { userId: pu.id, firstName: "Rae", lastName: "Rules" } });
    patientProfileId = profile.id;
    patientToken = signAccessToken({ sub: pu.id, role: "patient", sessionId: crypto.randomUUID() });
    treatingClinician = await newClinician("treat", "Dr. Treats");
    strangerClinician = await newClinician("stranger", "Dr. Stranger");
    const service = await prisma.service.findFirstOrThrow();
    serviceId = service.id;
    price = service.pricePence;
  });

  afterAll(async () => {
    emailSpy.mockRestore();
    pushSpy.mockRestore();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  const send = (method: string, token: string, path: string, body?: unknown) =>
    fetch(`${baseUrl}/api/messages${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

  it("sends care-team messages to a dentist who has seen the patient, not one with only a booking, and ignores a name the app supplies", async () => {
    // The stranger has a later, still-upcoming booking; the treating dentist has a completed visit.
    await appointment(treatingClinician.id, "completed", 40);
    await appointment(strangerClinician.id, "confirmed", 50);
    const res = await send("POST", patientToken, "", {
      subject: "Question",
      body: "Hello",
      recipientType: "care_team",
      recipientName: "Dr. Somebody Else",
    });
    expect(res.status).toBe(201);
    const thread = (await res.json()) as { id: string; assignedClinicianId: string; from: string };
    threadIds.push(thread.id);
    expect(thread.assignedClinicianId).toBe(treatingClinician.id);
    expect(thread.from).toBe("Dr. Treats");
  });

  it("keeps the practice's name for a message to the practice, whatever the app says", async () => {
    const res = await send("POST", patientToken, "", { subject: "Hours", body: "Hi", recipientType: "practice", recipientName: "Dr. Made Up" });
    const thread = (await res.json()) as { id: string; from: string };
    threadIds.push(thread.id);
    expect(thread.from).toBe("Pav Dental Clinical Team");
  });

  it("emails the patient about a reply without the subject or the content", async () => {
    const created = await send("POST", patientToken, "", {
      subject: "Swelling under my jaw",
      body: "It started yesterday",
      recipientClinicianId: treatingClinician.id,
    });
    const thread = (await created.json()) as { id: string };
    threadIds.push(thread.id);
    emailSpy.mockClear();
    const reply = await send("POST", treatingClinician.token, `/${thread.id}/reply`, { body: "Please come in today." });
    expect(reply.status).toBe(201);
    const sent = JSON.stringify(emailSpy.mock.calls);
    expect(sent).not.toMatch(/swelling|jaw|come in today/i);
    expect(sent).toContain("[Pav Dental] You have a new message");
  });

  it("brings a hidden conversation back when the practice replies", async () => {
    const created = await send("POST", patientToken, "", { subject: "Hide me", body: "x", recipientClinicianId: treatingClinician.id });
    const thread = (await created.json()) as { id: string };
    threadIds.push(thread.id);
    expect((await send("DELETE", patientToken, `/${thread.id}`)).status).toBe(200);
    // Hidden: the patient can't open or delete it again.
    expect((await send("DELETE", patientToken, `/${thread.id}`)).status).toBe(404);
    // The practice still sees it, and a reply brings it back.
    const staffList = (await (await send("GET", treatingClinician.token, "")).json()) as { id: string }[];
    expect(staffList.some((t) => t.id === thread.id)).toBe(true);
    await send("POST", treatingClinician.token, `/${thread.id}/reply`, { body: "Following up" });
    const back = (await (await send("GET", patientToken, "")).json()) as { id: string }[];
    expect(back.some((t) => t.id === thread.id)).toBe(true);
  });
});
