import http from "http";
import crypto from "crypto";
import app from "../server";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";

// Staff choose which clinicians the website's team page lists, edit their
// public profile, and set the order. The app and the website read the same
// profile. Synthetic data only.
describe("dentist profiles for the website", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  let adminToken = "";
  let patientToken = "";
  const clinicianIds: string[] = [];
  // 99xxxx is above any GDC number issued so far, so these can't match a real registrant.
  // The top of the range is left out because 999991 and 999992 belong to the seed's clinicians.
  const gdcPrefix = `99${crypto.randomInt(100, 999)}`;
  const gdc = (n: number) => `${gdcPrefix}${n}`;

  async function makeUser(role: "patient" | "admin" | "clinician", label: string) {
    const user = await prisma.user.create({
      data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role },
    });
    userIds.push(user.id);
    return { userId: user.id, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  async function makeClinician(label: string, gdcNumber: string) {
    const { userId } = await makeUser("clinician", label);
    const profile = await prisma.clinicianProfile.create({
      data: { userId, fullName: `Dr Synthetic ${label}`, gdcNumber, roleTitle: "Dentist", specialisms: [] },
    });
    clinicianIds.push(profile.id);
    return profile.id;
  }

  const send = <T = Record<string, unknown>>(method: string, path: string, token?: string, body?: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: (await r.json()) as T }));

  const listed = async () =>
    (await send<{ id: string }[]>("GET", "/api/services/dentists")).body
      .map((d) => d.id)
      .filter((id) => clinicianIds.includes(id));

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3028, resolve));
    baseUrl = "http://localhost:3028";
    adminToken = (await makeUser("admin", "dent-admin")).token;
    patientToken = (await makeUser("patient", "dent-patient")).token;
  });

  afterAll(async () => {
    await prisma.clinicianProfile.deleteMany({ where: { id: { in: clinicianIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("lists only the clinicians staff switched on, in their order", async () => {
    const a = await makeClinician("dent-a", gdc(1));
    const b = await makeClinician("dent-b", gdc(2));
    expect(await listed()).toEqual([]);

    const edit = await send("PATCH", `/api/admin/clinicians/${a}/profile`, adminToken, {
      roleTitle: "Visiting implantologist",
      specialisms: ["Dental implants"],
      bio: "Synthetic bio.",
      photoUrl: "https://images.example.test/a.jpg",
      showOnWebsite: true,
    });
    expect(edit.status).toBe(200);
    expect(edit.body).toMatchObject({ roleTitle: "Visiting implantologist", showOnWebsite: true });
    await send("PATCH", `/api/admin/clinicians/${b}/profile`, adminToken, { showOnWebsite: true });

    expect((await send("PUT", "/api/admin/clinicians/website-order", adminToken, { clinicianIds: [b, a] })).status).toBe(200);
    expect(await listed()).toEqual([b, a]);

    const publicRow = (await send<{ id: string }[]>("GET", "/api/services/dentists")).body.find((d) => d.id === a);
    expect(publicRow).toEqual({
      id: a,
      fullName: "Dr Synthetic dent-a",
      gdcNumber: expect.any(String),
      roleTitle: "Visiting implantologist",
      specialisms: ["Dental implants"],
      bio: "Synthetic bio.",
      photoUrl: "https://images.example.test/a.jpg",
    });

    // Hiding takes them off the website but keeps them in the app.
    await send("PATCH", `/api/admin/clinicians/${b}/profile`, adminToken, { showOnWebsite: false });
    expect(await listed()).toEqual([a]);
    const app = (await send<{ id: string }[]>("GET", "/api/services/clinicians")).body;
    expect(app.map((c) => c.id)).toEqual(expect.arrayContaining([a, b]));
  });

  it("refuses bad input and non-staff", async () => {
    const c = await makeClinician("dent-c", gdc(3));
    expect((await send("PATCH", `/api/admin/clinicians/${c}/profile`, adminToken, { gdcNumber: "12345" })).status).toBe(400);
    expect((await send("PATCH", `/api/admin/clinicians/${c}/profile`, adminToken, { photoUrl: "http://insecure.example.test/a.jpg" })).status).toBe(400);
    expect((await send("PATCH", `/api/admin/clinicians/${c}/profile`, adminToken, { userId: crypto.randomUUID() })).status).toBe(400);
    expect((await send("PATCH", `/api/admin/clinicians/${crypto.randomUUID()}/profile`, adminToken, { bio: "x" })).status).toBe(404);
    expect((await send("PUT", "/api/admin/clinicians/website-order", adminToken, { clinicianIds: [c, crypto.randomUUID()] })).status).toBe(404);
    expect((await send("PATCH", `/api/admin/clinicians/${c}/profile`, patientToken, { showOnWebsite: true })).status).toBe(403);
    expect((await send("PATCH", `/api/admin/clinicians/${c}/profile`, undefined, { showOnWebsite: true })).status).toBe(401);
  });
});
