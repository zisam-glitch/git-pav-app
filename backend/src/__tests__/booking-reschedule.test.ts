import http from "http";
import crypto from "crypto";
import { londonDate, londonTimeToUtc, weekdayOf } from "../lib/availability";
import { scheduleAppointmentReminderLadder } from "../lib/background-jobs";
import { getCancellationPolicy } from "../lib/cancellation-policy";
import { checkReschedulable, RESCHEDULE_MIN_NOTICE_HOURS } from "../lib/reschedule-policy";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { uniqueGdc } from "../../test/unique-gdc";
import app from "../server";

// Owner decision, 5 Nov: a paid clinic or video booking can be moved for free
// with 48 hours' notice or more, and the deposit stays with it. Inside 48 hours
// the patient cancels and rebooks. Synthetic data only.
describe("rescheduling a booking", () => {
  jest.setTimeout(30_000);

  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const profileIds: string[] = [];
  const clinicianProfileIds: string[] = [];
  const clinicIds: string[] = [];
  const appointmentIds: string[] = [];
  let serviceId = "";
  let clinicId = "";
  let clinicianId = "";
  let patientToken = "";
  let patientProfileId = "";
  let otherToken = "";
  let patientUserId = "";

  // Monday 09:00 to 12:00 is the dentist's rota; the clinic is open all day.
  const monday = (minDaysAhead: number) => {
    for (let d = minDaysAhead; d < minDaysAhead + 8; d++) {
      const date = londonDate(new Date(Date.now() + d * 86400000));
      if (weekdayOf(date) === 1) return date;
    }
    throw new Error("unreachable");
  };
  const at = (date: string, minute: number) => londonTimeToUtc(date, minute);

  const reschedule = (id: string, startTimeUtc: unknown, token = patientToken) =>
    fetch(`${baseUrl}/api/booking/appointments/${id}/reschedule`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startTimeUtc }),
    }).then(async (r) => ({ status: r.status, body: (await r.json()) as { [key: string]: unknown } }));

  async function makeBooking(
    start: Date,
    overrides: Partial<{ status: "confirmed" | "draft_hold" | "cancelled"; channel: "clinic" | "video"; patientId: string; clinicianId: string | null }> = {},
  ) {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: overrides.patientId ?? patientProfileId,
        serviceId,
        channel: overrides.channel ?? "clinic",
        clinicId,
        clinicianId: overrides.clinicianId === undefined ? clinicianId : overrides.clinicianId,
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 30 * 60000),
        status: overrides.status ?? "confirmed",
        totalPricePence: 6500,
        depositPaidPence: 1500,
        stripePaymentId: "pi_mock_reschedule",
      },
    });
    appointmentIds.push(appointment.id);
    return appointment;
  }

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3037, resolve));
    baseUrl = "http://localhost:3037";

    const [patient, other, doctor] = await Promise.all(
      (["patient", "patient", "clinician"] as const).map((role, i) =>
        prisma.user.create({ data: { email: `resched-${role}-${i}-${tag}@example.test`, passwordHash: "x", role } }),
      ),
    );
    userIds.push(patient.id, other.id, doctor.id);
    patientUserId = patient.id;
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });
    otherToken = signAccessToken({ sub: other.id, role: "patient", sessionId: crypto.randomUUID() });
    const profile = await prisma.patientProfile.create({ data: { userId: patient.id, firstName: "Synthetic", lastName: `Mover${tag}` } });
    const otherProfile = await prisma.patientProfile.create({ data: { userId: other.id, firstName: "Synthetic", lastName: `Other${tag}` } });
    patientProfileId = profile.id;
    profileIds.push(profile.id, otherProfile.id);

    const clinician = await prisma.clinicianProfile.create({
      data: { userId: doctor.id, fullName: "Synthetic Dentist", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    clinicianId = clinician.id;
    clinicianProfileIds.push(clinician.id);
    await prisma.clinicianRotaBlock.createMany({ data: [{ clinicianId: clinician.id, weekday: 1, startMinute: 540, endMinute: 720 }] });

    const clinic = await prisma.clinic.create({
      data: { name: `Synthetic Clinic ${tag}`, address: "1 Example Street", postcode: "ZZ1 1ZZ", city: "Testville", phone: "000", operatingHours: "Test hours" },
    });
    clinicId = clinic.id;
    clinicIds.push(clinic.id);
    await prisma.clinicOpeningHours.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ clinicId: clinic.id, weekday, opensMinute: 0, closesMinute: 1440 })),
    });

    serviceId = (await prisma.service.findFirstOrThrow({ where: { durationMinutes: 30, supportedChannels: { has: "clinic" } } })).id;
  });

  afterAll(async () => {
    await prisma.scheduledNotification.deleteMany({ where: { userId: patientUserId } });
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { id: { in: clinicianProfileIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await prisma.clinic.deleteMany({ where: { id: { in: clinicIds } } });
    // Users stay: audit_logs has a foreign key to users with ON DELETE SET NULL,
    // which would change rows already hashed into the audit chain.
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("moves a confirmed booking, keeps the deposit and dentist, redoes the reminders and records it", async () => {
    const day = monday(5);
    const booking = await makeBooking(at(day, 9 * 60));
    await scheduleAppointmentReminderLadder(booking.id);
    const remindersFor = async () =>
      (await prisma.scheduledNotification.findMany({ where: { userId: patientUserId, status: "pending" } }))
        .filter((n) => (n.data as { appointmentId?: string } | null)?.appointmentId === booking.id)
        .map((n) => n.scheduledFor.getTime())
        .sort();
    const before = await remindersFor();
    expect(before.length).toBeGreaterThan(0);

    const target = at(day, 11 * 60);
    const res = await reschedule(booking.id, target.toISOString());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: booking.id, status: "confirmed", changed: true, clinicianId });
    expect(res.body.startTimeUtc).toBe(target.toISOString());
    expect(res.body.endTimeUtc).toBe(new Date(target.getTime() + 30 * 60000).toISOString());

    const after = await prisma.appointment.findUniqueOrThrow({ where: { id: booking.id } });
    expect(after.startTimeUtc.getTime()).toBe(target.getTime());
    // No money moved: the deposit and payment are exactly as they were.
    expect(after).toMatchObject({ depositPaidPence: 1500, stripePaymentId: "pi_mock_reschedule", status: "confirmed", clinicianId });

    // Reminders now follow the new time: same count, each two hours later.
    const reminded = await remindersFor();
    expect(reminded).toHaveLength(before.length);
    expect(reminded).toEqual(before.map((t) => t + 2 * 3600_000));

    const audit = await prisma.auditLog.findFirst({ where: { action: "appointment.rescheduled", resourceId: booking.id } });
    expect(audit?.metadata).toMatchObject({ fromStartUtc: at(day, 9 * 60).toISOString(), toStartUtc: target.toISOString(), channel: "clinic" });
  });

  it("treats asking for the time it already has as done, so a retry isn't an error", async () => {
    const day = monday(12);
    const booking = await makeBooking(at(day, 10 * 60));
    const res = await reschedule(booking.id, at(day, 10 * 60).toISOString());
    expect(res.status).toBe(200);
    expect(res.body.changed).toBe(false);
  });

  it("refuses inside 48 hours and says to cancel and rebook, changing nothing", async () => {
    const soon = new Date(Date.now() + 24 * 3600_000);
    const booking = await makeBooking(soon);
    const res = await reschedule(booking.id, at(monday(5), 9 * 60).toISOString());
    expect(res.status).toBe(409);
    expect(String(res.body.error)).toMatch(/48 hours/);
    expect(String(res.body.error)).toMatch(/cancel it and book again/);
    expect(res.body.hoursUntilVisit).toBeLessThan(RESCHEDULE_MIN_NOTICE_HOURS);
    expect((await prisma.appointment.findUniqueOrThrow({ where: { id: booking.id } })).startTimeUtc.getTime()).toBe(soon.getTime());
  });

  it("refuses a van visit, an unpaid hold and a cancelled booking", async () => {
    const day = monday(19);
    const target = at(day, 11 * 60).toISOString();
    const van = await prisma.appointment.create({
      data: { patientId: patientProfileId, serviceId, channel: "van", startTimeUtc: at(day, 9 * 60), endTimeUtc: at(day, 9 * 60 + 30), status: "confirmed", totalPricePence: 6500, depositPaidPence: 1500 },
    });
    appointmentIds.push(van.id);
    const hold = await makeBooking(at(day, 9 * 60 + 30), { status: "draft_hold" });
    const cancelled = await makeBooking(at(day, 10 * 60 + 30), { status: "cancelled" });

    const vanRes = await reschedule(van.id, target);
    expect(vanRes.status).toBe(409);
    expect(String(vanRes.body.error)).toMatch(/Van visits can't be rescheduled/);
    expect(String((await reschedule(hold.id, target)).body.error)).toMatch(/deposit/);
    expect(String((await reschedule(cancelled.id, target)).body.error)).toMatch(/Only a confirmed booking/);
  });

  it("refuses a time that is taken, off the dentist's rota, or in the past, changing nothing", async () => {
    const day = monday(26);
    const mine = await makeBooking(at(day, 9 * 60));
    await makeBooking(at(day, 10 * 60), { patientId: profileIds[1] });

    const taken = await reschedule(mine.id, at(day, 10 * 60).toISOString());
    expect(taken.status).toBe(409);
    expect(String(taken.body.error)).toMatch(/isn't available/);

    // 14:00 is outside the dentist's 09:00 to 12:00 rota.
    expect((await reschedule(mine.id, at(day, 14 * 60).toISOString())).status).toBe(409);

    const past = await reschedule(mine.id, new Date(Date.now() - 3600_000).toISOString());
    expect(past.status).toBe(400);

    expect((await prisma.appointment.findUniqueOrThrow({ where: { id: mine.id } })).startTimeUtc.getTime()).toBe(at(day, 9 * 60).getTime());
  });

  it("only lets the patient who owns the booking move it", async () => {
    const day = monday(33);
    const booking = await makeBooking(at(day, 11 * 60 + 30));
    expect((await reschedule(booking.id, at(day, 11 * 60).toISOString(), otherToken)).status).toBe(404);
    expect((await reschedule(crypto.randomUUID(), at(day, 11 * 60).toISOString())).status).toBe(404);
    expect((await reschedule(booking.id, at(day, 11 * 60).toISOString(), "not-a-token")).status).toBe(401);
  });

  it("rejects a bad body", async () => {
    const day = monday(40);
    const booking = await makeBooking(at(day, 9 * 60));
    expect((await reschedule(booking.id, "next tuesday")).status).toBe(400);
    expect((await reschedule(booking.id, undefined)).status).toBe(400);
    const extra = await fetch(`${baseUrl}/api/booking/appointments/${booking.id}/reschedule`, {
      method: "POST",
      headers: { Authorization: `Bearer ${patientToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startTimeUtc: at(day, 10 * 60).toISOString(), clinicianId: crypto.randomUUID() }),
    });
    expect(extra.status).toBe(400);
  });
});

describe("the reschedule rule", () => {
  const now = new Date("2031-03-10T10:00:00Z");
  const inHours = (h: number) => new Date(now.getTime() + h * 3600_000);

  it("allows exactly 48 hours and more, and not a minute less", () => {
    expect(checkReschedulable({ status: "confirmed", channel: "clinic", startTimeUtc: inHours(48) }, now)).toMatchObject({ ok: true });
    expect(checkReschedulable({ status: "confirmed", channel: "video", startTimeUtc: inHours(200) }, now)).toMatchObject({ ok: true });
    expect(checkReschedulable({ status: "confirmed", channel: "clinic", startTimeUtc: new Date(inHours(48).getTime() - 60_000) }, now)).toMatchObject({ ok: false });
  });

  it("agrees with the cancellation policy: 48 hours is where the full refund starts", () => {
    expect(RESCHEDULE_MIN_NOTICE_HOURS).toBe(48);
    expect(getCancellationPolicy({ channel: "clinic", hoursUntilVisit: RESCHEDULE_MIN_NOTICE_HOURS }).refundPercentage).toBe(100);
    expect(getCancellationPolicy({ channel: "clinic", hoursUntilVisit: RESCHEDULE_MIN_NOTICE_HOURS - 0.1 }).refundPercentage).toBeLessThan(100);
  });
});
