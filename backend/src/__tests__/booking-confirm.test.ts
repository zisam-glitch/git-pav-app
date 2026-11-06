import http from "http";

// Regression tests for BK-5: an appointment is confirmed only from a verified
// PaymentIntent that belongs to it and matches the server-side deposit. Stripe
// runs in non-mock mode here with a stubbed client; no network calls are made.
const mockRetrieve = jest.fn();
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    paymentIntents: { retrieve: mockRetrieve },
    webhooks: { constructEvent: jest.fn() },
  }))
);

describe("PATCH /api/booking/appointments/:id/confirm (non-mock Stripe)", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let token: string;
  let patientId: string;
  let service: { id: string; depositPence: number; durationMinutes: number };
  const createdIds: string[] = [];
  let originalStripeKey: string | undefined;

  beforeAll(async () => {
    // Must be set before the app (and env.ts) is loaded.
    originalStripeKey = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = "sk_test_unit_not_a_real_key";
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;

    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3004, resolve));
    baseUrl = "http://localhost:3004";

    const email = `confirm-test-${Date.now()}@example.test`;
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
    if (originalStripeKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalStripeKey;
  });

  beforeEach(() => mockRetrieve.mockReset());

  async function heldAppointment(stripePaymentId: string | null) {
    const start = new Date(Date.now() + 3 * 86400000 + createdIds.length * 3600000);
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        serviceId: service.id,
        channel: "clinic",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + service.durationMinutes * 60000),
        status: "draft_hold",
        holdExpiresAt: new Date(Date.now() + 600000),
        totalPricePence: 0,
        depositPaidPence: 0,
        stripePaymentId,
      },
    });
    createdIds.push(appt.id);
    return appt;
  }

  function intent(appointmentId: string, overrides: Record<string, unknown> = {}) {
    return {
      id: "pi_unit_test",
      status: "succeeded",
      currency: "gbp",
      amount_received: service.depositPence,
      metadata: { appointmentId },
      ...overrides,
    };
  }

  const confirm = (id: string, body: Record<string, unknown> = {}) =>
    fetch(`${baseUrl}/api/booking/appointments/${id}/confirm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

  it("refuses when no deposit payment was started", async () => {
    const appt = await heldAppointment(null);
    expect((await confirm(appt.id)).status).toBe(402);
    expect(mockRetrieve).not.toHaveBeenCalled();
  });

  it("no longer lets pi_mock_ or pi_e2e_ ids skip Stripe", async () => {
    for (const id of ["pi_mock_bypass", "pi_e2e_bypass"]) {
      const appt = await heldAppointment(id);
      mockRetrieve.mockResolvedValueOnce(intent(appt.id, { status: "requires_payment_method" }));
      expect((await confirm(appt.id)).status).toBe(402);
      expect(mockRetrieve).toHaveBeenLastCalledWith(id);
    }
  });

  it("rejects a client-supplied deposit amount", async () => {
    const appt = await heldAppointment("pi_unit_test");
    expect((await confirm(appt.id, { depositPaidPence: 999999 })).status).toBe(400);
  });

  it("rejects a payment id other than the one stored for the appointment", async () => {
    const appt = await heldAppointment("pi_unit_test");
    expect((await confirm(appt.id, { stripePaymentId: "pi_someone_else" })).status).toBe(409);
  });

  it("rejects an intent created for a different appointment", async () => {
    const appt = await heldAppointment("pi_unit_test");
    mockRetrieve.mockResolvedValueOnce(intent("00000000-0000-0000-0000-000000000000"));
    expect((await confirm(appt.id)).status).toBe(409);
  });

  it("rejects an intent that has not succeeded", async () => {
    const appt = await heldAppointment("pi_unit_test");
    mockRetrieve.mockResolvedValueOnce(intent(appt.id, { status: "processing" }));
    expect((await confirm(appt.id)).status).toBe(402);
  });

  it("rejects an amount or currency that doesn't match the deposit", async () => {
    const appt = await heldAppointment("pi_unit_test");
    mockRetrieve.mockResolvedValueOnce(intent(appt.id, { amount_received: 1 }));
    expect((await confirm(appt.id)).status).toBe(409);
    mockRetrieve.mockResolvedValueOnce(intent(appt.id, { currency: "usd" }));
    expect((await confirm(appt.id)).status).toBe(409);
    const stored = await prisma.appointment.findUniqueOrThrow({ where: { id: appt.id } });
    expect(stored.status).toBe("draft_hold");
  });

  it("confirms a verified payment and records Stripe's amount", async () => {
    const appt = await heldAppointment("pi_unit_test");
    mockRetrieve.mockResolvedValueOnce(intent(appt.id));
    const res = await confirm(appt.id, { stripePaymentId: "pi_unit_test" });
    expect(res.status).toBe(200);
    const stored = await prisma.appointment.findUniqueOrThrow({ where: { id: appt.id } });
    expect(stored.status).toBe("confirmed");
    expect(stored.depositPaidPence).toBe(service.depositPence);

    // A retry after confirmation returns the stored state without calling Stripe.
    const again = await confirm(appt.id);
    expect(again.status).toBe(200);
    expect(mockRetrieve).toHaveBeenCalledTimes(1);
  });
});
