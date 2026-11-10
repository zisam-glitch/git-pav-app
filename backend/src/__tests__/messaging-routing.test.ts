import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { communicationService } from "../lib/communication-service";
import { redis } from "../lib/redis";
import { uniqueGdc } from "../../test/unique-gdc";

describe("CS-29: Messaging that reaches people (MS-3)", () => {
  let server: http.Server;
  let baseUrl: string;
  let sendEmailSpy: jest.SpyInstance;

  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const threadIds: string[] = [];

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    baseUrl = `http://localhost:${port}`;

    sendEmailSpy = jest.spyOn(communicationService, "sendEmail").mockImplementation(async () => ({
      success: true,
      messageId: "mock_test_msg",
    }));
  });

  afterAll(async () => {
    sendEmailSpy.mockRestore();
    if (threadIds.length > 0) {
      await prisma.message.deleteMany({ where: { threadId: { in: threadIds } } }).catch(() => {});
      await prisma.messageThread.deleteMany({ where: { id: { in: threadIds } } }).catch(() => {});
    }
    // Do not delete users or profiles: audit_logs has a foreign key to users with
    // ON DELETE SET NULL, which mutates actor_id on existing audit log rows and breaks
    // their cryptographic HMAC integrity chain in CI.
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function makePatient(label: string, firstName = "Alice", lastName = "Smith") {
    const user = await prisma.user.create({
      data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role: "patient" },
    });
    userIds.push(user.id);
    const profile = await prisma.patientProfile.create({
      data: { userId: user.id, firstName, lastName },
    });
    const token = signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() });
    return { user, profile, token };
  }

  async function makeClinician(label: string, fullName = "Sarah Jenkins") {
    const user = await prisma.user.create({
      data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role: "clinician" },
    });
    userIds.push(user.id);
    const profile = await prisma.clinicianProfile.create({
      data: {
        userId: user.id,
        fullName,
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    const token = signAccessToken({ sub: user.id, role: "clinician", sessionId: crypto.randomUUID() });
    return { user, profile, token };
  }

  it("provides SLA metadata and clinical emergency advice on /api/messages/meta", async () => {
    const patient = await makePatient("meta-pat");
    const res = await fetch(`${baseUrl}/api/messages/meta`, {
      headers: { Authorization: `Bearer ${patient.token}` },
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.operatingHours).toBeDefined();
    expect(data.emergencyAdvice).toContain("call 999");
    expect(data.emergencyAdvice).toContain("111");
  });

  it("routes patient message to a specific clinician and notifies them", async () => {
    sendEmailSpy.mockClear();
    const patient = await makePatient("pat-1", "James", "Miller");
    const clinician = await makeClinician("doc-1", "Sarah Jenkins");

    const res = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${patient.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Sensitivity after filling",
        body: "Hello Dr. Jenkins, experiencing mild sensitivity on tooth 31.",
        recipientType: "clinician",
        recipientClinicianId: clinician.profile.id,
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    threadIds.push(data.id);
    expect(data.assignedClinicianId).toBe(clinician.profile.id);
    expect(data.recipientType).toBe("clinician");
    expect(data.from).toContain("Dr. Sarah Jenkins");

    // Staff notification was sent to clinician's email
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: clinician.user.email,
        subject: "[Pav Dental] New patient message",
      })
    );
    // The alert must not name the patient (D-19).
    expect(JSON.stringify(sendEmailSpy.mock.calls)).not.toContain("James");
    expect(JSON.stringify(sendEmailSpy.mock.calls)).not.toContain("Miller");
  });

  it("routes patient message to practice inbox when no clinician is assigned and notifies practice team", async () => {
    sendEmailSpy.mockClear();
    const patient = await makePatient("pat-2", "Emily", "Clark");

    const res = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${patient.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Clinic parking question",
        body: "Is parking available at the Central practice?",
        recipientType: "practice",
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    threadIds.push(data.id);
    expect(data.assignedClinicianId).toBeNull();
    expect(data.recipientType).toBe("practice");

    // Practice inbox notified
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("[Practice Inbox]"),
      })
    );
    // The alert names neither the patient nor the subject (D-19).
    const sent = JSON.stringify(sendEmailSpy.mock.calls);
    expect(sent).not.toContain("Emily");
    expect(sent).not.toContain("Clark");
    expect(sent).not.toContain("parking");
  });

  it("allows clinician to reply with their real staff name (never 'You') and notifies the patient", async () => {
    sendEmailSpy.mockClear();
    const patient = await makePatient("pat-3", "Oliver", "Twist");
    const clinician = await makeClinician("doc-2", "Tariq Pav");

    // Create thread routed to this clinician
    const createRes = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${patient.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Post-op care instructions",
        body: "How long before I can drink hot beverages?",
        recipientClinicianId: clinician.profile.id,
      }),
    });
    expect(createRes.status).toBe(201);
    const thread = (await createRes.json()) as any;
    threadIds.push(thread.id);

    // Clinician replies
    sendEmailSpy.mockClear();
    const replyRes = await fetch(`${baseUrl}/api/messages/${thread.id}/reply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clinician.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: "Please wait 2 hours until the local anaesthetic completely wears off.",
      }),
    });

    expect(replyRes.status).toBe(201);
    const replyData = (await replyRes.json()) as any;

    // MS-3 check: Staff reply shows real staff name, NOT "You"!
    expect(replyData.message.senderRole).toBe("clinician");
    expect(replyData.message.senderName).toBe("Dr. Tariq Pav");
    expect(replyData.message.senderName).not.toBe("You");

    // Thread preview reflects staff name
    expect(replyData.thread.preview).toContain("Dr. Tariq Pav: Please wait 2 hours");

    // Patient was notified via email of the staff reply. The subject line says
    // only that a message came; the thread subject may describe a health
    // problem, so it stays in the app (V57). The body names who replied.
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: patient.user.email,
        subject: "[Pav Dental] You have a new message",
        text: expect.stringContaining("Dr. Tariq Pav"),
      })
    );
    expect(JSON.stringify(sendEmailSpy.mock.calls)).not.toContain("Post-op care instructions");
  });

  it("clinician sees routed thread in their inbox and unread status is maintained", async () => {
    const patient = await makePatient("pat-4", "Hannah", "Abbott");
    const clinician = await makeClinician("doc-3", "Sarah Jenkins");

    const createRes = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${patient.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Whitening sensitivity inquiry",
        body: "I am having mild gum irritation.",
        recipientClinicianId: clinician.profile.id,
      }),
    });
    const thread = (await createRes.json()) as any;
    threadIds.push(thread.id);

    // Clinician queries GET /api/messages
    const listRes = await fetch(`${baseUrl}/api/messages`, {
      headers: { Authorization: `Bearer ${clinician.token}` },
    });
    expect(listRes.status).toBe(200);
    const threads = (await listRes.json()) as any[];

    const found = threads.find((t) => t.id === thread.id);
    expect(found).toBeDefined();
    // From clinician perspective, 'from' shows the patient's name
    expect(found.from).toBe("Hannah Abbott");
    expect(found.isRead).toBe(false); // New message is unread for staff
  });
  it("lists threads a page at a time, newest first, without repeats (CS-09)", async () => {
    const patient = await makePatient("paging-pt", "Paging", "Patient");
    const created: string[] = [];
    for (const n of [1, 2, 3]) {
      const res = await fetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${patient.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: `Synthetic question ${n}`, body: "Synthetic body." }),
      });
      expect(res.status).toBe(201);
      const thread = (await res.json()) as any;
      threadIds.push(thread.id);
      created.push(thread.id);
    }
    // Distinct times, so the expected order doesn't depend on the clock.
    for (const [i, id] of created.entries()) {
      await prisma.messageThread.update({ where: { id }, data: { updatedAt: new Date(Date.UTC(2026, 0, 1, 9, i)) } });
    }
    const headers = { Authorization: `Bearer ${patient.token}` };

    const first = (await (await fetch(`${baseUrl}/api/messages?limit=2`, { headers })).json()) as any[];
    const second = (await (await fetch(`${baseUrl}/api/messages?limit=2&offset=2`, { headers })).json()) as any[];
    expect(first.map((t) => t.id)).toEqual([created[2], created[1]]);
    expect(second.map((t) => t.id)).toEqual([created[0]]);

    expect((await fetch(`${baseUrl}/api/messages?limit=101`, { headers })).status).toBe(400);
    expect((await fetch(`${baseUrl}/api/messages?offset=-1`, { headers })).status).toBe(400);
  });

  it("hides a thread from the patient and keeps it for the practice, with an audit entry (CS-29, V56)", async () => {
    const patient = await makePatient("delete-pt", "Delete", "Patient");
    const res = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${patient.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "Synthetic question", body: "Synthetic body." }),
    });
    expect(res.status).toBe(201);
    const thread = (await res.json()) as { id: string };
    threadIds.push(thread.id);

    const del = await fetch(`${baseUrl}/api/messages/${thread.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${patient.token}` },
    });
    expect(del.status).toBe(200);
    // Gone from the patient's list, still in the database for the practice.
    const kept = await prisma.messageThread.findUnique({ where: { id: thread.id } });
    expect(kept).not.toBeNull();
    expect(kept!.patientHiddenAt).not.toBeNull();
    const list = (await (await fetch(`${baseUrl}/api/messages`, { headers: { Authorization: `Bearer ${patient.token}` } })).json()) as { id: string }[];
    expect(list.some((t) => t.id === thread.id)).toBe(false);

    const entry = await prisma.auditLog.findFirst({
      where: { action: "message.thread_hidden", resourceId: thread.id },
    });
    expect(entry).not.toBeNull();
    expect(entry!.actorId).toBe(patient.user.id);
    expect(entry!.metadata).toMatchObject({ recipientType: "practice" });
  });

  it("keeps a separate unread state for the patient and for staff (CS-29)", async () => {
    const patient = await makePatient("read-pt", "Read", "Patient");
    const clinician = await makeClinician("read-doc", "Read Clinician");
    const asPatient = { Authorization: `Bearer ${patient.token}`, "Content-Type": "application/json" };
    const asClinician = { Authorization: `Bearer ${clinician.token}`, "Content-Type": "application/json" };
    const readState = async (headers: Record<string, string>, id: string) => {
      const list = (await (await fetch(`${baseUrl}/api/messages`, { headers })).json()) as { id: string; isRead: boolean }[];
      return list.find((t) => t.id === id)?.isRead;
    };

    const created = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: asPatient,
      body: JSON.stringify({ subject: "Synthetic question", body: "Synthetic body.", recipientClinicianId: clinician.profile.id }),
    });
    const thread = (await created.json()) as { id: string };
    threadIds.push(thread.id);
    expect(await readState(asPatient, thread.id)).toBe(true);
    expect(await readState(asClinician, thread.id)).toBe(false);

    // The patient opening their own thread must not clear the clinician's unread.
    expect((await fetch(`${baseUrl}/api/messages/${thread.id}/read`, { method: "PATCH", headers: asPatient })).status).toBe(200);
    expect(await readState(asClinician, thread.id)).toBe(false);

    expect((await fetch(`${baseUrl}/api/messages/${thread.id}/read`, { method: "PATCH", headers: asClinician })).status).toBe(200);
    expect(await readState(asClinician, thread.id)).toBe(true);

    const reply = await fetch(`${baseUrl}/api/messages/${thread.id}/reply`, {
      method: "POST",
      headers: asClinician,
      body: JSON.stringify({ body: "Synthetic reply." }),
    });
    expect(reply.status).toBe(201);
    expect(await readState(asPatient, thread.id)).toBe(false);
    expect(await readState(asClinician, thread.id)).toBe(true);
  });

  it("gives admins a practice inbox under /api/admin/messages (CS-29)", async () => {
    const patient = await makePatient("inbox-pt", "Inbox", "Patient");
    const admin = await prisma.user.create({
      data: { email: `inbox-admin-${tag}@example.test`, passwordHash: "x", role: "admin" },
    });
    const asAdmin = {
      Authorization: `Bearer ${signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() })}`,
      "Content-Type": "application/json",
    };

    const created = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${patient.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "Synthetic practice question", body: "Synthetic body." }),
    });
    const thread = (await created.json()) as { id: string; recipientType: string };
    threadIds.push(thread.id);
    expect(thread.recipientType).toBe("practice");

    const list = await fetch(`${baseUrl}/api/admin/messages?recipientType=practice&limit=100`, { headers: asAdmin });
    expect(list.status).toBe(200);
    const threads = (await list.json()) as { id: string; isRead: boolean; recipientType: string; from: string }[];
    expect(threads.every((t) => t.recipientType === "practice")).toBe(true);
    const found = threads.find((t) => t.id === thread.id);
    expect(found).toMatchObject({ isRead: false, from: "Inbox Patient" });

    const reply = await fetch(`${baseUrl}/api/admin/messages/${thread.id}/reply`, {
      method: "POST",
      headers: asAdmin,
      body: JSON.stringify({ body: "Synthetic practice reply." }),
    });
    expect(reply.status).toBe(201);
    expect(((await reply.json()) as { message: { senderName: string } }).message.senderName).toBe("Pav Dental Practice Team");

    // Patients and clinicians can't use the admin inbox.
    expect((await fetch(`${baseUrl}/api/admin/messages`, { headers: { Authorization: `Bearer ${patient.token}` } })).status).toBe(403);
  });
});
