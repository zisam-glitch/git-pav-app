import http from "http";
import crypto from "crypto";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import app from "../server";

// DB-05: staff can see consent decisions and that subject access bundles were
// made, without IP addresses, free-form metadata, file keys or the bundles
// themselves. Synthetic data only.
describe("admin consent records and SAR exports", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const profileIds: string[] = [];
  let adminToken = "";
  let patientToken = "";
  let clinicianToken = "";
  let profileA = "";
  let profileB = "";
  const vaultIds: string[] = [];

  const get = <T = Record<string, unknown>>(path: string, token = adminToken) =>
    fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(async (r) => ({
      status: r.status,
      text: await r.clone().text(),
      body: (await r.json()) as T,
    }));

  type Consent = { patientId: string; patientName: string; consentType: string; isGranted: boolean; withdrawnAt: string | null; lawfulBasis: string };
  type Export = { id: string; patientId: string; patientName: string; fileSizeBytes: number };

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3033, resolve));
    baseUrl = "http://localhost:3033";

    const roles = ["admin", "patient", "patient", "clinician"] as const;
    const users = await Promise.all(
      roles.map((role, i) => prisma.user.create({ data: { email: `consent-${role}-${i}-${tag}@example.test`, passwordHash: "x", role } })),
    );
    users.forEach((u) => userIds.push(u.id));
    const [admin, patientA, patientB, clinician] = users;
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
    patientToken = signAccessToken({ sub: patientA.id, role: "patient", sessionId: crypto.randomUUID() });
    clinicianToken = signAccessToken({ sub: clinician.id, role: "clinician", sessionId: crypto.randomUUID() });

    const a = await prisma.patientProfile.create({ data: { userId: patientA.id, firstName: "Synthetic", lastName: `Consenter${tag}` } });
    const b = await prisma.patientProfile.create({ data: { userId: patientB.id, firstName: "Synthetic", lastName: `Withdrawer${tag}` } });
    profileA = a.id;
    profileB = b.id;
    profileIds.push(a.id, b.id);

    await prisma.consentRecord.createMany({
      data: [
        { patientProfileId: a.id, consentType: "data_processing", version: 1, lawfulBasis: "contract", isGranted: true, grantedAt: new Date("2031-03-10T09:00:00Z"), ipAddress: "203.0.113.77", metadata: { note: `SECRET-META-${tag}` } },
        { patientProfileId: b.id, consentType: "marketing", version: 1, lawfulBasis: "consent", isGranted: false, grantedAt: new Date("2031-03-11T09:00:00Z"), withdrawnAt: new Date("2031-03-12T09:00:00Z"), ipAddress: "203.0.113.78" },
      ],
    });

    const sar = await prisma.documentVault.create({
      data: { patientId: a.id, docType: "gdpr_sar_export", title: "GDPR Subject Access Bundle", fileKey: `gdpr-sar/${a.id}/SECRET-KEY-${tag}.json`, fileSizeBytes: "2048", createdAt: new Date("2031-03-11T12:00:00Z") },
    });
    const other = await prisma.documentVault.create({
      data: { patientId: a.id, docType: "xray", title: "Synthetic X-ray", fileKey: `xray/SECRET-XRAY-${tag}.png`, fileSizeBytes: "10" },
    });
    vaultIds.push(sar.id, other.id);
  });

  afterAll(async () => {
    await prisma.documentVault.deleteMany({ where: { id: { in: vaultIds } } });
    await prisma.consentRecord.deleteMany({ where: { patientProfileId: { in: profileIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    // Users stay: audit_logs has a foreign key to users with ON DELETE SET NULL,
    // which would change rows already hashed into the audit chain.
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("lists consent decisions with the patient's name, newest first", async () => {
    const res = await get<{ consents: Consent[]; total: number }>(`/api/admin/consents?limit=100`);
    expect(res.status).toBe(200);
    const ours = res.body.consents.filter((c) => [profileA, profileB].includes(c.patientId));
    expect(ours.map((c) => c.consentType)).toEqual(["marketing", "data_processing"]);
    expect(ours[0]).toMatchObject({ patientName: `Synthetic Withdrawer${tag}`, isGranted: false, withdrawnAt: "2031-03-12T09:00:00.000Z", lawfulBasis: "consent" });
    expect(ours[1]).toMatchObject({ patientName: `Synthetic Consenter${tag}`, isGranted: true, withdrawnAt: null });
  });

  it("never carries IP addresses or free-form metadata", async () => {
    const res = await get(`/api/admin/consents?limit=100`);
    for (const secret of ["203.0.113.77", "203.0.113.78", `SECRET-META-${tag}`, "ipAddress", "metadata"]) {
      expect(res.text).not.toContain(secret);
    }
  });

  it("filters consents by type, by withdrawn or granted, and by patient", async () => {
    const withdrawn = await get<{ consents: Consent[] }>(`/api/admin/consents?status=withdrawn&limit=100`);
    expect(withdrawn.body.consents.filter((c) => [profileA, profileB].includes(c.patientId)).map((c) => c.patientId)).toEqual([profileB]);

    const granted = await get<{ consents: Consent[] }>(`/api/admin/consents?status=granted&limit=100`);
    expect(granted.body.consents.filter((c) => [profileA, profileB].includes(c.patientId)).map((c) => c.patientId)).toEqual([profileA]);

    const byType = await get<{ consents: Consent[] }>(`/api/admin/consents?consentType=marketing&patientId=${profileB}`);
    expect(byType.body.consents.map((c) => c.patientId)).toEqual([profileB]);

    const none = await get<{ consents: Consent[]; total: number }>(`/api/admin/consents?consentType=marketing&patientId=${profileA}`);
    expect(none.body).toMatchObject({ consents: [], total: 0 });
  });

  it("lists SAR bundles only, without file keys or contents", async () => {
    const res = await get<{ exports: Export[]; total: number }>(`/api/admin/sar-exports?patientId=${profileA}&limit=100`);
    expect(res.status).toBe(200);
    expect(res.body.exports).toHaveLength(1);
    expect(res.body.exports[0]).toMatchObject({ id: vaultIds[0], patientId: profileA, patientName: `Synthetic Consenter${tag}`, fileSizeBytes: 2048 });
    for (const secret of [`SECRET-KEY-${tag}`, `SECRET-XRAY-${tag}`, "fileKey", "gdpr-sar/", "Synthetic X-ray"]) {
      expect(res.text).not.toContain(secret);
    }
  });

  it("filters SAR bundles by UK day and pages them", async () => {
    const inside = await get<{ exports: Export[] }>(`/api/admin/sar-exports?patientId=${profileA}&from=2031-03-11&to=2031-03-11`);
    expect(inside.body.exports.map((e) => e.id)).toEqual([vaultIds[0]]);
    const outside = await get<{ exports: Export[] }>(`/api/admin/sar-exports?patientId=${profileA}&from=2031-03-12&to=2031-03-13`);
    expect(outside.body.exports).toEqual([]);
    const page2 = await get<{ exports: Export[]; total: number; page: number }>(`/api/admin/sar-exports?patientId=${profileA}&limit=1&page=2`);
    expect(page2.body).toMatchObject({ exports: [], total: 1, page: 2 });
  });

  it("rejects bad input and anyone who isn't staff", async () => {
    for (const path of [
      `/api/admin/consents?consentType=made_up`,
      `/api/admin/consents?status=maybe`,
      `/api/admin/consents?patientId=not-an-id`,
      `/api/admin/consents?surprise=1`,
      `/api/admin/sar-exports?from=2031-02-30x`,
      `/api/admin/sar-exports?patientId=not-an-id`,
    ]) {
      expect((await get(path)).status).toBe(400);
    }
    for (const path of [`/api/admin/consents`, `/api/admin/sar-exports`]) {
      expect((await get(path, patientToken)).status).toBe(403);
      expect((await get(path, clinicianToken)).status).toBe(403);
      expect((await fetch(`${baseUrl}${path}`)).status).toBe(401);
    }
  });
});
