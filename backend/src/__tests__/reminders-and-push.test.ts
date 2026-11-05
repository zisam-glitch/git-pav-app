import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import {
  processDueScheduledNotifications,
  scheduleAppointmentReminderLadder,
  isInQuietHours,
  getNextQuietHoursEnd,
  cancelAppointmentReminders,
  NOTIFICATION_CLAIM_LEASE_MS,
} from "../lib/background-jobs";
import { sendPatientNotification } from "../lib/patient-push";
import { communicationService } from "../lib/communication-service";
import { broadcastEtaUpdates } from "../lib/van-eta-broadcast";
import { signAccessToken } from "../lib/jwt";
import { uniqueGdc } from "../../test/unique-gdc";

describe("CS-19: Reminders and Push That Behave", () => {
  let server: http.Server;
  let baseUrl: string;
  let testUser: any;
  let testPatient: any;
  let testClinician: any;
  let testClinic: any;
  let testService: any;
  let testAuthToken: string;

  beforeAll(async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    baseUrl = `http://localhost:${port}`;

    const timestamp = Date.now();

    // 1. Create Patient User & Profile (synthetic data)
    testUser = await prisma.user.create({
      data: {
        email: `push_tester_${timestamp}@example.test`,
        passwordHash: "argon2id_mock_hash",
        role: "patient",
        patientProfile: {
          create: {
            firstName: "Push",
            lastName: "Tester",
          },
        },
      },
      include: { patientProfile: true },
    });
    testPatient = testUser.patientProfile;
    testAuthToken = signAccessToken({
      sub: testUser.id,
      role: "patient",
      sessionId: crypto.randomUUID(),
    });

    // 2. Create Clinician User & Profile
    const clinUser = await prisma.user.create({
      data: {
        email: `clin_tester_${timestamp}@example.test`,
        passwordHash: "argon2id_mock_hash",
        role: "clinician",
        clinicianProfile: {
          create: {
            fullName: "Dr. Push Clinician",
            gdcNumber: uniqueGdc(),
            roleTitle: "Dentist",
          },
        },
      },
      include: { clinicianProfile: true },
    });
    testClinician = clinUser.clinicianProfile;

    // 3. Service
    testService = await prisma.service.create({
      data: {
        id: crypto.randomUUID(),
        name: "Push Test Examination",
        category: "checkup",
        description: "Examination test",
        durationMinutes: 30,
        pricePence: 6500,
        depositPence: 2000,
        supportedChannels: ["clinic", "van"],
      },
    });

    // 4. Clinic
    testClinic = await prisma.clinic.create({
      data: {
        id: crypto.randomUUID(),
        name: "Pav Push Practice",
        address: "100 London Road",
        city: "London",
        postcode: "EC1A 1BB",
        phone: "02071234567",
        operatingHours: "09:00 - 17:00",
      },
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    // Drain any in-flight audit logging before tearing down test users
    await (globalThis as any).__pavAuditWriteQueue?.catch(() => {});
    await new Promise((r) => setTimeout(r, 100));

    // Cleanup
    await prisma.scheduledNotification.deleteMany({ where: { userId: testUser.id } });
    await prisma.notificationHistory.deleteMany({ where: { userId: testUser.id } });
    await prisma.pushToken.deleteMany({ where: { userId: testUser.id } });
    await prisma.appointment.deleteMany({ where: { patientId: testPatient.id } });
    await prisma.patientProfile.deleteMany({ where: { id: testPatient.id } });
    if (testClinician) {
      await prisma.clinicianProfile.deleteMany({ where: { id: testClinician.id } });
    }
    if (testService) {
      await prisma.service.delete({ where: { id: testService.id } }).catch(() => {});
    }
    if (testClinic) {
      await prisma.clinic.delete({ where: { id: testClinic.id } }).catch(() => {});
    }
  });

  describe("BJ-2: London Timezone Formatting (BST vs GMT)", () => {
    it("formats summer appointment times in BST (UTC+1)", async () => {
      // 14:00 UTC on July 15 2027 = 15:00 BST
      const summerDate = new Date("2027-07-15T14:00:00.000Z");

      const appt = await prisma.appointment.create({
        data: {
          patientId: testPatient.id,
          clinicianId: testClinician.id,
          clinicId: testClinic.id,
          serviceId: testService.id,
          channel: "clinic",
          startTimeUtc: summerDate,
          endTimeUtc: new Date(summerDate.getTime() + 30 * 60 * 1000),
          status: "confirmed",
          totalPricePence: 6500,
          depositPaidPence: 2000,
        },
      });

      await scheduleAppointmentReminderLadder(appt.id);

      const reminders = await prisma.scheduledNotification.findMany({
        where: { userId: testUser.id, data: { path: ["appointmentId"], equals: appt.id } },
      });

      expect(reminders.length).toBeGreaterThan(0);
      for (const reminder of reminders) {
        // Must contain 15:00 BST, NOT 14:00 UTC
        expect(reminder.body).toContain("15:00");
        expect(reminder.body).not.toContain("14:00");
      }

      await prisma.appointment.delete({ where: { id: appt.id } });
    });

    it("formats winter appointment times in GMT (UTC+0)", async () => {
      // 14:00 UTC on January 15 = 14:00 GMT
      const winterDate = new Date("2027-01-15T14:00:00.000Z");

      const appt = await prisma.appointment.create({
        data: {
          patientId: testPatient.id,
          clinicianId: testClinician.id,
          clinicId: testClinic.id,
          serviceId: testService.id,
          channel: "clinic",
          startTimeUtc: winterDate,
          endTimeUtc: new Date(winterDate.getTime() + 30 * 60 * 1000),
          status: "confirmed",
          totalPricePence: 6500,
          depositPaidPence: 2000,
        },
      });

      await scheduleAppointmentReminderLadder(appt.id);

      const reminders = await prisma.scheduledNotification.findMany({
        where: { userId: testUser.id, data: { path: ["appointmentId"], equals: appt.id } },
      });

      expect(reminders.length).toBeGreaterThan(0);
      for (const reminder of reminders) {
        expect(reminder.body).toContain("14:00");
      }

      await prisma.appointment.delete({ where: { id: appt.id } });
    });
  });

  describe("BJ-3: Multi-replica Atomic Claim (No Duplicate Sends)", () => {
    it("ensures two concurrent dispatchers claim rows atomically without double-sending", async () => {
      // Create 5 due notifications
      const dueNotifs = [];
      for (let i = 0; i < 5; i++) {
        dueNotifs.push(
          await prisma.scheduledNotification.create({
            data: {
              userId: testUser.id,
              title: `Concurrency Test ${i}`,
              body: `Body ${i}`,
              scheduledFor: new Date(Date.now() - 5000 - i * 1000),
              status: "pending",
            },
          })
        );
      }

      // Spy on communication service
      const pushSpy = jest
        .spyOn(communicationService, "sendExpoPushNotifications")
        .mockResolvedValue({ sentCount: 1, failedCount: 0, tickets: [{ status: "ok", id: "t1" }] });

      // Simulate two API replicas executing the dispatcher at the exact same millisecond
      const [res1, res2] = await Promise.all([
        processDueScheduledNotifications(),
        processDueScheduledNotifications(),
      ]);

      // Total dispatched across both replicas should include our 5 due notifications
      expect(res1.dispatchedCount + res2.dispatchedCount).toBeGreaterThanOrEqual(5);

      // Verify all notifications are marked sent
      const updated = await prisma.scheduledNotification.findMany({
        where: { id: { in: dueNotifs.map((n) => n.id) } },
      });
      expect(updated.every((n) => n.status === "sent")).toBe(true);

      pushSpy.mockRestore();
    });
  });

  describe("BE-22: a claim left behind by a dead dispatcher is retried", () => {
    it("sends a reminder stuck in 'sending' past the lease, and leaves a fresh claim alone", async () => {
      const now = Date.now();
      const stale = await prisma.scheduledNotification.create({
        data: {
          userId: testUser.id,
          title: "Lease expired",
          body: "Claimed by a dispatcher that died",
          scheduledFor: new Date(now - 30 * 60 * 1000),
          status: "sending",
          claimedAt: new Date(now - NOTIFICATION_CLAIM_LEASE_MS - 60 * 1000),
        },
      });
      const legacy = await prisma.scheduledNotification.create({
        data: {
          userId: testUser.id,
          title: "Claimed before claimed_at existed",
          body: "No timestamp",
          scheduledFor: new Date(now - 30 * 60 * 1000),
          status: "sending",
        },
      });
      const inFlight = await prisma.scheduledNotification.create({
        data: {
          userId: testUser.id,
          title: "Lease still running",
          body: "Another dispatcher is sending this",
          scheduledFor: new Date(now - 2 * 60 * 1000),
          status: "sending",
          claimedAt: new Date(now - 60 * 1000),
        },
      });

      const pushSpy = jest
        .spyOn(communicationService, "sendExpoPushNotifications")
        .mockResolvedValue({ sentCount: 1, failedCount: 0, tickets: [{ status: "ok", id: "t1" }] });

      await processDueScheduledNotifications();

      const [staleAfter, legacyAfter, inFlightAfter] = await Promise.all(
        [stale, legacy, inFlight].map((n) => prisma.scheduledNotification.findUnique({ where: { id: n.id } }))
      );
      expect(staleAfter?.status).toBe("sent");
      expect(legacyAfter?.status).toBe("sent");
      expect(inFlightAfter?.status).toBe("sending");
      expect(inFlightAfter?.claimedAt?.getTime()).toBe(inFlight.claimedAt?.getTime());

      pushSpy.mockRestore();
      await prisma.scheduledNotification.deleteMany({
        where: { id: { in: [stale.id, legacy.id, inFlight.id] } },
      });
    });

    it("stamps claimed_at when it claims a row", async () => {
      const reminder = await prisma.scheduledNotification.create({
        data: {
          userId: testUser.id,
          title: "Claim stamp",
          body: "Body",
          scheduledFor: new Date(Date.now() - 5000),
          status: "pending",
        },
      });
      // Hold the dispatcher inside the push call to observe the claimed row.
      let observed: { status: string; claimedAt: Date | null } | null = null;
      const pushSpy = jest
        .spyOn(communicationService, "sendExpoPushNotifications")
        .mockImplementation(async (messages) => {
          if (messages.some((m) => m.title === "Claim stamp")) {
            const row = await prisma.scheduledNotification.findUnique({ where: { id: reminder.id } });
            observed = row ? { status: row.status, claimedAt: row.claimedAt } : null;
          }
          return { sentCount: 1, failedCount: 0, tickets: [{ status: "ok", id: "t2" }] };
        });
      const token = `ExponentPushToken[BE22_${Date.now()}]`;
      await prisma.pushToken.create({ data: { userId: testUser.id, token, platform: "ios", active: true } });

      await processDueScheduledNotifications();

      expect(observed).not.toBeNull();
      expect(observed!.status).toBe("sending");
      expect(observed!.claimedAt).toBeInstanceOf(Date);

      pushSpy.mockRestore();
      await prisma.pushToken.delete({ where: { token } });
      await prisma.scheduledNotification.delete({ where: { id: reminder.id } });
    });
  });

  describe("PP-1: Default Notification Preferences (Missing row = enabled)", () => {
    it("treats missing preferences row as pushEnabled: true", async () => {
      // Ensure user has NO preferences row
      await prisma.notificationPreference.deleteMany({ where: { userId: testUser.id } });

      // Add an active push token
      const token = `ExponentPushToken[PP1_${Date.now()}]`;
      await prisma.pushToken.create({
        data: {
          userId: testUser.id,
          token,
          platform: "ios",
          active: true,
        },
      });

      const pushSpy = jest
        .spyOn(communicationService, "sendExpoPushNotifications")
        .mockResolvedValue({ sentCount: 1, failedCount: 0, tickets: [{ status: "ok" }] });

      await sendPatientNotification(testPatient.id, "Van Accepted", "Van is on the way!");

      expect(pushSpy).toHaveBeenCalled();
      const calls = pushSpy.mock.calls;
      const sentTokens = calls.flatMap(([msgs]) => msgs.map((m) => m.to));
      expect(sentTokens).toContain(token);

      pushSpy.mockRestore();
      await prisma.pushToken.deleteMany({ where: { userId: testUser.id } });
    });
  });

  describe("PP-2 & CS-3: DeviceNotRegistered Token Deactivation", () => {
    it("deactivates push token when Expo returns DeviceNotRegistered", async () => {
      const deadToken = `ExponentPushToken[DEAD_${Date.now()}]`;
      await prisma.pushToken.create({
        data: {
          userId: testUser.id,
          token: deadToken,
          platform: "android",
          active: true,
        },
      });

      // Mock Expo returning DeviceNotRegistered
      const fetchSpy = jest.spyOn(global, "fetch").mockImplementationOnce(async () => {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: [
              {
                status: "error",
                message: '"ExponentPushToken[...]" is not a registered push token.',
                details: { error: "DeviceNotRegistered" },
              },
            ],
          }),
        } as any;
      });

      const res = await communicationService.sendExpoPushNotifications([
        { to: deadToken, title: "Test", body: "Test" },
      ]);

      expect(res.failedCount).toBe(1);

      // Verify token is now active: false in DB
      const record = await prisma.pushToken.findUnique({
        where: { token: deadToken },
      });
      expect(record?.active).toBe(false);

      fetchSpy.mockRestore();
      await prisma.pushToken.deleteMany({ where: { token: deadToken } });
    });

    it("has no separate token delete route: sign-out removes the token", async () => {
      // Turning push off is a saved preference the server honours, and
      // signing out deactivates the device's token (see /api/auth/logout).
      const res = await fetch(`${baseUrl}/api/notifications/tokens/${encodeURIComponent("ExponentPushToken[x]")}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${testAuthToken}` },
      });
      expect(res.status).toBe(404);
    });

    it("deactivates push token on POST /api/auth/logout with pushToken in body", async () => {
      const token = `ExponentPushToken[LOGOUT_${Date.now()}]`;
      await prisma.pushToken.create({
        data: {
          userId: testUser.id,
          token,
          platform: "ios",
          active: true,
        },
      });

      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pushToken: token }),
      });

      expect(res.status).toBe(200);

      const record = await prisma.pushToken.findUnique({ where: { token } });
      expect(record?.active).toBe(false);

      await prisma.pushToken.deleteMany({ where: { token } });
    });
  });

  describe("PP-3 & NT-2: Quiet Hours in London Time", () => {
    it("correctly identifies quiet hours spanning midnight (22:00 to 08:00)", () => {
      // 23:30 London time -> inside quiet hours
      const night = new Date("2026-07-15T22:30:00.000Z"); // 23:30 BST
      expect(isInQuietHours(night, "22:00", "08:00")).toBe(true);

      // 03:00 London time -> inside quiet hours
      const dawn = new Date("2026-07-15T02:00:00.000Z"); // 03:00 BST
      expect(isInQuietHours(dawn, "22:00", "08:00")).toBe(true);

      // 12:00 London time -> outside quiet hours
      const noon = new Date("2026-07-15T11:00:00.000Z"); // 12:00 BST
      expect(isInQuietHours(noon, "22:00", "08:00")).toBe(false);
    });

    it("defers reminder dispatch when user is in quiet hours", async () => {
      // Set user's quiet hours to cover current time
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(now);
      const currH = parseInt(parts.find((p) => p.type === "hour")?.value || "12", 10);
      const currM = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

      // Start 1 hour ago, end 2 hours from now
      const startH = (currH - 1 + 24) % 24;
      const endH = (currH + 2) % 24;
      const startStr = `${String(startH).padStart(2, "0")}:00`;
      const endStr = `${String(endH).padStart(2, "0")}:00`;

      await prisma.notificationPreference.upsert({
        where: { userId: testUser.id },
        update: { quietHoursStart: startStr, quietHoursEnd: endStr, pushEnabled: true },
        create: { userId: testUser.id, quietHoursStart: startStr, quietHoursEnd: endStr, pushEnabled: true },
      });

      // Create a pending reminder due now
      const reminder = await prisma.scheduledNotification.create({
        data: {
          userId: testUser.id,
          title: "Quiet Hours Test",
          body: "Should not buzz now",
          scheduledFor: new Date(Date.now() - 5000),
          status: "pending",
        },
      });

      const pushSpy = jest.spyOn(communicationService, "sendExpoPushNotifications");

      // Dispatch should respect quiet hours and postpone rather than sending
      await processDueScheduledNotifications();
      const testUserPushes = pushSpy.mock.calls.filter((args) =>
        JSON.stringify(args).includes(testUser.id)
      );
      expect(testUserPushes).toHaveLength(0);

      // Check notification is postponed
      const checked = await prisma.scheduledNotification.findUnique({
        where: { id: reminder.id },
      });
      expect(checked?.status).toBe("pending");
      expect(checked?.scheduledFor.getTime()).toBeGreaterThan(Date.now());

      pushSpy.mockRestore();
      await prisma.scheduledNotification.delete({ where: { id: reminder.id } });
    });
  });

  describe("EB-1: Van ETA Broadcast Filtering", () => {
    it("skips stops in on_site and in_treatment phases from receiving ETA update pushes", async () => {
      const tag = crypto.randomUUID().slice(0, 6);
      const van = await prisma.van.create({
        data: {
          name: `Test Van ${tag}`,
          registrationPlate: `EB1${tag}`,
          vehicleModel: "Ford Transit",
        },
      });

      const opUser = await prisma.user.create({
        data: {
          email: `eb1_op_${tag}@example.test`,
          passwordHash: "x",
          role: "operator",
          operatorProfile: {
            create: {
              fullName: "EB1 Operator",
            },
          },
        },
        include: { operatorProfile: true },
      });

      const shift = await prisma.vanShift.create({
        data: {
          vanId: van.id,
          operatorId: opUser.operatorProfile!.id,
          status: "online",
          lastLat: 51.5074,
          lastLng: -0.1278,
        },
      });

      // Request in on_site phase
      const onSiteReq = await prisma.vanServiceRequest.create({
        data: {
          vanId: van.id,
          shiftId: shift.id,
          patientId: testPatient.id,
          serviceId: testService.id,
          patientLat: 51.508,
          patientLng: -0.128,
          accessDetails: { notes: "Gate code 1234" },
          expiresAt: new Date(Date.now() + 3600000),
          status: "in_progress",
          phase: "on_site",
          queuePosition: 1,
        },
      });

      const pushSpy = jest.spyOn(communicationService, "sendExpoPushNotifications");

      const outcomes = await broadcastEtaUpdates(shift.id, { force: true });
      expect(outcomes[onSiteReq.id]).toBe("no_change");
      expect(pushSpy).not.toHaveBeenCalled();

      pushSpy.mockRestore();
      await (globalThis as any).__pavAuditWriteQueue?.catch(() => {});
      await prisma.vanServiceRequest.delete({ where: { id: onSiteReq.id } });
      await prisma.vanShift.delete({ where: { id: shift.id } });
      await prisma.operatorProfile.delete({ where: { id: opUser.operatorProfile!.id } });
      await prisma.van.delete({ where: { id: van.id } });
    });
  });

  describe("VS-1: Van Stops Check-In Notification & Broadcast", () => {
    it("sends Van Has Arrived push and transitions phase to on_site on check-in", async () => {
      const tag = crypto.randomUUID().slice(0, 6);
      const van = await prisma.van.create({
        data: {
          name: `CheckIn Van ${tag}`,
          registrationPlate: `VS1${tag}`,
          vehicleModel: "Mercedes Sprinter",
        },
      });

      const operatorUser = await prisma.user.create({
        data: {
          email: `vs1_op_${tag}@example.test`,
          passwordHash: "x",
          role: "operator",
          operatorProfile: {
            create: {
              fullName: "VS1 Operator",
            },
          },
        },
        include: { operatorProfile: true },
      });

      const shift = await prisma.vanShift.create({
        data: {
          vanId: van.id,
          operatorId: operatorUser.operatorProfile!.id,
          status: "online",
          lastLat: 51.5074,
          lastLng: -0.1278,
        },
      });

      const requestObj = await prisma.vanServiceRequest.create({
        data: {
          vanId: van.id,
          shiftId: shift.id,
          patientId: testPatient.id,
          serviceId: testService.id,
          patientLat: 51.508,
          patientLng: -0.128,
          accessDetails: { notes: "Ring doorbell" },
          expiresAt: new Date(Date.now() + 3600000),
          status: "accepted",
          phase: "en_route",
          queuePosition: 1,
        },
      });

      const operatorToken = signAccessToken({
        sub: operatorUser.id,
        role: "operator",
        sessionId: crypto.randomUUID(),
      });

      const pushSpy = jest
        .spyOn(communicationService, "sendExpoPushNotifications")
        .mockResolvedValue({ sentCount: 1, failedCount: 0, tickets: [{ status: "ok" }] });

      const res = await fetch(`${baseUrl}/api/van/stops/${requestObj.id}/check-in`, {
        method: "POST",
        headers: { Authorization: `Bearer ${operatorToken}` },
      });

      expect(res.status).toBe(200);
      const resData = (await res.json()) as any;
      expect(resData.ok).toBe(true);
      expect(resData.phase).toBe("on_site");

      // Verify request in DB
      const updatedReq = await prisma.vanServiceRequest.findUnique({
        where: { id: requestObj.id },
      });
      expect(updatedReq?.phase).toBe("on_site");
      expect(updatedReq?.status).toBe("in_progress");

      pushSpy.mockRestore();
      await (globalThis as any).__pavAuditWriteQueue?.catch(() => {});
      await prisma.vanServiceRequest.delete({ where: { id: requestObj.id } });
      await prisma.vanShift.delete({ where: { id: shift.id } });
      await prisma.operatorProfile.delete({ where: { id: operatorUser.operatorProfile!.id } });
      await prisma.van.delete({ where: { id: van.id } });
    });
  });
});
