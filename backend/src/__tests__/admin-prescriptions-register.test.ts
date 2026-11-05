import http from "http";
import crypto from "crypto";
import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import app from "../server";
import { uniqueGdc } from "../../test/unique-gdc";

// DB-05: the staff prescriptions register says a prescription exists, who
// issued it and when, whether it was signed and whether it was sent. It must
// never carry what was prescribed or for whom. Synthetic data only.
describe("admin prescriptions register", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const prescriptionIds: string[] = [];
  let clinicianId = "";
  let otherClinicianId = "";
  let adminToken = "";
  let patientToken = "";
  let clinicianToken = "";

  const get = <T = Record<string, unknown>>(path: string, token = adminToken) =>
    fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(async (r) => ({
      status: r.status,
      text: await r.clone().text(),
      body: (await r.json()) as T,
    }));

  type Row = { id: string; reference: string | null; clinicianName: string | null; signed: boolean; dispatchedAt: string | null };

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3032, resolve));
    baseUrl = "http://localhost:3032";

    const [admin, patient, clinicianUser, otherUser] = await Promise.all(
      (["admin", "patient", "clinician", "clinician"] as const).map((role, i) =>
        prisma.user.create({ data: { email: `rx-reg-${role}-${i}-${tag}@example.test`, passwordHash: "x", role } }),
      ),
    );
    userIds.push(admin.id, patient.id, clinicianUser.id, otherUser.id);
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });
    clinicianToken = signAccessToken({ sub: clinicianUser.id, role: "clinician", sessionId: crypto.randomUUID() });

    const clinician = await prisma.clinicianProfile.create({
      data: { userId: clinicianUser.id, fullName: `Synthetic Prescriber ${tag}`, gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    const other = await prisma.clinicianProfile.create({
      data: { userId: otherUser.id, fullName: `Synthetic Other ${tag}`, gdcNumber: uniqueGdc(), roleTitle: "Dentist" },
    });
    clinicianId = clinician.id;
    otherClinicianId = other.id;

    const base = {
      dosageInstructions: `SYNTHETIC-DOSE-${tag}`,
      dispensingPharmacy: "Synthetic Pharmacy",
    };
    const signed = await prisma.prescription.create({
      data: {
        ...base,
        clinicianId,
        medicationName: `SYNTHETIC-MEDICINE-${tag}`,
        reference: `PAV-RX-${tag}-1`,
        content: { patientName: `Synthetic Patient ${tag}` },
        signature: "c2lnbmF0dXJl",
        signingKeyId: "test-key",
        dispatchedAt: new Date("2031-03-11T10:00:00Z"),
        createdAt: new Date("2031-03-11T09:00:00Z"),
      },
    });
    const unsigned = await prisma.prescription.create({
      data: { ...base, clinicianId: otherClinicianId, medicationName: `SYNTHETIC-MEDICINE-${tag}`, createdAt: new Date("2031-03-12T09:00:00Z") },
    });
    prescriptionIds.push(signed.id, unsigned.id);
  });

  afterAll(async () => {
    await prisma.prescription.deleteMany({ where: { id: { in: prescriptionIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { id: { in: [clinicianId, otherClinicianId] } } });
    // Users stay: audit_logs has a foreign key to users with ON DELETE SET NULL,
    // which would change rows already hashed into the audit chain.
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("lists who issued each prescription, when, and whether it was signed and sent", async () => {
    const res = await get<{ prescriptions: Row[]; total: number }>(`/api/admin/prescriptions?from=2031-03-11&to=2031-03-12&limit=100`);
    expect(res.status).toBe(200);
    const ours = res.body.prescriptions.filter((p) => prescriptionIds.includes(p.id));
    // Newest first.
    expect(ours.map((p) => p.id)).toEqual([prescriptionIds[1], prescriptionIds[0]]);
    expect(ours[0]).toMatchObject({ clinicianName: `Synthetic Other ${tag}`, signed: false, dispatchedAt: null, reference: null });
    expect(ours[1]).toMatchObject({
      clinicianName: `Synthetic Prescriber ${tag}`,
      reference: `PAV-RX-${tag}-1`,
      signed: true,
      dispatchedAt: "2031-03-11T10:00:00.000Z",
    });
  });

  it("never carries what was prescribed, for whom, or the signature itself", async () => {
    const res = await get(`/api/admin/prescriptions?from=2031-03-11&to=2031-03-12&limit=100`);
    expect(res.status).toBe(200);
    for (const secret of [`SYNTHETIC-MEDICINE-${tag}`, `SYNTHETIC-DOSE-${tag}`, `Synthetic Patient ${tag}`, "c2lnbmF0dXJl", "Synthetic Pharmacy"]) {
      expect(res.text).not.toContain(secret);
    }
  });

  it("filters by day (UK) and by dentist", async () => {
    const day = await get<{ prescriptions: Row[] }>(`/api/admin/prescriptions?from=2031-03-12&to=2031-03-12&limit=100`);
    expect(day.body.prescriptions.filter((p) => prescriptionIds.includes(p.id)).map((p) => p.id)).toEqual([prescriptionIds[1]]);

    const byClinician = await get<{ prescriptions: Row[] }>(`/api/admin/prescriptions?clinicianId=${clinicianId}&limit=100`);
    expect(byClinician.body.prescriptions.map((p) => p.id)).toEqual([prescriptionIds[0]]);
  });

  it("pages the list", async () => {
    const page = await get<{ prescriptions: Row[]; total: number; page: number; limit: number }>(`/api/admin/prescriptions?clinicianId=${clinicianId}&limit=1&page=2`);
    expect(page.status).toBe(200);
    expect(page.body).toMatchObject({ prescriptions: [], total: 1, page: 2, limit: 1 });
  });

  it("rejects bad input and anyone who isn't staff", async () => {
    expect((await get(`/api/admin/prescriptions?from=2031-02-30x`)).status).toBe(400);
    expect((await get(`/api/admin/prescriptions?clinicianId=not-an-id`)).status).toBe(400);
    expect((await get(`/api/admin/prescriptions?surprise=1`)).status).toBe(400);
    expect((await get(`/api/admin/prescriptions`, patientToken)).status).toBe(403);
    expect((await get(`/api/admin/prescriptions`, clinicianToken)).status).toBe(403);
    const anon = await fetch(`${baseUrl}/api/admin/prescriptions`);
    expect(anon.status).toBe(401);
  });
});
