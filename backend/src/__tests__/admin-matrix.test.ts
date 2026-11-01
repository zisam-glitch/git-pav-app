import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { communicationService } from "../lib/communication-service";

describe("CS-31: Back office onboarding and admin-only authorization matrix (AD-1)", () => {
  let server: http.Server;
  let baseUrl: string;

  const tag = crypto.randomUUID().slice(0, 8);
  let adminToken = "";
  let patientToken = "";
  let clinicianToken = "";
  let adminUserId = "";

  const createdClinicIds: string[] = [];
  const createdVanIds: string[] = [];
  const createdServiceIds: string[] = [];
  const createdPolygonIds: string[] = [];
  const createdAssignmentIds: string[] = [];
  const createdApptIds: string[] = [];

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    baseUrl = `http://localhost:${port}`;

    const admin = await prisma.user.create({
      data: { email: `matrix-admin-${tag}@example.test`, passwordHash: "x", role: "admin" },
    });
    adminUserId = admin.id;
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });

    const patient = await prisma.user.create({
      data: { email: `matrix-patient-${tag}@example.test`, passwordHash: "x", role: "patient" },
    });
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });

    const clinician = await prisma.user.create({
      data: { email: `matrix-clinician-${tag}@example.test`, passwordHash: "x", role: "clinician" },
    });
    clinicianToken = signAccessToken({ sub: clinician.id, role: "clinician", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    if (createdApptIds.length > 0) {
      await prisma.appointment.deleteMany({ where: { id: { in: createdApptIds } } }).catch(() => {});
    }
    if (createdAssignmentIds.length > 0) {
      await prisma.vanOperatorAssignment.deleteMany({ where: { id: { in: createdAssignmentIds } } }).catch(() => {});
    }
    if (createdPolygonIds.length > 0) {
      await prisma.vanServicePolygon.deleteMany({ where: { id: { in: createdPolygonIds } } }).catch(() => {});
    }
    if (createdVanIds.length > 0) {
      await prisma.van.deleteMany({ where: { id: { in: createdVanIds } } }).catch(() => {});
    }
    if (createdClinicIds.length > 0) {
      await prisma.clinicOpeningHours.deleteMany({ where: { clinicId: { in: createdClinicIds } } }).catch(() => {});
      await prisma.clinic.deleteMany({ where: { id: { in: createdClinicIds } } }).catch(() => {});
    }
    if (createdServiceIds.length > 0) {
      await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } }).catch(() => {});
    }
    // Do not delete users: preserves cryptographic HMAC audit integrity chain
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe("Admin authorization matrix: non-admin access is rejected", () => {
    const endpoints = [
      { method: "POST", path: "/api/admin/clinicians", body: {} },
      { method: "POST", path: "/api/admin/operators", body: {} },
      { method: "POST", path: "/api/admin/clinics", body: {} },
      { method: "POST", path: "/api/admin/vans", body: {} },
      { method: "POST", path: "/api/admin/services", body: {} },
      { method: "GET", path: "/api/admin/services" },
    ];

    for (const ep of endpoints) {
      it(`rejects unauthenticated requests to ${ep.method} ${ep.path} with 401`, async () => {
        const res = await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method,
          headers: { "Content-Type": "application/json" },
          body: ep.body ? JSON.stringify(ep.body) : undefined,
        });
        expect([401, 403]).toContain(res.status);
      });

      it(`rejects patient requests to ${ep.method} ${ep.path} with 403`, async () => {
        const res = await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method,
          headers: { Authorization: `Bearer ${patientToken}`, "Content-Type": "application/json" },
          body: ep.body ? JSON.stringify(ep.body) : undefined,
        });
        expect(res.status).toBe(403);
      });

      it(`rejects clinician requests to ${ep.method} ${ep.path} with 403`, async () => {
        const res = await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method,
          headers: { Authorization: `Bearer ${clinicianToken}`, "Content-Type": "application/json" },
          body: ep.body ? JSON.stringify(ep.body) : undefined,
        });
        expect(res.status).toBe(403);
      });
    }
  });

  describe("Onboarding Clinicians (needs no direct SQL)", () => {
    it("creates a new clinician and profile via POST /api/admin/clinicians", async () => {
      const email = `dr.smith-${tag}@example.test`;
      const gdcNumber = String(920000 + crypto.randomInt(0, 79999));

      const res = await fetch(`${baseUrl}/api/admin/clinicians`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          fullName: "Dr. Andrew Smith",
          gdcNumber,
          roleTitle: "Senior Dental Surgeon",
          specialisms: ["Orthodontics", "Implants"],
          bio: "15+ years experience in restorative dentistry.",
          isTelehealthActive: true,
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.id).toBeDefined();
      expect(data.email).toBe(email);
      expect(data.fullName).toBe("Dr. Andrew Smith");
      expect(data.gdcNumber).toBe(gdcNumber);
      expect(data.specialisms).toEqual(["Orthodontics", "Implants"]);

      // Verify clinician profile in DB
      const profile = await prisma.clinicianProfile.findUnique({
        where: { id: data.id },
        include: { user: true },
      });
      expect(profile).not.toBeNull();
      expect(profile?.user.role).toBe("clinician");
    });

    it("rejects duplicate email and duplicate GDC number with 409 Conflict", async () => {
      const email = `dr.dup-${tag}@example.test`;
      const gdcNumber = String(920000 + crypto.randomInt(0, 79999));

      const res1 = await fetch(`${baseUrl}/api/admin/clinicians`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: "Dr. First Dentist",
          gdcNumber,
          roleTitle: "Dentist",
        }),
      });
      expect(res1.status).toBe(201);

      // Attempt duplicate email
      const resDupEmail = await fetch(`${baseUrl}/api/admin/clinicians`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: "Dr. Another Dentist",
          gdcNumber: String(920000 + crypto.randomInt(0, 79999)),
          roleTitle: "Dentist",
        }),
      });
      expect(resDupEmail.status).toBe(409);

      // Attempt duplicate GDC number
      const resDupGdc = await fetch(`${baseUrl}/api/admin/clinicians`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `dr.other-${tag}@example.test`,
          fullName: "Dr. Another Dentist",
          gdcNumber,
          roleTitle: "Dentist",
        }),
      });
      expect(resDupGdc.status).toBe(409);
    });
  });

  describe("Onboarding Operators (needs no direct SQL)", () => {
    it("creates a new operator and profile via POST /api/admin/operators", async () => {
      const email = `operator-${tag}@example.test`;
      const res = await fetch(`${baseUrl}/api/admin/operators`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: "Mark Evans",
          phone: "+44 7700 900555",
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.id).toBeDefined();
      expect(data.email).toBe(email);
      expect(data.fullName).toBe("Mark Evans");
      expect(data.phone).toBe("+44 7700 900555");

      const profile = await prisma.operatorProfile.findUnique({
        where: { id: data.id },
        include: { user: true },
      });
      expect(profile).not.toBeNull();
      expect(profile?.user.role).toBe("operator");
    });
  });

  describe("Clinic & Service Management", () => {
    it("creates clinic via POST /api/admin/clinics", async () => {
      const res = await fetch(`${baseUrl}/api/admin/clinics`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Kensington Dental Hub ${tag}`,
          address: "42 High Street, Kensington",
          postcode: "W8 5SA",
          city: "London",
          phone: "020 7946 0123",
          operatingHours: "Mon–Fri 08:30–18:00, Sat 09:00–14:00",
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.id).toBeDefined();
      expect(data.name).toContain("Kensington Dental Hub");
      createdClinicIds.push(data.id);
    });

    it("creates and lists services via POST and GET /api/admin/services", async () => {
      const resCreate = await fetch(`${baseUrl}/api/admin/services`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Emergency Relief ${tag}`,
          description: "Immediate triage and pain relief appointment",
          category: "emergency",
          durationMinutes: 45,
          pricePence: 9500,
          depositPence: 3000,
        }),
      });

      expect(resCreate.status).toBe(201);
      const created = (await resCreate.json()) as any;
      expect(created.id).toBeDefined();
      expect(created.durationMinutes).toBe(45);
      expect(created.pricePence).toBe(9500);
      createdServiceIds.push(created.id);

      const resList = await fetch(`${baseUrl}/api/admin/services`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(resList.status).toBe(200);
      const list = (await resList.json()) as any[];
      expect(list.some((s) => s.id === created.id)).toBe(true);
    });
  });

  describe("Van Fleet, Polygon & Assignment Management", () => {
    it("creates van and assigns service polygon and operator", async () => {
      const plate = `PA${crypto.randomInt(10, 99)} ${tag.slice(0, 3).toUpperCase()}`;

      // 1. Create van
      const resVan = await fetch(`${baseUrl}/api/admin/vans`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Mobile Unit 4 ${tag}`,
          registrationPlate: plate,
          vehicleModel: "Mercedes Sprinter Dental Custom",
          isActive: true,
        }),
      });

      expect(resVan.status).toBe(201);
      const van = (await resVan.json()) as any;
      expect(van.id).toBeDefined();
      createdVanIds.push(van.id);

      // 2. Assign service polygon
      const resPoly = await fetch(`${baseUrl}/api/admin/vans/${van.id}/polygons`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          sectorName: "Chelsea & Fulham Sector",
          // A shape is required: there's no default area any more.
          polygonGeoJson: {
            type: "Polygon",
            coordinates: [[[-0.2, 51.47], [-0.2, 51.49], [-0.17, 51.49], [-0.17, 51.47], [-0.2, 51.47]]],
          },
        }),
      });

      expect(resPoly.status).toBe(201);
      const poly = (await resPoly.json()) as any;
      expect(poly.id).toBeDefined();
      expect(poly.sectorName).toBe("Chelsea & Fulham Sector");
      createdPolygonIds.push(poly.id);

      // 3. Create operator to assign
      const resOp = await fetch(`${baseUrl}/api/admin/operators`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `op-van-${tag}@example.test`,
          fullName: "Sam Driver",
        }),
      });
      const operator = (await resOp.json()) as any;

      // 4. Assign operator to van
      const resAssign = await fetch(`${baseUrl}/api/admin/vans/${van.id}/assignments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorId: operator.id,
        }),
      });

      expect(resAssign.status).toBe(201);
      const assign = (await resAssign.json()) as any;
      expect(assign.id).toBeDefined();
      expect(assign.vanId).toBe(van.id);
      expect(assign.operatorId).toBe(operator.id);
      createdAssignmentIds.push(assign.id);
    });
  });

  describe("Admin status override side-effects (AD-1)", () => {
    it("cancels appointment and cancels pending reminders when marked cancelled", async () => {
      const patient = await prisma.user.create({
        data: { email: `override-pat-${tag}@example.test`, passwordHash: "x", role: "patient" },
      });
      const profile = await prisma.patientProfile.create({
        data: { userId: patient.id, firstName: "Test", lastName: "Override" },
      });
      const service = await prisma.service.findFirstOrThrow();

      const appt = await prisma.appointment.create({
        data: {
          patientId: profile.id,
          serviceId: service.id,
          channel: "clinic",
          startTimeUtc: new Date(Date.now() + 86400000),
          endTimeUtc: new Date(Date.now() + 86400000 + 1800000),
          status: "confirmed",
          totalPricePence: 5000,
        },
      });
      createdApptIds.push(appt.id);

      // Schedule reminder
      await prisma.scheduledNotification.create({
        data: {
          userId: patient.id,
          title: "Appointment Reminder",
          body: "Your dental visit is tomorrow",
          scheduledFor: new Date(Date.now() + 3600000),
          status: "pending",
          data: { appointmentId: appt.id },
        },
      });

      // Admin cancels appointment
      const res = await fetch(`${baseUrl}/api/admin/appointments/${appt.id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.status).toBe("cancelled");

      // Verify reminders cancelled
      const pendingReminders = await prisma.scheduledNotification.count({
        where: {
          data: { path: ["appointmentId"], equals: appt.id },
          status: "pending",
        },
      });
      expect(pendingReminders).toBe(0);
    });
  });
  describe("Staff invites", () => {
    it("emails a set-password link to staff added without a password, and the link works", async () => {
      const sent: Array<{ to: string; subject: string; text?: string }> = [];
      const spy = jest.spyOn(communicationService, "sendEmail").mockImplementation(async (payload: any) => {
        sent.push(payload);
        return { success: true, messageId: "mock" };
      });
      try {
        const email = `invite-operator-${tag}@example.test`;
        const res = await fetch(`${baseUrl}/api/admin/operators`, {
          method: "POST",
          headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullName: "Synthetic Operator" }),
        });
        expect(res.status).toBe(201);
        expect(((await res.json()) as any).inviteSent).toBe(true);

        const invite = sent.find((m) => m.to === email);
        expect(invite?.subject).toBe("Set up your Pav Dental account");
        const token = /token=([^\s&]+)/.exec(invite?.text ?? "")?.[1];
        expect(token).toBeTruthy();

        const confirm = await fetch(`${baseUrl}/api/auth/password-reset/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: decodeURIComponent(token!), newPassword: "Synthetic1Pass" }),
        });
        expect(confirm.status).toBe(200);
      } finally {
        spy.mockRestore();
      }
    });

    it("sends no invite when the admin sets a password", async () => {
      const spy = jest.spyOn(communicationService, "sendEmail").mockResolvedValue({ success: true } as any);
      try {
        const res = await fetch(`${baseUrl}/api/admin/operators`, {
          method: "POST",
          headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            email: `invite-none-${tag}@example.test`,
            fullName: "Synthetic Operator Two",
            password: "Synthetic1Pass",
          }),
        });
        expect(res.status).toBe(201);
        expect(((await res.json()) as any).inviteSent).toBe(false);
        expect(spy).not.toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    });
  });
});
