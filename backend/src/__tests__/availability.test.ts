import http from "http";
import crypto from "crypto";
import { londonDate, londonTimeToUtc, slotsForDay, weekdayOf } from "../lib/availability";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-30 (decisions log #12): slots come from clinic opening hours and the
// clinician's rota, in UK time, and only a real free slot can be booked.
// Synthetic data only.
describe("opening hours and rota", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const clinicIds: string[] = [];
  const profileIds: string[] = [];
  let serviceId = "";
  let duration = 30;
  let patientToken = "";

  /** The next date (at least 3 days out) that falls on this weekday. */
  function nextWeekday(weekday: number): string {
    for (let d = 3; d < 10; d++) {
      const date = londonDate(new Date(Date.now() + d * 86400000));
      if (weekdayOf(date) === weekday) return date;
    }
    throw new Error("unreachable");
  }

  async function makeClinic() {
    const clinic = await prisma.clinic.create({
      data: { name: `Synthetic Clinic ${tag}`, address: "1 Example Street", postcode: "ZZ1 1ZZ", city: "Testville", phone: "000", operatingHours: "Test hours" },
    });
    clinicIds.push(clinic.id);
    // Mon to Fri 09:00 to 17:30, Sat 09:00 to 13:00, closed Sunday.
    await prisma.clinicOpeningHours.createMany({
      data: [1, 2, 3, 4, 5].map((weekday) => ({ clinicId: clinic.id, weekday, opensMinute: 540, closesMinute: 1050 }))
        .concat({ clinicId: clinic.id, weekday: 6, opensMinute: 540, closesMinute: 780 }),
    });
    return clinic.id;
  }

  async function makeClinician(blocks: { weekday: number; start: number; end: number; clinicId?: string }[]) {
    const user = await prisma.user.create({ data: { email: `rota-${crypto.randomUUID().slice(0, 8)}-${tag}@example.test`, passwordHash: "x", role: "clinician" } });
    userIds.push(user.id);
    const clinician = await prisma.clinicianProfile.create({
      data: { userId: user.id, fullName: "Synthetic Dentist", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    await prisma.clinicianRotaBlock.createMany({
      data: blocks.map((b) => ({ clinicianId: clinician.id, weekday: b.weekday, startMinute: b.start, endMinute: b.end, clinicId: b.clinicId ?? null })),
    });
    return clinician.id;
  }

  const book = (body: Record<string, unknown>) =>
    fetch(`${baseUrl}/api/booking/appointments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${patientToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, ...body }),
    }).then(async (r) => ({ status: r.status, body: (await r.json()) as any }));

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3016, resolve));
    baseUrl = "http://localhost:3016";
    const service = await prisma.service.findFirstOrThrow({ where: { durationMinutes: 30 } });
    serviceId = service.id;
    duration = service.durationMinutes;
    const user = await prisma.user.create({ data: { email: `rota-patient-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    userIds.push(user.id);
    const profile = await prisma.patientProfile.create({ data: { userId: user.id, firstName: "Synthetic", lastName: "Patient" } });
    profileIds.push(profile.id);
    patientToken = signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { patientId: { in: profileIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await prisma.clinic.deleteMany({ where: { id: { in: clinicIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("keeps opening times on UK wall-clock time across the clocks changing", () => {
    // Clocks go back at 02:00 BST on Sunday 25 October 2026.
    expect(londonTimeToUtc("2026-10-24", 540).toISOString()).toBe("2026-10-24T08:00:00.000Z");
    expect(londonTimeToUtc("2026-10-25", 540).toISOString()).toBe("2026-10-25T09:00:00.000Z");
    // Clocks go forward at 01:00 GMT on Sunday 28 March 2027.
    expect(londonTimeToUtc("2027-03-27", 540).toISOString()).toBe("2027-03-27T09:00:00.000Z");
    expect(londonTimeToUtc("2027-03-28", 540).toISOString()).toBe("2027-03-28T08:00:00.000Z");
    // The day's end is the next day's UK midnight.
    expect(londonTimeToUtc("2026-07-01", 1440).toISOString()).toBe("2026-07-01T23:00:00.000Z");
    expect(londonDate(new Date("2026-07-01T23:30:00Z"))).toBe("2026-07-02");
  });

  it("builds a clock-change day's slots from the rota in UK time", async () => {
    // A video clinician working Sundays 09:00 to 10:00.
    const clinicianId = await makeClinician([{ weekday: 0, start: 540, end: 600 }]);
    const now = new Date("2026-10-01T00:00:00Z");
    const autumn = await slotsForDay({ date: "2026-10-25", channel: "video", durationMinutes: 30, clinicianId, now });
    expect(autumn.map((s) => s.startTimeUtc.toISOString())).toEqual(["2026-10-25T09:00:00.000Z", "2026-10-25T09:30:00.000Z"]);
    const spring = await slotsForDay({ date: "2027-03-28", channel: "video", durationMinutes: 30, clinicianId, now });
    expect(spring.map((s) => s.startTimeUtc.toISOString())).toEqual(["2027-03-28T08:00:00.000Z", "2027-03-28T08:30:00.000Z"]);
  });

  it("offers nothing on a closed day, a closure date or a day off", async () => {
    const clinicId = await makeClinic();
    const everyDay = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, start: 480, end: 1200 }));
    const clinicianId = await makeClinician(everyDay);

    const sunday = nextWeekday(0);
    expect(await slotsForDay({ date: sunday, channel: "clinic", durationMinutes: duration, clinicianId, clinicId })).toEqual([]);

    const tuesday = nextWeekday(2);
    await prisma.clinicClosure.create({ data: { clinicId, date: new Date(`${tuesday}T00:00:00Z`), reason: "Synthetic closure" } });
    expect(await slotsForDay({ date: tuesday, channel: "clinic", durationMinutes: duration, clinicianId, clinicId })).toEqual([]);

    const wednesday = nextWeekday(3);
    await prisma.clinicianRotaOverride.create({ data: { clinicianId, date: new Date(`${wednesday}T00:00:00Z`) } });
    expect(await slotsForDay({ date: wednesday, channel: "clinic", durationMinutes: duration, clinicianId, clinicId })).toEqual([]);

    // A date override with other hours replaces the weekly rota.
    const thursday = nextWeekday(4);
    await prisma.clinicianRotaOverride.create({ data: { clinicianId, date: new Date(`${thursday}T00:00:00Z`), startMinute: 840, endMinute: 900 } });
    const thursdaySlots = await slotsForDay({ date: thursday, channel: "clinic", durationMinutes: 30, clinicianId, clinicId });
    expect(thursdaySlots.map((s) => s.startTimeUtc.getTime())).toEqual([londonTimeToUtc(thursday, 840).getTime(), londonTimeToUtc(thursday, 870).getTime()]);
  });

  it("only offers clinic times inside both the rota and the clinic's hours", async () => {
    const clinicId = await makeClinic();
    const otherClinicId = await makeClinic();
    const friday = nextWeekday(5);
    // Works 08:00 to 10:00 anywhere, and 15:00 to 19:00 only at the other clinic.
    const clinicianId = await makeClinician([
      { weekday: 5, start: 480, end: 600 },
      { weekday: 5, start: 900, end: 1140, clinicId: otherClinicId },
    ]);
    const here = await slotsForDay({ date: friday, channel: "clinic", durationMinutes: 30, clinicianId, clinicId });
    expect(here.map((s) => s.startTimeUtc.getTime())).toEqual([londonTimeToUtc(friday, 540).getTime(), londonTimeToUtc(friday, 570).getTime()]);
    const there = await slotsForDay({ date: friday, channel: "clinic", durationMinutes: 30, clinicianId, clinicId: otherClinicId });
    // 09:00 to 10:00, then 15:00 until the clinic closes at 17:30.
    expect(there).toHaveLength(2 + 5);
    expect(there[there.length - 1].endTimeUtc.getTime()).toBe(londonTimeToUtc(friday, 1050).getTime());
  });

  it("marks slots starting within the next hour as unavailable", async () => {
    const clinicianId = await makeClinician([{ weekday: 1, start: 540, end: 660 }]);
    const monday = nextWeekday(1);
    const now = new Date(londonTimeToUtc(monday, 560).getTime());
    const slots = await slotsForDay({ date: monday, channel: "video", durationMinutes: 30, clinicianId, now });
    // At 09:20, anything starting before 10:20 is too soon to book.
    expect(slots.map((s) => s.available)).toEqual([false, false, false, true]);
  });

  it("books only a real free slot, and assigns a clinician when none was chosen", async () => {
    const clinicId = await makeClinic();
    const monday = nextWeekday(1);
    const clinicianId = await makeClinician([{ weekday: 1, start: 540, end: 600 }]);
    const nine = londonTimeToUtc(monday, 540).toISOString();

    expect((await book({ channel: "clinic", clinicianId, startTimeUtc: nine })).status).toBe(400);
    // 09:10 isn't a slot, and 07:00 is before the clinic opens.
    expect((await book({ channel: "clinic", clinicId, clinicianId, startTimeUtc: londonTimeToUtc(monday, 550).toISOString() })).status).toBe(409);
    expect((await book({ channel: "clinic", clinicId, clinicianId, startTimeUtc: londonTimeToUtc(monday, 420).toISOString() })).status).toBe(409);

    const booked = await book({ channel: "clinic", clinicId, clinicianId, startTimeUtc: nine });
    expect(booked.body).toMatchObject({ clinicianId });
    expect(booked.status).toBe(201);
    expect(booked.body.clinicianId).toBe(clinicianId);

    const anyone = await book({ channel: "clinic", clinicId, startTimeUtc: londonTimeToUtc(monday, 570).toISOString() });
    expect(anyone.status).toBe(201);
    expect(anyone.body.clinicianId).toEqual(expect.any(String));

    const listed = await fetch(`${baseUrl}/api/booking/slots?date=${monday}&channel=clinic&clinicId=${clinicId}&clinicianId=${clinicianId}&serviceId=${serviceId}`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    }).then((r) => r.json() as Promise<any[]>);
    expect(listed.find((s) => s.startTimeUtc === nine)?.available).toBe(false);
  });

  it("paginates appointment lists with limit and page (BK-8)", async () => {
    const resPage1 = await fetch(`${baseUrl}/api/booking/appointments?limit=1&page=1`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    expect(resPage1.status).toBe(200);
    const data1 = (await resPage1.json()) as any[];
    expect(data1.length).toBeLessThanOrEqual(1);

    const resPage2 = await fetch(`${baseUrl}/api/booking/appointments?limit=1&page=2`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    expect(resPage2.status).toBe(200);
    const data2 = (await resPage2.json()) as any[];
    expect(data2.length).toBeLessThanOrEqual(1);
    if (data1.length > 0 && data2.length > 0) {
      expect(data1[0].id).not.toBe(data2[0].id);
    }
  });
});
