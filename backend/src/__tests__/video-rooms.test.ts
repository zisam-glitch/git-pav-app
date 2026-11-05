import http from "http";
import crypto from "crypto";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-07: each video appointment has one private Daily room, and only its
// patient and clinician get a meeting token for it; the patient only once the
// clinician has let them in. Daily's REST API is stubbed; no network calls.
// Synthetic data only.
describe("video consultation rooms", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const profileIds: string[] = [];
  const appointmentIds: string[] = [];
  let serviceId = "";
  const originalEnv = { DAILY_API_KEY: process.env.DAILY_API_KEY };
  const realFetch = globalThis.fetch;
  const dailyCalls: { method: string; path: string; body: any }[] = [];
  const dailyRooms = new Map<string, { name: string; url: string; privacy: string }>();

  // Just enough of Daily's REST API: rooms are looked up and created by name,
  // and meeting tokens echo back their properties.
  async function fakeDaily(url: string, init?: RequestInit) {
    const path = url.slice("https://api.daily.co/v1".length);
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    dailyCalls.push({ method, path, body });
    const json = (value: unknown, status = 200) =>
      new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
    if (method === "GET" && path.startsWith("/rooms/")) {
      const room = dailyRooms.get(path.slice("/rooms/".length));
      return room ? json(room) : json({ error: "not-found" }, 404);
    }
    if (method === "POST" && path === "/rooms") {
      const room = { name: body.name, url: `https://pav-unit.daily.co/${body.name}`, privacy: body.privacy };
      dailyRooms.set(body.name, room);
      return json(room);
    }
    if (method === "POST" && path === "/meeting-tokens") return json({ token: `tok_${body.properties.room_name}` });
    return json({ error: "unexpected" }, 400);
  }

  async function makeUser(role: "patient" | "clinician", label: string) {
    const user = await prisma.user.create({ data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role } });
    userIds.push(user.id);
    return { userId: user.id, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  async function setup(label: string, channel: "video" | "clinic" = "video") {
    const patient = await makeUser("patient", `${label}-patient`);
    const profile = await prisma.patientProfile.create({ data: { userId: patient.userId, firstName: "Synthetic", lastName: "Patient" } });
    profileIds.push(profile.id);
    const clinicianUser = await makeUser("clinician", `${label}-dentist`);
    const clinician = await prisma.clinicianProfile.create({
      data: { userId: clinicianUser.userId, fullName: "Synthetic Dentist", gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    const start = new Date(Date.now() + 5 * 60000);
    const appt = await prisma.appointment.create({
      data: {
        patientId: profile.id,
        clinicianId: clinician.id,
        serviceId,
        channel,
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 1800000),
        status: "confirmed",
        totalPricePence: 0,
      },
    });
    appointmentIds.push(appt.id);
    return { appointmentId: appt.id, patientToken: patient.token, clinicianToken: clinicianUser.token };
  }

  const post = (path: string, token: string, body: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: (await r.json()) as any }));

  beforeAll(async () => {
    // Read when the video routes load.
    process.env.DAILY_API_KEY = "daily_unit_not_a_real_key";
    globalThis.fetch = (async (input: any, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      return url.startsWith("https://api.daily.co/v1/") ? fakeDaily(url, init) : realFetch(input, init);
    }) as typeof fetch;
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3015, resolve));
    baseUrl = "http://localhost:3015";
    serviceId = (await prisma.service.findFirstOrThrow()).id;
  }, 15000);

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    globalThis.fetch = realFetch;
    // process.env is shared by later test files in this jest worker.
    if (originalEnv.DAILY_API_KEY === undefined) delete process.env.DAILY_API_KEY;
    else process.env.DAILY_API_KEY = originalEnv.DAILY_API_KEY;
  });

  it("gives the clinician an owner token for a private room named after the appointment", async () => {
    const { appointmentId, clinicianToken } = await setup("owner");
    dailyCalls.length = 0;

    const res = await post("/api/video/rooms", clinicianToken, { appointmentId });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ roomName: `pav-${appointmentId}`, token: `tok_pav-${appointmentId}`, isOwner: true });

    const created = dailyCalls.find((c) => c.method === "POST" && c.path === "/rooms");
    expect(created?.body).toMatchObject({ name: `pav-${appointmentId}`, privacy: "private" });
    const token = dailyCalls.find((c) => c.path === "/meeting-tokens");
    expect(token?.body.properties).toMatchObject({ room_name: `pav-${appointmentId}`, is_owner: true, eject_at_token_exp: true });
  });

  it("enforces short token expiry and eject_at_token_exp on meeting tokens for clinician and patient (BE-16)", async () => {
    const { appointmentId, patientToken, clinicianToken } = await setup("expiry");
    const appt = await prisma.appointment.findUniqueOrThrow({ where: { id: appointmentId } });
    const expectedExp = Math.floor(appt.endTimeUtc.getTime() / 1000) + 30 * 60;
    dailyCalls.length = 0;

    // 1. Clinician token
    const clinRes = await post("/api/video/rooms", clinicianToken, { appointmentId });
    expect(clinRes.status).toBe(201);
    const clinTokenCall = dailyCalls.find((c) => c.path === "/meeting-tokens");
    expect(clinTokenCall).toBeDefined();
    expect(clinTokenCall?.body.properties.eject_at_token_exp).toBe(true);
    expect(clinTokenCall?.body.properties.exp).toBe(expectedExp);
    expect(new Date(clinRes.body.expiresAt).getTime()).toBe(expectedExp * 1000);

    // 2. Admit patient and get patient token
    await post("/api/video/admit-patient", clinicianToken, { appointmentId });
    dailyCalls.length = 0;
    const patRes = await post("/api/video/rooms", patientToken, { appointmentId });
    expect(patRes.status).toBe(201);
    const patTokenCall = dailyCalls.find((c) => c.path === "/meeting-tokens");
    expect(patTokenCall).toBeDefined();
    expect(patTokenCall?.body.properties.eject_at_token_exp).toBe(true);
    expect(patTokenCall?.body.properties.exp).toBe(expectedExp);
    expect(new Date(patRes.body.expiresAt).getTime()).toBe(expectedExp * 1000);
  });

  it("keeps the patient out until the clinician admits them, then reuses the same room", async () => {
    const { appointmentId, patientToken, clinicianToken } = await setup("admit");

    const early = await post("/api/video/rooms", patientToken, { appointmentId });
    expect(early.status).toBe(409);
    expect(early.body.token).toBeUndefined();

    expect((await post("/api/video/rooms", clinicianToken, { appointmentId })).status).toBe(201);
    expect((await post("/api/video/admit-patient", clinicianToken, { appointmentId })).status).toBe(200);

    dailyCalls.length = 0;
    const joined = await post("/api/video/rooms", patientToken, { appointmentId });
    expect(joined.status).toBe(201);
    expect(joined.body).toMatchObject({ roomName: `pav-${appointmentId}`, isOwner: false });
    // The existing room was found, not created again.
    expect(dailyCalls.some((c) => c.method === "POST" && c.path === "/rooms")).toBe(false);
    expect(dailyCalls.find((c) => c.path === "/meeting-tokens")?.body.properties).toMatchObject({ is_owner: false, user_name: "Synthetic" });
  });

  it("answers anyone outside the appointment as if it didn't exist", async () => {
    const { appointmentId } = await setup("private");
    const stranger = await makeUser("patient", "stranger");
    const otherDentist = await makeUser("clinician", "other-dentist");

    expect((await post("/api/video/rooms", stranger.token, { appointmentId })).status).toBe(404);
    expect((await post("/api/video/rooms", otherDentist.token, { appointmentId })).status).toBe(404);
    expect((await post("/api/video/rooms", stranger.token, { appointmentId: crypto.randomUUID() })).status).toBe(404);
  });

  it("won't open a room for a clinic visit or a cancelled consultation", async () => {
    const clinic = await setup("clinic", "clinic");
    expect((await post("/api/video/rooms", clinic.clinicianToken, { appointmentId: clinic.appointmentId })).status).toBe(409);
    expect((await post("/api/video/admit-patient", clinic.clinicianToken, { appointmentId: clinic.appointmentId })).status).toBe(409);

    const cancelled = await setup("cancelled");
    await prisma.appointment.update({ where: { id: cancelled.appointmentId }, data: { status: "cancelled" } });
    expect((await post("/api/video/rooms", cancelled.clinicianToken, { appointmentId: cancelled.appointmentId })).status).toBe(409);
  });
});
