import http from "http";
import crypto from "crypto";
import Stripe from "stripe";

// CS-49: Money paths that can't refund twice or wrongly (audit §2 items 4, 5, CS-17, CS-18, CS-15)
// - Cancel then confirm gives no extra refund
// - A webhook retry after completion refunds nothing
// - Two partial refunds leave the right deposit
// - Concurrent webhook deliveries run once
// - Admin status transition restrictions & audit

const mockRefundCreate = jest.fn();
const mockConstructEvent = jest.fn();
const mockRetrieve = jest.fn();

jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    paymentIntents: { retrieve: mockRetrieve },
    refunds: { create: mockRefundCreate },
    webhooks: { constructEvent: mockConstructEvent },
  }))
);

describe("CS-49: Payment and refund integrity", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  let patientToken: string;
  let patientId: string;
  let adminToken: string;
  let service: { id: string; depositPence: number; durationMinutes: number };
  const createdApptIds: string[] = [];

  const originalEnv = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  };

  beforeAll(async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_unit_not_a_real_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit_not_a_real_secret";

    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;

    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3015, resolve));
    baseUrl = "http://localhost:3015";

    const email = `pi-test-${Date.now()}@example.test`;
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "UnitTest12345-synth", firstName: "Integrity", lastName: "Tester" }),
    });
    expect(reg.status).toBe(201);
    patientToken = ((await reg.json()) as any).accessToken;

    const user = await prisma.user.findUniqueOrThrow({ where: { email }, include: { patientProfile: true } });
    patientId = user.patientProfile!.id;

    const adminUser = await prisma.user.create({
      data: {
        email: `admin-${Date.now()}@example.test`,
        passwordHash: "x",
        role: "admin",
      },
    });

    adminToken = signAccessToken({
      sub: adminUser.id,
      role: "admin",
      sessionId: crypto.randomUUID(),
    });

    service = await prisma.service.findFirstOrThrow({
      where: { depositPence: { gt: 0 } },
      select: { id: true, depositPence: true, durationMinutes: true },
    });
  });

  afterAll(async () => {
    if (prisma && createdApptIds.length > 0) {
      await prisma.appointment.deleteMany({ where: { id: { in: createdApptIds } } });
    }
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  beforeEach(() => {
    mockRefundCreate.mockReset().mockResolvedValue({ id: "re_mock_refund_123" });
    mockConstructEvent.mockReset();
    mockRetrieve.mockReset();
  });

  async function createTestAppointment(status: string, depositPaidPence = 2000, holdExpiresAt: Date | null = null) {
    const paymentIntentId = `pi_integrity_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const start = new Date(Date.now() + 5 * 86400000 + createdApptIds.length * 3600000);
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        serviceId: service.id,
        channel: "clinic",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + service.durationMinutes * 60000),
        status: status as any,
        holdExpiresAt,
        totalPricePence: 6500,
        depositPaidPence,
        stripePaymentId: paymentIntentId,
      },
    });
    createdApptIds.push(appt.id);
    return { appt, paymentIntentId };
  }

  const postWebhook = (eventId: string, type: string, dataObj: unknown) => {
    mockConstructEvent.mockReturnValueOnce({ id: eventId, type, data: { object: dataObj } });
    return fetch(`${baseUrl}/api/payments/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": "t=0,v1=unit" },
      body: JSON.stringify({ id: eventId }),
    });
  };

  // ─── Test 1: cancel then confirm gives no extra refund (Item 4) ───────────────
  it("cancelling a confirmed booking and then calling confirm gives no extra refund", async () => {
    // 1. Confirmed booking where holdExpiresAt is null
    const { appt, paymentIntentId } = await createTestAppointment("confirmed", 2000, null);
    mockRetrieve.mockResolvedValue({
      id: paymentIntentId,
      status: "succeeded",
      currency: "gbp",
      amount_received: 2000,
      metadata: { appointmentId: appt.id },
    });

    // 2. Patient cancels the appointment via POST /api/booking/appointments/:id/cancel
    const cancelRes = await fetch(`${baseUrl}/api/booking/appointments/${appt.id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({ reason: "Cannot make it" }),
    });
    expect(cancelRes.status).toBe(200);

    // Initial cancellation refund was called with the policy amount
    const refundsAfterCancel = mockRefundCreate.mock.calls.length;

    // 3. Patient tries calling confirm on the cancelled booking
    const confirmRes = await fetch(`${baseUrl}/api/booking/appointments/${appt.id}/confirm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({}),
    });

    // Must be rejected as invalid status, NOT refunded again as a late deposit
    expect([400, 409]).toContain(confirmRes.status);
    const body = (await confirmRes.json()) as any;
    expect(body.depositRefunded).toBeUndefined();

    // Zero extra refunds created
    expect(mockRefundCreate.mock.calls.length).toBe(refundsAfterCancel);
  });

  // ─── Test 2: webhook retry after completion refunds nothing (Item 5) ──────────
  it("a webhook retry after an appointment has completed refunds nothing", async () => {
    const { appt, paymentIntentId } = await createTestAppointment("completed", 2000, null);

    const intent = {
      id: paymentIntentId,
      status: "succeeded",
      currency: "gbp",
      amount_received: 2000,
      metadata: { appointmentId: appt.id },
    };

    const res = await postWebhook(`evt_retry_completed_${Date.now()}`, "payment_intent.succeeded", intent);
    expect(res.status).toBe(200);

    // No late deposit refund must be triggered
    expect(mockRefundCreate).not.toHaveBeenCalled();

    const stored = await prisma.appointment.findUniqueOrThrow({ where: { id: appt.id } });
    expect(stored.status).toBe("completed");
    expect(stored.depositPaidPence).toBe(2000);
  });

  // ─── Test 3: two partial refunds leave the right deposit ─────────────────────
  it("two partial refund events set the deposit to amount_captured - amount_refunded", async () => {
    const { appt, paymentIntentId } = await createTestAppointment("confirmed", 2000, null);

    // First partial refund of £5 (500p) -> total refunded so far: 500p
    const charge1 = {
      id: "ch_partial_1",
      payment_intent: paymentIntentId,
      amount_captured: 2000,
      amount_refunded: 500,
    };
    const res1 = await postWebhook(`evt_refund_1_${Date.now()}`, "charge.refunded", charge1);
    expect(res1.status).toBe(200);

    let stored = await prisma.appointment.findUniqueOrThrow({ where: { id: appt.id } });
    expect(stored.depositPaidPence).toBe(1500);

    // Second partial refund of £5 (500p) -> cumulative amount_refunded is now 1000p
    const charge2 = {
      id: "ch_partial_1",
      payment_intent: paymentIntentId,
      amount_captured: 2000,
      amount_refunded: 1000,
    };
    const res2 = await postWebhook(`evt_refund_2_${Date.now()}`, "charge.refunded", charge2);
    expect(res2.status).toBe(200);

    stored = await prisma.appointment.findUniqueOrThrow({ where: { id: appt.id } });
    // Must be 2000 - 1000 = 1000, NOT 1500 - 1000 = 500!
    expect(stored.depositPaidPence).toBe(1000);
  });

  // ─── Test 4: concurrent webhook deliveries run once ─────────────────────────
  it("concurrent deliveries of the same Stripe event run once by claiming the row first", async () => {
    const { appt, paymentIntentId } = await createTestAppointment("draft_hold", 0, new Date(Date.now() + 600000));
    const eventId = `evt_concurrent_${Date.now()}`;
    const intent = {
      id: paymentIntentId,
      status: "succeeded",
      currency: "gbp",
      amount_received: 2000,
      metadata: { appointmentId: appt.id },
    };

    // Send two concurrent deliveries
    mockConstructEvent.mockReturnValue({ id: eventId, type: "payment_intent.succeeded", data: { object: intent } });
    const [res1, res2] = await Promise.all([
      fetch(`${baseUrl}/api/payments/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "stripe-signature": "t=0,v1=unit" },
        body: JSON.stringify({ id: eventId }),
      }),
      fetch(`${baseUrl}/api/payments/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "stripe-signature": "t=0,v1=unit" },
        body: JSON.stringify({ id: eventId }),
      }),
    ]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    const body1 = (await res1.json()) as any;
    const body2 = (await res2.json()) as any;
    // One was processed, the other was identified as duplicate
    const duplicates = [body1.duplicate, body2.duplicate].filter(Boolean);
    expect(duplicates.length).toBe(1);

    const eventRows = await prisma.processedStripeEvent.count({ where: { id: eventId } });
    expect(eventRows).toBe(1);
  });

  // ─── Test 5: admin status transitions, refund and audit ─────────────────────
  it("admin status override enforces allowed transitions and audits from and to", async () => {
    const { appt } = await createTestAppointment("draft_hold", 0, new Date(Date.now() + 600000));

    // draft_hold cannot transition directly to confirmed via admin override without payment
    const invalidRes = await fetch(`${baseUrl}/api/admin/appointments/${appt.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "confirmed" }),
    });
    expect(invalidRes.status).toBe(409);

    // draft_hold can transition to cancelled
    const validCancelRes = await fetch(`${baseUrl}/api/admin/appointments/${appt.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "cancelled" }),
    });
    expect(validCancelRes.status).toBe(200);

    // Verify audit log captured fromStatus and toStatus
    const audit = await prisma.auditLog.findFirst({
      where: { action: "admin.appointment.status_updated", resourceId: appt.id },
    });
    expect(audit).not.toBeNull();
    const meta = audit?.metadata as any;
    expect(meta?.fromStatus).toBe("draft_hold");
    expect(meta?.toStatus).toBe("cancelled");
  });

  // Decisions log #22: a staff cancellation refunds the whole deposit, and
  // never cancels without it.
  it("admin cancel of a paid booking refunds the whole deposit", async () => {
    const { appt, paymentIntentId } = await createTestAppointment("confirmed", 2000);
    const res = await fetch(`${baseUrl}/api/admin/appointments/${appt.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "cancelled" }),
    });
    expect(res.status).toBe(200);
    expect(mockRefundCreate).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: paymentIntentId, amount: 2000 }),
      { idempotencyKey: `admin-cancel-refund:${appt.id}:2000` }
    );
  });

  it("admin cancel leaves a paid booking as it was when the refund fails", async () => {
    const { appt } = await createTestAppointment("confirmed", 2000);
    mockRefundCreate.mockRejectedValueOnce(new Error("stripe down"));
    const res = await fetch(`${baseUrl}/api/admin/appointments/${appt.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "cancelled" }),
    });
    expect(res.status).toBe(502);
    expect((await prisma.appointment.findUniqueOrThrow({ where: { id: appt.id } })).status).toBe("confirmed");
  });

  afterAll(async () => {
    if (createdApptIds.length > 0) {
      await prisma.appointment.deleteMany({ where: { id: { in: createdApptIds } } });
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
});
