import http from "http";
import crypto from "crypto";
import { londonDate, londonTimeToUtc, weekdayOf } from "../lib/availability";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-16 (BK-2, BK-3, BK-9, ID-1, DB-2): a clinician can't be double-booked,
// even by simultaneous requests; retries replay by the client's key, not by
// the booking details; and times that have started aren't offered.
// Synthetic data only.
describe("booking races", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const profileIds: string[] = [];
  const clinicIds: string[] = [];
  let serviceId = "";

  function nextWeekday(weekday: number): string {
    for (let d = 3; d < 10; d++) {
      const date = londonDate(new Date(Date.now() + d * 86400000));
      if (weekdayOf(date) === weekday) return date;
    }
    throw new Error("unreachable");
  }

  async function makePatient(label: string) {
    const user = await prisma.user.create({ data: { email: `book-${label}-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    userIds.push(user.id);
    const profile = await prisma.patientProfile.create({ data: { userId: user.id, firstName: "Synthetic", lastName: label } });
    profileIds.push(profile.id);
    return { profileId: profile.id, token: signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() }) };
  }

  async function makeClinician(blocks: { weekday: number; start: number; end: number }[]) {
    const user = await prisma.user.create({ data: { email: `book-doc-${crypto.randomUUID().slice(0, 8)}-${tag}@example.test`, passwordHash: "x", role: "clinician" } });
    userIds.push(user.id);
    const clinician = await prisma.clinicianProfile.create({
      data: { userId: user.id, fullName: "Synthetic Dentist", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    await prisma.clinicianRotaBlock.createMany({ data: blocks.map((b) => ({ clinicianId: clinician.id, weekday: b.weekday, startMinute: b.start, endMinute: b.end })) });
    return clinician.id;
  }

  async function makeClinic() {
    const clinic = await prisma.clinic.create({
      data: { name: `Synthetic Clinic ${tag}`, address: "1 Example Street", postcode: "ZZ1 1ZZ", city: "Testville", phone: "000", operatingHours: "Test hours" },
    });
    clinicIds.push(clinic.id);
    await prisma.clinicOpeningHours.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ clinicId: clinic.id, weekday, opensMinute: 0, closesMinute: 1440 })),
    });
    return clinic.id;
  }

  const book = (token: string, body: Record<string, unknown>, key?: string) =>
    fetch(`${baseUrl}/api/booking/appointments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(key ? { "Idempotency-Key": key } : {}) },
      body: JSON.stringify({ serviceId, ...body }),
    }).then(async (r) => ({ status: r.status, body: (await r.json()) as any }));

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3026, resolve));
    baseUrl = "http://localhost:3026";
    serviceId = (await prisma.service.findFirstOrThrow({ where: { durationMinutes: 30 } })).id;
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { patientId: { in: profileIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await prisma.clinic.deleteMany({ where: { id: { in: clinicIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("books a clinician's slot once when five patients ask at the same moment", async () => {
    const clinicId = await makeClinic();
    const monday = nextWeekday(1);
    const clinicianId = await makeClinician([{ weekday: 1, start: 540, end: 600 }]);
    const nine = londonTimeToUtc(monday, 540).toISOString();
    const patients = await Promise.all(["a", "b", "c", "d", "e"].map((l) => makePatient(`race-${l}`)));

    const results = await Promise.all(patients.map((p) => book(p.token, { channel: "clinic", clinicId, clinicianId, startTimeUtc: nine })));
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(4);
    const live = ["draft_hold", "confirmed", "in_progress"] as const;
    // Count the racers' own bookings and that one slot, not everything this
    // dentist has. Other suites share the database, and an "any dentist"
    // booking of theirs can be given this dentist at a neighbouring time (the
    // overlap constraint allows it), which made this fail now and then.
    expect(await prisma.appointment.count({ where: { patientId: { in: patients.map((p) => p.profileId) }, status: { in: [...live] } } })).toBe(1);
    expect(await prisma.appointment.count({ where: { clinicianId, startTimeUtc: new Date(nine), status: { in: [...live] } } })).toBe(1);
  }, 15000);

  it("won't book one patient into two appointments at once, even with different clinicians", async () => {
    const monday = nextWeekday(1);
    const first = await makeClinician([{ weekday: 1, start: 540, end: 600 }]);
    const second = await makeClinician([{ weekday: 1, start: 540, end: 600 }]);
    const nine = londonTimeToUtc(monday, 540).toISOString();
    const { token } = await makePatient("double");

    expect((await book(token, { channel: "video", clinicianId: first, startTimeUtc: nine })).status).toBe(201);
    const clash = await book(token, { channel: "video", clinicianId: second, startTimeUtc: nine });
    expect(clash.status).toBe(409);
    expect(clash.body.error).toMatch(/already have an appointment at that time/);
    // Another patient can still have the second clinician at that time.
    const other = await makePatient("double-other");
    expect((await book(other.token, { channel: "video", clinicianId: second, startTimeUtc: nine })).status).toBe(201);
  });

  it("refuses an overlapping live appointment in the database itself", async () => {
    const clinicianId = await makeClinician([]);
    const { profileId } = await makePatient("db");
    const start = new Date(Date.now() + 7 * 86400000);
    const make = (offsetMinutes: number, status: "confirmed" | "cancelled") =>
      prisma.appointment.create({
        data: {
          patientId: profileId,
          clinicianId,
          serviceId,
          channel: "clinic",
          startTimeUtc: new Date(start.getTime() + offsetMinutes * 60000),
          endTimeUtc: new Date(start.getTime() + (offsetMinutes + 30) * 60000),
          status,
          totalPricePence: 0,
        },
      });
    await make(0, "confirmed");
    await expect(make(15, "confirmed")).rejects.toThrow(/appointments_no_clinician_overlap/);
    await expect(make(15, "cancelled")).resolves.toBeTruthy();
    await expect(make(30, "confirmed")).resolves.toBeTruthy();
  });

  it("replays a retry with the same key, and lets a second tap carry on with the same hold", async () => {
    const clinicId = await makeClinic();
    const tuesday = nextWeekday(2);
    const clinicianId = await makeClinician([{ weekday: 2, start: 540, end: 600 }]);
    const body = { channel: "clinic", clinicId, clinicianId, startTimeUtc: londonTimeToUtc(tuesday, 540).toISOString() };
    const { token } = await makePatient("retry");

    const first = await book(token, body, `attempt-${tag}-1`);
    expect(first.status).toBe(201);
    const replay = await book(token, body, `attempt-${tag}-1`);
    expect(replay.body.id).toBe(first.body.id);
    const tappedAgain = await book(token, body);
    expect(tappedAgain.status).toBe(201);
    expect(tappedAgain.body.id).toBe(first.body.id);

    expect((await book(token, body, "bad key!")).status).toBe(400);
  });

  it("books the same time again after cancelling, instead of replaying the cancelled booking", async () => {
    const clinicId = await makeClinic();
    const wednesday = nextWeekday(3);
    const clinicianId = await makeClinician([{ weekday: 3, start: 540, end: 600 }]);
    const body = { channel: "clinic", clinicId, clinicianId, startTimeUtc: londonTimeToUtc(wednesday, 540).toISOString() };
    const { token } = await makePatient("rebook");

    const first = await book(token, body, `rebook-${tag}-1`);
    expect(first.status).toBe(201);
    await prisma.appointment.update({ where: { id: first.body.id }, data: { status: "cancelled" } });

    const again = await book(token, body, `rebook-${tag}-2`);
    expect(again.status).toBe(201);
    expect(again.body.id).not.toBe(first.body.id);
    expect(again.body.status).toBe("draft_hold");
  });

  it("clears another patient's expired hold that is in the way", async () => {
    const clinicId = await makeClinic();
    const thursday = nextWeekday(4);
    const clinicianId = await makeClinician([{ weekday: 4, start: 540, end: 600 }]);
    const nine = londonTimeToUtc(thursday, 540);
    const stale = await makePatient("stale");
    const expired = await prisma.appointment.create({
      data: {
        patientId: stale.profileId,
        clinicianId,
        clinicId,
        serviceId,
        channel: "clinic",
        startTimeUtc: nine,
        endTimeUtc: new Date(nine.getTime() + 30 * 60000),
        status: "draft_hold",
        holdExpiresAt: new Date(Date.now() - 60000),
        totalPricePence: 0,
      },
    });

    const { token } = await makePatient("fresh");
    const booked = await book(token, { channel: "clinic", clinicId, clinicianId, startTimeUtc: nine.toISOString() });
    expect(booked.status).toBe(201);
    expect((await prisma.appointment.findUniqueOrThrow({ where: { id: expired.id } })).status).toBe("cancelled");
  });

  it("doesn't offer times that have already started", async () => {
    const today = londonDate(new Date());
    const clinicianId = await makeClinician([{ weekday: weekdayOf(today), start: 0, end: 1440 }]);
    const { token } = await makePatient("slots");
    const slots = (await fetch(`${baseUrl}/api/booking/slots?date=${today}&channel=video&clinicianId=${clinicianId}&serviceId=${serviceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json())) as { startTimeUtc: string }[];
    const now = Date.now();
    expect(slots.every((s) => new Date(s.startTimeUtc).getTime() > now)).toBe(true);
  });

  // CS-48: nothing a client sends is stored as if the server had encrypted or
  // written it (a forged envelope, an admission, a clinician's summary, a room link).
  it("encrypts client triage and access details itself and drops server-owned keys", async () => {
    const { decryptField, isEncryptedEnvelope } = require("../lib/encryption");
    const clinicId = await makeClinic();
    const tuesday = nextWeekday(2);
    const clinicianId = await makeClinician([{ weekday: 2, start: 540, end: 600 }]);
    const nine = londonTimeToUtc(tuesday, 540).toISOString();
    const patient = await makePatient("forged");
    const fakeEnvelope = { ciphertext: "x", iv: "y", keyId: "z", algorithm: "aes-256-gcm" };

    const refused = await book(patient.token, {
      channel: "clinic", clinicId, clinicianId, startTimeUtc: nine, accessDetails: fakeEnvelope,
    });
    expect(refused.status).toBe(400);

    const booked = await book(patient.token, {
      channel: "clinic", clinicId, clinicianId, startTimeUtc: nine,
      triageData: { ...fakeEnvelope, chiefComplaint: "Synthetic toothache", painLevel: 4, admittedAt: new Date().toISOString(), consultationSummary: { diagnosis: "Forged" } },
      accessDetails: { notes: "Synthetic side door", gateCode: "A1", roomUrl: "https://evil.example.test" },
    });
    expect(booked.status).toBe(201);
    const stored = await prisma.appointment.findUniqueOrThrow({ where: { id: booked.body.id } });
    expect(isEncryptedEnvelope(stored.triageData)).toBe(true);
    expect(await decryptField(stored.triageData)).toEqual({ chiefComplaint: "Synthetic toothache", painLevel: 4 });
    const access = stored.accessDetails as Record<string, unknown>;
    expect(access).not.toHaveProperty("roomUrl");
    expect(isEncryptedEnvelope(access.gateCode)).toBe(true);
    expect(await decryptField(access.gateCode)).toBe("A1");
  }, 15000);
});
