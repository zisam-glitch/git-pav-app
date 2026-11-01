import http from "http";
import crypto from "crypto";
import argon2 from "argon2";
import { erasureDueDate, openErasureRequest, retentionEndDate } from "../lib/erasure";

// CS-23: erasure requests go to the DPO's queue with a one-month deadline.
// Erasing removes login, contact and payment details but keeps the clinical
// record until its retention date. A patient with upcoming paid bookings has
// to cancel them first (decisions log #21). Synthetic data only.
describe("erasure", () => {
  describe("dates", () => {
    it("gives one calendar month to respond, clamped at month end", () => {
      expect(erasureDueDate(new Date("2026-01-31T10:00:00Z")).toISOString()).toBe("2026-02-28T10:00:00.000Z");
      expect(erasureDueDate(new Date("2028-01-31T10:00:00Z")).toISOString()).toBe("2028-02-29T10:00:00.000Z");
      expect(erasureDueDate(new Date("2026-10-23T09:00:00Z")).toISOString()).toBe("2026-11-23T09:00:00.000Z");
    });

    it("keeps clinical records 11 years, or to a child's 25th birthday if later", () => {
      const today = new Date("2026-10-23T00:00:00Z");
      const last = new Date("2026-03-01T12:00:00Z");
      expect(retentionEndDate({ lastClinicalActivity: last, dobs: [new Date("1980-05-05")], today }).toISOString().slice(0, 10)).toBe("2037-03-01");
      expect(retentionEndDate({ lastClinicalActivity: last, dobs: [new Date("2020-05-05")], today }).toISOString().slice(0, 10)).toBe("2045-05-05");
      expect(retentionEndDate({ lastClinicalActivity: null, dobs: [new Date("2020-05-05")], today }).toISOString().slice(0, 10)).toBe("2026-10-23");
    });
  });

  describe("requests and the DPO queue", () => {
    let server: http.Server;
    let baseUrl: string;
    let prisma: typeof import("../lib/prisma").prisma;
    let signAccessToken: typeof import("../lib/jwt").signAccessToken;
    const tag = crypto.randomUUID().slice(0, 8);
    const password = `Synthetic-${tag}-pass`;
    const userIds: string[] = [];
    let adminToken = "";
    let serviceId = "";

    const call = (method: string, path: string, token: string, body?: unknown) =>
      fetch(`${baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      }).then(async (r) => ({ status: r.status, body: (await r.json()) as any }));

    async function makePatient(label: string) {
      const user = await prisma.user.create({
        data: {
          email: `erase-${label}-${tag}@example.test`,
          phone: `+4479${String(crypto.randomInt(0, 99999999)).padStart(8, "0")}`,
          passwordHash: await argon2.hash(password),
          role: "patient",
        },
      });
      userIds.push(user.id);
      const profile = await prisma.patientProfile.create({
        data: {
          userId: user.id,
          firstName: "Synthetic",
          lastName: label,
          dob: new Date("1990-01-01"),
          addressLine1: "1 Example Street",
          postcode: "ZZ1 1ZZ",
          emergencyContactName: "Synthetic Contact",
          emergencyContactPhone: "000",
        },
      });
      const token = signAccessToken({ sub: user.id, role: "patient", sessionId: crypto.randomUUID() });
      return { user, profile, token };
    }

    // A patient's erasure request, opened the way "Delete account" opens one.
    const requestErasure = async (userId: string, reason?: string) => {
      const request = await openErasureRequest(userId, "patient_request", reason);
      return { status: 202, body: { erasureRequestId: request.id, dueBy: request.dueAt.toISOString() } };
    };

    const appointment = (patientId: string, startTimeUtc: Date, status: "confirmed" | "completed" | "cancelled") =>
      prisma.appointment.create({
        data: {
          patientId,
          serviceId,
          channel: "clinic",
          startTimeUtc,
          endTimeUtc: new Date(startTimeUtc.getTime() + 1800000),
          status,
          totalPricePence: 0,
        },
      });

    beforeAll(async () => {
      const serverModule = require("../server");
      const app = serverModule.default ?? serverModule;
      prisma = require("../lib/prisma").prisma;
      signAccessToken = require("../lib/jwt").signAccessToken;
      server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(3018, resolve));
      baseUrl = "http://localhost:3018";

      const admin = await prisma.user.create({ data: { email: `erase-admin-${tag}@example.test`, passwordHash: "x", role: "admin" } });
      userIds.push(admin.id);
      adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
      serviceId = (await prisma.service.findFirstOrThrow({ select: { id: true } })).id;
    });

    afterAll(async () => {
      await prisma.erasureRequest.deleteMany({ where: { userId: { in: userIds } } });
      const profiles = await prisma.patientProfile.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
      await prisma.appointment.deleteMany({ where: { patientId: { in: profiles.map((p) => p.id) } } });
      await prisma.messageThread.deleteMany({ where: { patientUserId: { in: userIds } } });
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it("refuses to close an account with upcoming bookings, then opens a request once they're cancelled", async () => {
      const { user, profile, token } = await makePatient("Closer");
      const upcoming = await appointment(profile.id, new Date(Date.now() + 5 * 86400000), "confirmed");

      const refused = await call("DELETE", "/api/auth/account", token, { confirmPassword: password, reason: "Synthetic reason" });
      expect(refused.status).toBe(409);
      expect(refused.body.code).toBe("UPCOMING_BOOKINGS");
      expect(refused.body.upcoming).toEqual([expect.objectContaining({ id: upcoming.id, kind: "appointment" })]);
      expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).isActive).toBe(true);

      await prisma.appointment.update({ where: { id: upcoming.id }, data: { status: "cancelled" } });
      const closed = await call("DELETE", "/api/auth/account", token, { confirmPassword: password, reason: "Synthetic reason" });
      expect(closed.status).toBe(200);
      expect(closed.body.erasureRequestId).toBeTruthy();

      const request = await prisma.erasureRequest.findUniqueOrThrow({ where: { id: closed.body.erasureRequestId } });
      expect(request).toMatchObject({ userId: user.id, source: "account_deletion", status: "pending", reason: "Synthetic reason" });
      expect(request.dueAt.toISOString()).toBe(erasureDueDate(request.requestedAt).toISOString());

      // The free-text reason stays out of the audit log.
      const audit = await prisma.auditLog.findFirstOrThrow({
        where: { action: "account.deletion_requested", actorId: user.id },
        orderBy: { timestampUtc: "desc" },
      });
      expect(JSON.stringify(audit.metadata)).not.toContain("Synthetic reason");
    });

    it("lists requests for admins only, with the deadline", async () => {
      const { token } = await makePatient("Lister");
      expect((await call("GET", "/api/admin/erasure-requests", token)).status).toBe(403);

      const list = await call("GET", "/api/admin/erasure-requests", adminToken);
      expect(list.status).toBe(200);
      const mine = list.body.find((r: any) => r.patient.name === "Synthetic Closer");
      expect(mine).toMatchObject({ status: "pending", overdue: false, upcomingBookings: 0 });
      expect(mine.daysLeft).toBeGreaterThanOrEqual(27);
    });

    it("erases contact, login and payment details but keeps the clinical record", async () => {
      const { user, profile, token } = await makePatient("Erased");
      const lastVisit = new Date("2025-06-02T09:00:00Z");
      const visit = await appointment(profile.id, lastVisit, "completed");
      await prisma.toothRecord.create({ data: { patientId: profile.id, toothNumber: 11, arch: "upper", quadrant: "UR", condition: "filled" } });
      await prisma.messageThread.create({
        data: { patientUserId: user.id, senderName: "Synthetic Dentist", subject: "Follow-up", preview: "Synthetic message" },
      });
      await prisma.pushToken.create({ data: { userId: user.id, token: `ExponentPushToken[${tag}]`, platform: "ios" } });
      await prisma.savedPaymentMethod.create({
        data: { userId: user.id, stripePaymentMethodId: `pm_mock_${tag}`, brand: "visa", last4: "4242", expMonth: 1, expYear: 2030 },
      });
      await prisma.notificationHistory.create({ data: { userId: user.id, type: "reminder", title: "Synthetic", body: "Synthetic" } });
      await prisma.patientProfile.update({ where: { id: profile.id }, data: { stripeCustomerId: `cus_mock_${tag}` } });

      const requested = await requestErasure(user.id, "Synthetic");
      expect(requested.status).toBe(202);
      expect(requested.body.dueBy).toBeTruthy();

      // CS-23: Push token is deactivated immediately during the DPO review wait
      const pendingPushToken = await prisma.pushToken.findFirstOrThrow({ where: { userId: user.id } });
      expect(pendingPushToken.active).toBe(false);

      const done = await call("POST", `/api/admin/erasure-requests/${requested.body.erasureRequestId}/complete`, adminToken);
      expect(done.status).toBe(200);
      expect(done.body.retainUntil).toBe("2036-06-02");

      const erasedUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
      expect(erasedUser.email).toBe(`erased-${user.id}@erased.invalid`);
      expect(erasedUser).toMatchObject({ phone: null, isActive: false, mfaSecret: null, passwordHash: "!erased" });
      expect(erasedUser.erasedAt).toBeTruthy();

      const erasedProfile = await prisma.patientProfile.findUniqueOrThrow({ where: { id: profile.id } });
      expect(erasedProfile).toMatchObject({ addressLine1: null, postcode: null, emergencyContactName: null, emergencyContactPhone: null, stripeCustomerId: null });
      expect(erasedProfile.retainUntil?.toISOString().slice(0, 10)).toBe("2036-06-02");

      expect(await prisma.pushToken.count({ where: { userId: user.id } })).toBe(0);
      expect(await prisma.savedPaymentMethod.count({ where: { userId: user.id } })).toBe(0);
      expect(await prisma.notificationHistory.count({ where: { userId: user.id } })).toBe(0);

      // Kept: the clinical record.
      expect(await prisma.appointment.findUnique({ where: { id: visit.id } })).not.toBeNull();
      expect(await prisma.toothRecord.count({ where: { patientId: profile.id } })).toBe(1);
      expect(await prisma.messageThread.count({ where: { patientUserId: user.id } })).toBe(1);

      // The email is free to register again, and the request can't run twice.
      expect(await prisma.user.findUnique({ where: { email: `erase-Erased-${tag}@example.test` } })).toBeNull();
      expect((await call("POST", `/api/admin/erasure-requests/${requested.body.erasureRequestId}/complete`, adminToken)).status).toBe(409);
    });

    it("won't erase while bookings are upcoming", async () => {
      const { user, profile } = await makePatient("Booked");
      await appointment(profile.id, new Date(Date.now() + 3 * 86400000), "confirmed");
      const requested = await requestErasure(user.id);
      expect(requested.status).toBe(202);

      const blocked = await call("POST", `/api/admin/erasure-requests/${requested.body.erasureRequestId}/complete`, adminToken);
      expect(blocked.status).toBe(409);
      expect(blocked.body.code).toBe("UPCOMING_BOOKINGS");
      expect((await prisma.erasureRequest.findUniqueOrThrow({ where: { id: requested.body.erasureRequestId } })).status).toBe("pending");

      // A second request while one is open returns the same one.
      const again = await requestErasure(user.id);
      expect(again.body.erasureRequestId).toBe(requested.body.erasureRequestId);
    });

    it("rejects a request only with a note", async () => {
      const { user } = await makePatient("Rejected");
      const requested = await requestErasure(user.id);
      const path = `/api/admin/erasure-requests/${requested.body.erasureRequestId}/reject`;
      expect((await call("POST", path, adminToken, {})).status).toBe(400);
      expect((await call("POST", path, adminToken, { note: "Identity not confirmed" })).status).toBe(200);
      expect((await call("POST", path, adminToken, { note: "Again" })).status).toBe(409);
    });
  });
});
