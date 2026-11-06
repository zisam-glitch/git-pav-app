import http from "http";

// CS-17: a deposit that succeeds after its hold expired, or after the booking
// was cancelled, is refunded in full instead of confirming the booking.
// Stripe runs in non-mock mode with a stubbed client; no network calls.
const mockRetrieve = jest.fn();
const mockRefundCreate = jest.fn();
const mockConstructEvent = jest.fn();
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    paymentIntents: { retrieve: mockRetrieve },
    refunds: { create: mockRefundCreate },
    webhooks: { constructEvent: mockConstructEvent },
  }))
);

describe("late deposits", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let token: string;
  let patientId: string;
  let service: { id: string; depositPence: number; durationMinutes: number };
  const createdIds: string[] = [];
  let piCounter = 0;
  const originalEnv = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  };

  beforeAll(async () => {
    // Must be set before the app (and env.ts) is loaded.
    process.env.STRIPE_SECRET_KEY = "sk_test_unit_not_a_real_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit_not_a_real_secret";
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;

    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3009, resolve));
    baseUrl = "http://localhost:3009";

    const email = `late-deposit-${Date.now()}@example.test`;
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "UnitTest12345-synth", firstName: "Test", lastName: "Patient" }),
    });
    expect(reg.status).toBe(201);
    token = ((await reg.json()) as any).accessToken;
    const user = await prisma.user.findUniqueOrThrow({ where: { email }, include: { patientProfile: true } });
    patientId = user.patientProfile!.id;
    service = await prisma.service.findFirstOrThrow({
      where: { depositPence: { gt: 0 } },
      select: { id: true, depositPence: true, durationMinutes: true },
    });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { id: { in: createdIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // process.env is shared by later test files in this jest worker.
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  beforeEach(() => {
    mockRetrieve.mockReset();
    mockRefundCreate.mockReset().mockResolvedValue({ id: "re_unit_test" });
    mockConstructEvent.mockReset();
  });

  async function appointment(opts: { status: "draft_hold" | "cancelled"; holdMinutes: number }) {
    const paymentIntentId = `pi_late_${Date.now()}_${piCounter++}`;
    const start = new Date(Date.now() + 4 * 86400000 + createdIds.length * 3600000);
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        serviceId: service.id,
        channel: "clinic",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + service.durationMinutes * 60000),
        status: opts.status,
        holdExpiresAt: new Date(Date.now() + opts.holdMinutes * 60000),
        totalPricePence: 0,
        depositPaidPence: 0,
        stripePaymentId: paymentIntentId,
      },
    });
    createdIds.push(appt.id);
    return { appt, paymentIntentId };
  }

  const succeededIntent = (appointmentId: string, id: string) => ({
    id,
    status: "succeeded",
    currency: "gbp",
    amount_received: service.depositPence,
    metadata: { appointmentId },
  });

  const confirm = (id: string) =>
    fetch(`${baseUrl}/api/booking/appointments/${id}/confirm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });

  const webhook = (intent: unknown) => {
    mockConstructEvent.mockReturnValueOnce({ id: `evt_${Date.now()}`, type: "payment_intent.succeeded", data: { object: intent } });
    return fetch(`${baseUrl}/api/payments/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": "t=0,v1=unit" },
      body: "{}",
    });
  };

  const statusOf = async (id: string) => (await prisma.appointment.findUniqueOrThrow({ where: { id } })).status;
  const refundAudits = (pi: string) =>
    prisma.auditLog.count({ where: { action: "appointment.late_deposit_refunded", resourceId: pi } });

  it("confirm refunds a deposit that arrived after the hold expired", async () => {
    const { appt, paymentIntentId } = await appointment({ status: "draft_hold", holdMinutes: -1 });
    mockRetrieve.mockResolvedValue(succeededIntent(appt.id, paymentIntentId));

    const res = await confirm(appt.id);
    expect(res.status).toBe(409);
    expect(((await res.json()) as any).depositRefunded).toBe(true);
    expect(mockRefundCreate).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: paymentIntentId }),
      { idempotencyKey: `late-deposit-refund:${paymentIntentId}` }
    );
    expect(await statusOf(appt.id)).toBe("cancelled");
    expect(await refundAudits(paymentIntentId)).toBe(1);
  });

  it("the webhook refunds a deposit for a booking that was already cancelled, once", async () => {
    const { appt, paymentIntentId } = await appointment({ status: "cancelled", holdMinutes: 5 });
    const intent = succeededIntent(appt.id, paymentIntentId);

    expect((await webhook(intent)).status).toBe(200);
    expect((await webhook(intent)).status).toBe(200);

    // Both deliveries use the same Stripe idempotency key, so one refund.
    expect(mockRefundCreate).toHaveBeenCalledTimes(2);
    expect(new Set(mockRefundCreate.mock.calls.map((c) => c[1].idempotencyKey)).size).toBe(1);
    expect(await refundAudits(paymentIntentId)).toBe(1);
    expect(await statusOf(appt.id)).toBe("cancelled");
  });

  it("the webhook still confirms a deposit inside the hold", async () => {
    const { appt, paymentIntentId } = await appointment({ status: "draft_hold", holdMinutes: 5 });
    expect((await webhook(succeededIntent(appt.id, paymentIntentId))).status).toBe(200);
    expect(await statusOf(appt.id)).toBe("confirmed");
    expect(mockRefundCreate).not.toHaveBeenCalled();

    // A duplicate event for the confirmed booking does not refund it.
    expect((await webhook(succeededIntent(appt.id, paymentIntentId))).status).toBe(200);
    expect(mockRefundCreate).not.toHaveBeenCalled();
  });

  it("asks Stripe to retry the event when the refund fails", async () => {
    const { appt, paymentIntentId } = await appointment({ status: "draft_hold", holdMinutes: -1 });
    mockRefundCreate.mockRejectedValueOnce(new Error("stripe down"));
    expect((await webhook(succeededIntent(appt.id, paymentIntentId))).status).toBe(500);
    expect(await refundAudits(paymentIntentId)).toBe(0);
  });
});
