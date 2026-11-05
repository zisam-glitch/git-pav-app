import http from "http";
import crypto from "crypto";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-09 (REQ-SEC-003): every patient-scoped endpoint, called by each kind of
// stranger to the record, is refused. A clinician in the patient's care can
// read the record but can't change the patient's own details or answer a
// treatment plan for them (PT-1, PT-2). Synthetic data only.
describe("care-team access matrix", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const appointmentIds: string[] = [];
  let serviceId = "";

  type Role = "patient" | "clinician" | "operator" | "admin";

  async function makeUser(role: Role, label: string) {
    const user = await prisma.user.create({
      data: { email: `care-${label}-${tag}@example.test`, passwordHash: "x", role },
    });
    userIds.push(user.id);
    return { userId: user.id, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  async function makePatient(label: string) {
    const user = await makeUser("patient", label);
    const profile = await prisma.patientProfile.create({
      data: { userId: user.userId, firstName: "Synthetic", lastName: label },
    });
    return { ...user, profileId: profile.id };
  }

  async function makeClinician(label: string) {
    const user = await makeUser("clinician", label);
    const profile = await prisma.clinicianProfile.create({
      data: {
        userId: user.userId,
        fullName: "Synthetic Clinician",
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    return { ...user, profileId: profile.id };
  }

  const plan = (patientId: string, clinicianId: string) =>
    prisma.treatmentPlan.create({
      data: { patientId, clinicianId, title: "Synthetic plan", totalCostPence: 1000, status: "pending_acceptance" },
    });

  const call = (method: string, path: string, token: string, body?: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: (await r.json().catch(() => null)) as any }));

  let owner: Awaited<ReturnType<typeof makePatient>>;
  let carer: Awaited<ReturnType<typeof makeClinician>>;
  let strangers: Record<string, string>;

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3021, resolve));
    baseUrl = "http://localhost:3021";
    serviceId = (await prisma.service.findFirstOrThrow()).id;

    owner = await makePatient("Owner");
    carer = await makeClinician("carer");
    const start = new Date(Date.now() - 7 * 86400000);
    const visit = await prisma.appointment.create({
      data: {
        patientId: owner.profileId,
        clinicianId: carer.profileId,
        serviceId,
        channel: "clinic",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 1800000),
        status: "completed",
        totalPricePence: 0,
      },
    });
    appointmentIds.push(visit.id);

    strangers = {
      "another patient": (await makePatient("Other")).token,
      "a clinician without a visit": (await makeClinician("unrelated")).token,
      "an admin": (await makeUser("admin", "admin")).token,
      "a van operator": (await makeUser("operator", "operator")).token,
    };
  });

  afterAll(async () => {
    const profiles = await prisma.patientProfile.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
    const patientIds = profiles.map((p) => p.id);
    await prisma.documentVault.deleteMany({ where: { patientId: { in: patientIds } } });
    await prisma.treatmentPlan.deleteMany({ where: { patientId: { in: patientIds } } });
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.clinicianProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { userId: { in: userIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("refuses every stranger on every patient-scoped endpoint", async () => {
    const { id: planId } = await plan(owner.profileId, carer.profileId);
    const endpoints: [string, string, unknown?][] = [
      ["GET", `/api/patients/${owner.profileId}/profile`],
      ["PUT", `/api/patients/${owner.profileId}/profile`, { phone: "+447700900000" }],
      ["GET", `/api/patients/${owner.profileId}/odontogram`],
      ["GET", `/api/patients/${owner.profileId}/plans`],
      ["POST", `/api/patients/${owner.profileId}/plans/${planId}/sign`, { signerName: "Synthetic Signer", consentConfirmed: true }],
      ["POST", `/api/patients/${owner.profileId}/plans/${planId}/decline`],
      ["GET", `/api/patients/${owner.profileId}/documents`],
      ["GET", `/api/prescriptions/patient/${owner.userId}`],
    ];

    const allowed: string[] = [];
    for (const [who, token] of Object.entries(strangers)) {
      for (const [method, path, body] of endpoints) {
        const { status } = await call(method, path, token, body);
        if (status !== 403) allowed.push(`${who}: ${method} ${path} -> ${status}`);
      }
    }
    expect(allowed).toEqual([]);
    expect((await prisma.treatmentPlan.findUniqueOrThrow({ where: { id: planId } })).status).toBe("pending_acceptance");
  });

  it("lets the care clinician read the record but not change the patient's details or answer a plan", async () => {
    const { id: planId } = await plan(owner.profileId, carer.profileId);
    for (const path of ["profile", "odontogram", "plans", "documents"]) {
      expect((await call("GET", `/api/patients/${owner.profileId}/${path}`, carer.token)).status).toBe(200);
    }

    const phoneBefore = (await prisma.user.findUniqueOrThrow({ where: { id: owner.userId } })).phone;
    expect((await call("PUT", `/api/patients/${owner.profileId}/profile`, carer.token, { phone: "+447700900001" })).status).toBe(403);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: owner.userId } })).phone).toBe(phoneBefore);

    expect((await call("POST", `/api/patients/${owner.profileId}/plans/${planId}/sign`, carer.token, { signerName: "Synthetic Signer", consentConfirmed: true })).status).toBe(403);
    expect((await call("POST", `/api/patients/${owner.profileId}/plans/${planId}/decline`, carer.token)).status).toBe(403);
    expect((await prisma.treatmentPlan.findUniqueOrThrow({ where: { id: planId } })).status).toBe("pending_acceptance");
  });

  it("lets the patient answer a plan once, signed in their own name", async () => {
    const { id: planId } = await plan(owner.profileId, carer.profileId);
    const signed = await call("POST", `/api/patients/${owner.profileId}/plans/${planId}/sign`, owner.token, {
      signerName: "Someone Else",
      consentConfirmed: true,
    });
    expect(signed.status).toBe(200);
    expect(signed.body.signerName).toBe("Synthetic Owner");
    expect(signed.body.status).toBe("accepted");

    expect((await call("POST", `/api/patients/${owner.profileId}/plans/${planId}/decline`, owner.token)).status).toBe(409);
    expect((await call("POST", `/api/patients/${owner.profileId}/plans/${planId}/sign`, owner.token, { signerName: "Synthetic Owner", consentConfirmed: true })).status).toBe(409);

    const declined = await plan(owner.profileId, carer.profileId);
    expect((await call("POST", `/api/patients/${owner.profileId}/plans/${declined.id}/decline`, owner.token)).status).toBe(200);
    expect((await call("POST", `/api/patients/${owner.profileId}/plans/${declined.id}/sign`, owner.token, { signerName: "Synthetic Owner", consentConfirmed: true })).status).toBe(409);
  });

  it("keeps the signer's name out of the audit log", async () => {
    const { id: planId } = await plan(owner.profileId, carer.profileId);
    expect((await call("POST", `/api/patients/${owner.profileId}/plans/${planId}/sign`, owner.token, { signerName: "Synthetic Owner", consentConfirmed: true })).status).toBe(200);
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "treatment_plan.signed", resourceId: planId } });
    expect(JSON.stringify(audit.metadata)).not.toContain("Synthetic Owner");
  });

  it("BE-18 (D-06): records what was shown (plan version hash), who, when, device, and truthful copy", async () => {
    const { id: planId } = await plan(owner.profileId, carer.profileId);
    const userAgent = "PavDentalApp/2.4 (iOS 18.2; iPhone16,2)";
    const res = await fetch(`${baseUrl}/api/patients/${owner.profileId}/plans/${planId}/sign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${owner.token}`,
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify({ signerName: "Synthetic Owner", consentConfirmed: true }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      signatureHash: string;
      planVersionHash: string;
      signerName: string;
      device: string;
      signedAt: string;
    };
    expect(body.signatureHash).toMatch(/^SHA256:[a-f0-9]{16}$/);
    expect(body.planVersionHash).toMatch(/^SHA256:[a-f0-9]{16}$/);
    expect(body.device).toBe(userAgent);

    const updated = await prisma.treatmentPlan.findUniqueOrThrow({ where: { id: planId } });
    const sig = JSON.parse(updated.patientSignature || "{}");
    expect(sig.signerName).toBe("Synthetic Owner");
    expect(sig.device).toBe(userAgent);
    expect(sig.planVersionHash).toBeDefined();
    expect(sig.acknowledgementText).toBe("I've read this plan; consent to treatment is taken in person");

    const vaultDoc = await prisma.documentVault.findFirst({
      where: { patientId: owner.profileId, fileKey: { contains: planId } },
    });
    expect(vaultDoc).not.toBeNull();
    expect(vaultDoc?.title).toBe("Treatment Plan Acknowledgement — Synthetic plan");
    expect(vaultDoc?.docType).toBe("treatment_plan_acknowledgement");

    const audit = await prisma.auditLog.findFirstOrThrow({ where: { action: "treatment_plan.signed", resourceId: planId } });
    const meta = audit.metadata as Record<string, unknown>;
    expect(meta.planVersionHash).toBeDefined();
    expect(meta.device).toBe(userAgent);
    expect(JSON.stringify(audit.metadata)).not.toContain("Synthetic Owner");
  });
});
