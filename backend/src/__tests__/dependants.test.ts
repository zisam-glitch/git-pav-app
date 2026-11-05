import http from "http";
import crypto from "crypto";
import { ageInYears, parseIsoDate } from "../lib/age";
import { londonTimeToUtc } from "../lib/availability";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-34 (decisions log #17): only an adult parent or guardian adds a child,
// only children under 16 are added, and under-16s cannot hold their own
// account. Synthetic data only.
describe("dependants", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const profileIds: string[] = [];
  const appointmentIds: string[] = [];

  const yearsAgo = (years: number, days = 0) => {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - years);
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString().slice(0, 10);
  };

  async function makePatient(label: string, dob: string | null) {
    const user = await prisma.user.create({
      data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role: "patient" },
    });
    userIds.push(user.id);
    const profile = await prisma.patientProfile.create({
      data: { userId: user.id, firstName: "Synthetic", lastName: "Guardian", dob: dob ? new Date(dob) : null },
    });
    profileIds.push(profile.id);
    const token = signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() });
    return { profileId: profile.id, token };
  }

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3011, resolve));
    baseUrl = "http://localhost:3011";
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.dependant.deleteMany({ where: { guardianId: { in: profileIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const addChild = (token: string, body: Record<string, unknown>) =>
    fetch(`${baseUrl}/api/patients/dependants`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Synthetic", lastName: "Child", dob: yearsAgo(8), relationship: "Daughter", consentSigned: true, ...body }),
    });

  it("adds a child under 16 for an adult guardian", async () => {
    const { token } = await makePatient("adult", yearsAgo(35));
    expect((await addChild(token, {})).status).toBe(201);
    // A child one day short of 16 is still under 16.
    expect((await addChild(token, { dob: yearsAgo(16, -1) })).status).toBe(201);
  });

  it("asks for the guardian's date of birth first", async () => {
    const { token } = await makePatient("no-dob", null);
    expect((await addChild(token, {})).status).toBe(422);
  });

  it("refuses a guardian under 18", async () => {
    const { token } = await makePatient("minor", yearsAgo(17));
    expect((await addChild(token, {})).status).toBe(403);
  });

  it("refuses a child aged 16 or over", async () => {
    const { token } = await makePatient("adult-16", yearsAgo(40));
    expect((await addChild(token, { dob: yearsAgo(16) })).status).toBe(422);
  });

  it("refuses relationships other than parent or guardian, and missing confirmation", async () => {
    const { token } = await makePatient("adult-other", yearsAgo(40));
    expect((await addChild(token, { relationship: "Other" })).status).toBe(400);
    expect((await addChild(token, { consentSigned: false })).status).toBe(400);
    expect((await addChild(token, { dob: "2020-02-30" })).status).toBe(400);
    expect((await addChild(token, { dob: yearsAgo(-1) })).status).toBe(400);
  });

  it("does not let an under-16 set up their own profile", async () => {
    const { profileId, token } = await makePatient("self", null);
    const put = (dob: string) =>
      fetch(`${baseUrl}/api/patients/${profileId}/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ dob }),
      });
    expect((await put(yearsAgo(14))).status).toBe(422);
    expect((await put(yearsAgo(16))).status).toBe(200);
  });

  it("lets a guardian book for their own child only, and shows the child to the clinician", async () => {
    const guardian = await makePatient("booker", yearsAgo(38));
    const stranger = await makePatient("stranger", yearsAgo(38));
    const child = await (await addChild(guardian.token, { firstName: "Synthetic", lastName: "Child" })).json() as any;

    const clinicianUser = await prisma.user.create({
      data: { email: `dep-clinician-${tag}@example.test`, passwordHash: "x", role: "clinician" },
    });
    userIds.push(clinicianUser.id);
    const clinician = await prisma.clinicianProfile.create({
      data: {
        userId: clinicianUser.id,
        fullName: "Synthetic Clinician",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    // Works every day 09:00 to 17:00, so the booking below is a real slot.
    await prisma.clinicianRotaBlock.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ clinicianId: clinician.id, weekday, startMinute: 540, endMinute: 1020 })),
    });
    const clinicianToken = signAccessToken({ sub: clinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });
    // Booked as a video consult below, so it must be a service that offers video.
    const service = await prisma.service.findFirstOrThrow({
      where: { supportedChannels: { has: "video" } },
      select: { id: true },
    });

    const book = (token: string, dependantId: string, dayOffset: number) =>
      fetch(`${baseUrl}/api/booking/appointments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          channel: "video",
          clinicianId: clinician.id,
          dependantId,
          startTimeUtc: londonTimeToUtc(new Date(Date.now() + dayOffset * 86400000).toISOString().slice(0, 10), 540).toISOString(),
        }),
      }).then(async (r) => ({ status: r.status, body: (await r.json()) as any }));

    expect((await book(stranger.token, child.id, 20)).status).toBe(404);
    const booked = await book(guardian.token, child.id, 21);
    expect(booked.status).toBe(201);
    appointmentIds.push(booked.body.id);
    expect(booked.body.dependant).toMatchObject({ id: child.id, firstName: "Synthetic" });

    // Confirm it so it appears on the clinician's schedule.
    await prisma.appointment.update({ where: { id: booked.body.id }, data: { status: "confirmed" } });
    const schedule = (await (await fetch(`${baseUrl}/api/booking/appointments`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    })).json()) as any[];
    expect(schedule.find((a) => a.id === booked.body.id)?.dependant).toMatchObject({ id: child.id, age: 8 });

    // The clinician sees the child as the patient, not the guardian's history.
    const context = (await (await fetch(`${baseUrl}/api/booking/appointments/${booked.body.id}/clinical-context`, {
      headers: { Authorization: `Bearer ${clinicianToken}` },
    })).json()) as any;
    expect(context.patient).toMatchObject({ id: child.id, lastName: "Child" });
    expect(context.guardian).toMatchObject({ id: guardian.profileId });
    expect(context.medicalHistory).toBeNull();

    // A child with visit records can't be unlinked.
    const unlink = await fetch(`${baseUrl}/api/patients/dependants/${child.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${guardian.token}` },
    });
    expect(unlink.status).toBe(409);
  });

  it("updates a dependant's details with validation and authorization checks (DP-1)", async () => {
    const guardian = await makePatient("updater", yearsAgo(35));
    const stranger = await makePatient("stranger-updater", yearsAgo(35));
    const childRes = await addChild(guardian.token, { firstName: "Initial", lastName: "Name", dob: yearsAgo(6) });
    const child = (await childRes.json()) as any;

    const patch = (token: string, id: string, body: Record<string, unknown>) =>
      fetch(`${baseUrl}/api/patients/dependants/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

    // Stranger cannot update
    expect((await patch(stranger.token, child.id, { firstName: "Hacked" })).status).toBe(404);

    // Guardian cannot update DOB to 16 or over
    expect((await patch(guardian.token, child.id, { dob: yearsAgo(16) })).status).toBe(422);

    // Guardian cannot update DOB to invalid or future date
    expect((await patch(guardian.token, child.id, { dob: "invalid-date" })).status).toBe(400);
    expect((await patch(guardian.token, child.id, { dob: yearsAgo(-1) })).status).toBe(400);

    // Guardian updates name and relationship successfully
    const updated = await patch(guardian.token, child.id, { firstName: "UpdatedName", relationship: "Ward" });
    expect(updated.status).toBe(200);
    const body = (await updated.json()) as any;
    expect(body.firstName).toBe("UpdatedName");
    expect(body.relationship).toBe("Ward");

    // Persisted in database
    const dbChild = await prisma.dependant.findUnique({ where: { id: child.id } });
    expect(dbChild?.firstName).toBe("UpdatedName");
    expect(dbChild?.relationship).toBe("Ward");
  });

  it("counts age in whole years", () => {
    expect(ageInYears(parseIsoDate("2010-06-15")!, new Date("2026-06-14T12:00:00Z"))).toBe(15);
    expect(ageInYears(parseIsoDate("2010-06-15")!, new Date("2026-06-15T00:00:00Z"))).toBe(16);
    expect(parseIsoDate("2024-02-29")).not.toBeNull();
    expect(parseIsoDate("2023-02-29")).toBeNull();
  });
});
