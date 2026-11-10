import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { uniqueGdc } from "../../test/unique-gdc";
import { patientIsPresent, waitingRoomIsOpen } from "../lib/video-triage";

describe("Waiting-room presence (V10, V15)", () => {
  it("counts a patient as present only while their app has reported in recently", () => {
    const now = Date.now();
    expect(patientIsPresent(new Date(now - 5_000), now)).toBe(true);
    expect(patientIsPresent(new Date(now - 120_000), now)).toBe(false);
    expect(patientIsPresent(null, now)).toBe(false);
  });

  it("opens the waiting room 10 minutes before the start and closes it at the end", () => {
    const start = new Date("2026-11-10T10:00:00Z");
    const end = new Date("2026-11-10T10:30:00Z");
    expect(waitingRoomIsOpen(start, end, Date.parse("2026-11-10T09:49:00Z"))).toBe(false);
    expect(waitingRoomIsOpen(start, end, Date.parse("2026-11-10T09:50:00Z"))).toBe(true);
    expect(waitingRoomIsOpen(start, end, Date.parse("2026-11-10T10:29:00Z"))).toBe(true);
    expect(waitingRoomIsOpen(start, end, Date.parse("2026-11-10T10:30:00Z"))).toBe(false);
  });
});

describe("Waiting-room presence over the API", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  let patientToken = "";
  let otherPatientToken = "";
  let patientProfileId = "";
  let clinicianProfileId = "";
  let serviceId = "";
  let price = 0;
  const created: string[] = [];

  // Each takes a start time offset from now. Slots must not overlap for one
  // clinician, so the three open-now tests each use a different offset.
  const appt = async (startOffsetMs: number, clinicianId: string = clinicianProfileId) => {
    const start = new Date(Date.now() + startOffsetMs);
    const a = await prisma.appointment.create({
      data: {
        patientId: patientProfileId,
        clinicianId,
        serviceId,
        channel: "video",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 20 * 60 * 1000),
        status: "confirmed",
        totalPricePence: price,
        depositPaidPence: 0,
      },
    });
    created.push(a.id);
    return a.id;
  };

  // Appointments that are open right now would overlap for one clinician, so
  // each of those tests gets a clinician of its own.
  const newClinician = async (label: string) => {
    const user = await prisma.user.create({
      data: { email: `vp-${label}-${tag}@example.test`, passwordHash: "x", role: "clinician" },
    });
    const profile = await prisma.clinicianProfile.create({
      data: { userId: user.id, fullName: `Dr. ${label}`, gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    const token = signAccessToken({ sub: user.id, role: "clinician", sessionId: crypto.randomUUID() });
    return { id: profile.id, token };
  };

  const call = (path: string, token: string, method = "POST") =>
    fetch(`${baseUrl}/api/video/${path}`, { method, headers: { Authorization: `Bearer ${token}` } });

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require("../server").default;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as { port: number }).port}`;

    const mk = async (label: string, role: "patient" | "clinician") =>
      prisma.user.create({ data: { email: `vp-${label}-${tag}@example.test`, passwordHash: "x", role } });
    const pu = await mk("patient", "patient");
    const ou = await mk("other", "patient");
    const cu = await mk("clin", "clinician");
    const profile = await prisma.patientProfile.create({
      data: { userId: pu.id, firstName: "Pat", lastName: "Present", dob: new Date("1995-05-15"), gender: "female", postcode: "W1D 3QU" },
    });
    patientProfileId = profile.id;
    const clinician = await prisma.clinicianProfile.create({
      data: { userId: cu.id, fullName: "Dr. Presence", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    clinicianProfileId = clinician.id;
    const service = await prisma.service.findFirstOrThrow();
    serviceId = service.id;
    price = service.pricePence;
    const sess = () => crypto.randomUUID();
    patientToken = signAccessToken({ sub: pu.id, role: "patient", sessionId: sess() });
    otherPatientToken = signAccessToken({ sub: ou.id, role: "patient", sessionId: sess() });
  });

  afterAll(async () => {
    // The appointments are left in place: they are "today's" visits, and
    // deleting them mid-run would lower the counts that admin-attention.test.ts
    // reads in a parallel worker. The database is throwaway in CI.
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { redis } = require("../lib/redis");
    try { redis.disconnect(); } catch {}
  });

  it("refuses the waiting room more than 10 minutes before the start, and says when it opens", async () => {
    const id = await appt(3 * 60 * 60 * 1000);
    const res = await call(`waiting/${id}`, patientToken);
    expect(res.status).toBe(409);
    const body = (await res.json()) as { code: string; opensAt: string };
    expect(body.code).toBe("not_open_yet");
    // Opens 10 minutes before a start that is 3 hours away.
    const expected = Date.now() + 3 * 60 * 60 * 1000 - 10 * 60 * 1000;
    expect(Math.abs(new Date(body.opensAt).getTime() - expected)).toBeLessThan(60_000);
  });

  it("lets the dentist see the patient waiting, and stop seeing them when they leave", async () => {
    const dentist = await newClinician("seen");
    const id = await appt(-5 * 60 * 1000, dentist.id);
    expect((await call(`waiting/${id}`, patientToken)).status).toBe(200);

    const queue = (await (await call("clinician-queue", dentist.token, "GET")).json()) as {
      id: string;
      patientWaiting: boolean;
      patientWaitingSince: string | null;
    }[];
    const row = queue.find((q) => q.id === id)!;
    expect(row.patientWaiting).toBe(true);
    expect(row.patientWaitingSince).toBeTruthy();

    expect((await call(`waiting/${id}/leave`, patientToken)).status).toBe(200);
    const after = (await (await call("clinician-queue", dentist.token, "GET")).json()) as { id: string; patientWaiting: boolean }[];
    expect(after.find((q) => q.id === id)!.patientWaiting).toBe(false);
  });

  it("does not let another patient report in for, or leave, someone else's consultation", async () => {
    const id = await appt(-5 * 60 * 1000, (await newClinician("guard")).id);
    expect((await call(`waiting/${id}`, otherPatientToken)).status).toBe(404);
    expect((await call(`waiting/${id}/leave`, otherPatientToken)).status).toBe(404);
  });

  it("keeps the first waiting time across repeated reports", async () => {
    const id = await appt(-5 * 60 * 1000, (await newClinician("first")).id);
    await call(`waiting/${id}`, patientToken);
    const first = (await prisma.appointment.findUniqueOrThrow({ where: { id } })).patientWaitingSince!;
    await call(`waiting/${id}`, patientToken);
    const second = (await prisma.appointment.findUniqueOrThrow({ where: { id } })).patientWaitingSince!;
    expect(second.getTime()).toBe(first.getTime());
  });
});
