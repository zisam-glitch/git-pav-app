// Payment failure handling, with no database: Prisma, Stripe and the side
// effects are mocked, so these run anywhere. Synthetic data only.
//
//  1. A webhook event is claimed before it is handled. If handling fails, the
//     claim is released so Stripe's retry is processed instead of being
//     answered "duplicate" (a lost payment event).
//  2. If the Stripe refund fails when a patient cancels, the patient is not
//     told they are cancelled and refunded: the booking is put back, an audit
//     record is written, and the request fails so they can retry.
//  3. Cancelling an unpaid hold voids its PaymentIntent.

const mockConstructEvent = jest.fn();
const mockRefundCreate = jest.fn();
const mockPiCancel = jest.fn();

jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
    refunds: { create: mockRefundCreate },
    paymentIntents: { cancel: mockPiCancel, retrieve: jest.fn() },
  }))
);

const mockPrisma = {
  processedStripeEvent: { create: jest.fn(), delete: jest.fn() },
  appointment: { updateMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn() },
  patientProfile: { findUnique: jest.fn() },
  vanServiceRequest: { findUnique: jest.fn(), findFirst: jest.fn() },
};
jest.mock("../lib/prisma", () => ({ prisma: mockPrisma }));

const mockAudit = jest.fn().mockResolvedValue(undefined);
jest.mock("../lib/audit-integrity", () => ({ createAuditLogWithIntegrity: (...a: unknown[]) => mockAudit(...a) }));
jest.mock("../lib/audit-security", () => ({ pseudonymiseIp: () => "hash" }));
jest.mock("../lib/background-jobs", () => ({
  scheduleAppointmentReminderLadder: jest.fn().mockResolvedValue(undefined),
  cancelAppointmentReminders: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../lib/patient-push", () => ({ sendPatientNotification: jest.fn().mockResolvedValue(undefined) }));
jest.mock("../lib/late-deposit", () => ({ refundLateDeposit: jest.fn() }));
jest.mock("../lib/rewards", () => ({ applyDepositVoucher: jest.fn(), depositDuePence: jest.fn() }));
jest.mock("../lib/stripe-customer", () => ({ customerEphemeralKey: jest.fn(), ensureStripeCustomer: jest.fn() }));
jest.mock("../lib/van-payments", () => ({ releaseVanDeposit: jest.fn() }));
jest.mock("../lib/best-effort", () => ({ logFailure: () => () => undefined }));

function fakeRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("payment failure handling", () => {
  let stripeWebhookHandler: typeof import("../routes/payments").stripeWebhookHandler;
  let handleAppointmentCancel: typeof import("../routes/cancellations").handleAppointmentCancel;
  const saved = { key: process.env.STRIPE_SECRET_KEY, whsec: process.env.STRIPE_WEBHOOK_SECRET };

  beforeAll(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_unit_not_a_real_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit_not_a_real_secret";
    stripeWebhookHandler = require("../routes/payments").stripeWebhookHandler;
    handleAppointmentCancel = require("../routes/cancellations").handleAppointmentCancel;
  });
  afterAll(() => {
    if (saved.key === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = saved.key;
    if (saved.whsec === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = saved.whsec;
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudit.mockResolvedValue(undefined);
  });

  describe("webhook", () => {
    const succeeded = {
      id: "evt_unit_1",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_unit_1", amount_received: 1000, metadata: { appointmentId: "appt-1" } } },
    };
    const req = { headers: { "stripe-signature": "sig" }, body: Buffer.from("{}"), ip: "127.0.0.1" } as any;

    it("releases the claim and answers 500 when handling fails, so Stripe retries", async () => {
      mockConstructEvent.mockReturnValue(succeeded);
      mockPrisma.processedStripeEvent.create.mockResolvedValue({});
      mockPrisma.appointment.updateMany.mockRejectedValue(new Error("database went away"));
      mockPrisma.processedStripeEvent.delete.mockResolvedValue({});
      const res = fakeRes();

      await stripeWebhookHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(mockPrisma.processedStripeEvent.delete).toHaveBeenCalledWith({ where: { id: "evt_unit_1" } });
    });

    it("answers 200 and does nothing for an event it has already handled", async () => {
      mockConstructEvent.mockReturnValue(succeeded);
      mockPrisma.processedStripeEvent.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
      const res = fakeRes();

      await stripeWebhookHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true, duplicate: true });
      expect(mockPrisma.appointment.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.processedStripeEvent.delete).not.toHaveBeenCalled();
    });

    it("keeps the claim when handling succeeds", async () => {
      mockConstructEvent.mockReturnValue(succeeded);
      mockPrisma.processedStripeEvent.create.mockResolvedValue({});
      mockPrisma.appointment.updateMany.mockResolvedValue({ count: 1 });
      const res = fakeRes();

      await stripeWebhookHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockPrisma.processedStripeEvent.delete).not.toHaveBeenCalled();
    });

    it("rejects a bad signature before touching anything", async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error("bad signature");
      });
      const res = fakeRes();

      await stripeWebhookHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockPrisma.processedStripeEvent.create).not.toHaveBeenCalled();
    });
  });

  describe("cancelling", () => {
    const cancelReq = { params: { id: "appt-1" }, user: { sub: "user-1", sessionId: "s1" }, ip: "127.0.0.1" } as any;
    const inFiveDays = () => new Date(Date.now() + 5 * 24 * 3600 * 1000);

    function givenAppointment(overrides: Record<string, unknown>) {
      mockPrisma.patientProfile.findUnique.mockResolvedValue({ id: "patient-1" });
      mockPrisma.appointment.findFirst.mockResolvedValue({
        id: "appt-1",
        status: "confirmed",
        channel: "clinic",
        startTimeUtc: inFiveDays(),
        depositPaidPence: 1000,
        stripePaymentId: "pi_unit_real",
        vanServiceRequest: null,
        ...overrides,
      });
      mockPrisma.appointment.updateMany.mockResolvedValue({ count: 1 });
    }

    it("does not report a refund that never happened: restores the booking, records it, returns 502", async () => {
      givenAppointment({});
      mockRefundCreate.mockRejectedValue(new Error("stripe is down"));
      const res = fakeRes();

      await handleAppointmentCancel(cancelReq, res);

      expect(res.status).toHaveBeenCalledWith(502);
      // claimed as cancelled first, then put back as confirmed
      expect(mockPrisma.appointment.updateMany).toHaveBeenNthCalledWith(1, {
        where: { id: "appt-1", status: "confirmed" },
        data: { status: "cancelled" },
      });
      expect(mockPrisma.appointment.updateMany).toHaveBeenNthCalledWith(2, {
        where: { id: "appt-1", status: "cancelled" },
        data: { status: "confirmed" },
      });
      expect(mockAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "appointment.cancel_refund_failed", resourceId: "appt-1" }));
      expect(mockAudit).not.toHaveBeenCalledWith(expect.objectContaining({ action: "appointment.cancelled" }));
    });

    it("refunds with a key that makes a retry safe, and reports the refund", async () => {
      givenAppointment({});
      mockRefundCreate.mockResolvedValue({ id: "re_unit_1" });
      const res = fakeRes();

      await handleAppointmentCancel(cancelReq, res);

      expect(mockRefundCreate).toHaveBeenCalledWith(
        expect.objectContaining({ payment_intent: "pi_unit_real", amount: 1000 }),
        { idempotencyKey: "refund:appt-1:1000" }
      );
      expect(res.status).not.toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ appointmentStatus: "cancelled", stripeRefundId: "re_unit_1", refundAmountPence: 1000 }));
    });

    it("voids the PaymentIntent of an unpaid hold", async () => {
      givenAppointment({ status: "draft_hold", depositPaidPence: 0 });
      mockPiCancel.mockResolvedValue({});
      const res = fakeRes();

      await handleAppointmentCancel(cancelReq, res);

      expect(mockPiCancel).toHaveBeenCalledWith("pi_unit_real", { cancellation_reason: "abandoned" });
      expect(mockRefundCreate).not.toHaveBeenCalled();
    });

    it("does not try to void anything when a confirmed booking is cancelled", async () => {
      givenAppointment({});
      mockRefundCreate.mockResolvedValue({ id: "re_unit_2" });

      await handleAppointmentCancel(cancelReq, fakeRes());

      expect(mockPiCancel).not.toHaveBeenCalled();
    });
  });
});
