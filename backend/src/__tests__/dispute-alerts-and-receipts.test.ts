// Dispute alerts to staff, and what a patient sees on a deposit receipt and
// bank statement. No database: Prisma, Stripe and email are mocked. Synthetic
// data only.

// Before anything loads the env module, which reads these once.
const savedEnv = { key: process.env.STRIPE_SECRET_KEY, whsec: process.env.STRIPE_WEBHOOK_SECRET };
process.env.STRIPE_SECRET_KEY = "sk_test_unit_not_a_real_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit_not_a_real_secret";

const mockConstructEvent = jest.fn();
const mockSendEmail = jest.fn();
const mockNotify = jest.fn().mockResolvedValue(undefined);
const mockAudit = jest.fn().mockResolvedValue(undefined);

jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
    refunds: { create: jest.fn() },
    paymentIntents: { cancel: jest.fn(), retrieve: jest.fn() },
  }))
);
const mockPrisma = {
  processedStripeEvent: { create: jest.fn(), delete: jest.fn() },
  appointment: { findFirst: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn() },
  vanServiceRequest: { findFirst: jest.fn(), findUnique: jest.fn() },
  patientProfile: { findUnique: jest.fn() },
};
jest.mock("../lib/prisma", () => ({ prisma: mockPrisma }));
jest.mock("../lib/communication-service", () => ({ communicationService: { sendEmail: (...a: unknown[]) => mockSendEmail(...a) } }));
jest.mock("../lib/audit-integrity", () => ({ createAuditLogWithIntegrity: (...a: unknown[]) => mockAudit(...a) }));
jest.mock("../lib/audit-security", () => ({ pseudonymiseIp: () => "hash" }));
jest.mock("../lib/background-jobs", () => ({ scheduleAppointmentReminderLadder: jest.fn(), cancelAppointmentReminders: jest.fn() }));
jest.mock("../lib/patient-push", () => ({ sendPatientNotification: (...a: unknown[]) => mockNotify(...a) }));
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

describe("payment details on receipts and statements", () => {
  const { depositPaymentDetails, isValidStatementSuffix, DEPOSIT_STATEMENT_SUFFIX, VAN_DEPOSIT_STATEMENT_SUFFIX } =
    require("../lib/payment-details") as typeof import("../lib/payment-details");

  it("sets a receipt email, a recognisable statement suffix and a generic description", () => {
    expect(depositPaymentDetails("clinic", "pat@example.test")).toEqual({
      description: "Pav Dental appointment deposit",
      statement_descriptor_suffix: "APPT DEPOSIT",
      receipt_email: "pat@example.test",
    });
    expect(depositPaymentDetails("van", " pat@example.test ")).toEqual({
      description: "Pav Dental van visit deposit",
      statement_descriptor_suffix: "VAN DEPOSIT",
      receipt_email: "pat@example.test",
    });
  });

  it("leaves the receipt email out rather than sending an empty one", () => {
    expect(depositPaymentDetails("clinic", null)).not.toHaveProperty("receipt_email");
    expect(depositPaymentDetails("clinic", "  ")).not.toHaveProperty("receipt_email");
  });

  it("keeps to Stripe's rules for the suffix: 22 characters, letters/digits/spaces, not digits only", () => {
    expect(isValidStatementSuffix(DEPOSIT_STATEMENT_SUFFIX)).toBe(true);
    expect(isValidStatementSuffix(VAN_DEPOSIT_STATEMENT_SUFFIX)).toBe(true);
    expect(isValidStatementSuffix("A".repeat(23))).toBe(false);
    expect(isValidStatementSuffix("12345")).toBe(false);
    expect(isValidStatementSuffix("DEPOSIT*")).toBe(false);
    expect(isValidStatementSuffix("")).toBe(false);
  });

  it("never puts a treatment name in the description", () => {
    expect(depositPaymentDetails("clinic", "a@example.test").description).not.toMatch(/check|hygiene|emergency|video/i);
  });
});

describe("dispute alert email", () => {
  const { buildDisputeAlert, alertStaffOfDispute, disputeDashboardUrl } = require("../lib/payment-alerts") as typeof import("../lib/payment-alerts");
  const base = {
    kind: "opened" as const,
    disputeId: "dp_unit_1",
    paymentIntentId: "pi_unit_1",
    amountPence: 1000,
    currency: "gbp",
    reason: "product_not_received",
    status: "needs_response",
    evidenceDueBy: Math.floor(Date.UTC(2026, 10, 20, 12, 0, 0) / 1000),
    appointmentId: "appt-1",
    vanRequestId: null,
    livemode: false,
  };

  beforeEach(() => jest.clearAllMocks());

  it("says what is needed and by when, with a link to the dispute", () => {
    const { subject, html, text } = buildDisputeAlert(base);
    expect(subject).toMatch(/ACTION NEEDED/);
    expect(subject).toContain("£10.00");
    expect(subject).toMatch(/20 November 2026/);
    expect(subject).toMatch(/TEST MODE/);
    expect(text).toContain("https://dashboard.stripe.com/test/disputes/dp_unit_1");
    expect(html).toContain("product not received");
  });

  it("links to the live dashboard for a live dispute", () => {
    expect(disputeDashboardUrl("dp_x", true)).toBe("https://dashboard.stripe.com/disputes/dp_x");
    expect(buildDisputeAlert({ ...base, livemode: true }).subject).not.toMatch(/TEST MODE/);
  });

  it("carries no patient details", () => {
    const { subject, html, text } = buildDisputeAlert(base);
    const all = `${subject} ${html} ${text}`;
    expect(all).not.toMatch(/@/);
    expect(all).not.toMatch(/check-?up|hygiene|dentist|patient name/i);
  });

  it("reports the outcome when closed", () => {
    expect(buildDisputeAlert({ ...base, kind: "closed", status: "lost", evidenceDueBy: null }).subject).toMatch(/lost/);
    expect(buildDisputeAlert({ ...base, kind: "closed", status: "won", evidenceDueBy: null }).subject).toMatch(/won/);
  });

  it("escapes anything it prints into the HTML", () => {
    const { html } = buildDisputeAlert({ ...base, reason: "<script>x</script>" });
    expect(html).not.toContain("<script>");
  });

  it("sends to the ops alert address and reports whether it went", async () => {
    mockSendEmail.mockResolvedValueOnce({ success: true });
    expect(await alertStaffOfDispute(base)).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: expect.stringContaining("@") }));
    mockSendEmail.mockResolvedValueOnce({ success: false });
    expect(await alertStaffOfDispute(base)).toBe(false);
    mockSendEmail.mockRejectedValueOnce(new Error("postmark down"));
    expect(await alertStaffOfDispute(base)).toBe(false);
  });
});

describe("dispute webhooks", () => {
  let stripeWebhookHandler: typeof import("../routes/payments").stripeWebhookHandler;
  const saved = savedEnv;
  const req = { headers: { "stripe-signature": "sig" }, body: Buffer.from("{}"), ip: "127.0.0.1" } as any;
  const dispute = (type: string, status = "needs_response") => ({
    id: "evt_dp_1",
    type,
    livemode: false,
    data: {
      object: {
        id: "dp_unit_1",
        amount: 1000,
        currency: "gbp",
        reason: "fraudulent",
        status,
        payment_intent: "pi_unit_1",
        evidence_details: { due_by: 1795000000 },
      },
    },
  });

  beforeAll(() => {
    stripeWebhookHandler = require("../routes/payments").stripeWebhookHandler;
  });
  afterAll(() => {
    if (saved.key === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = saved.key;
    if (saved.whsec === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = saved.whsec;
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotify.mockResolvedValue(undefined);
    mockAudit.mockResolvedValue(undefined);
    mockPrisma.processedStripeEvent.create.mockResolvedValue({});
    mockPrisma.processedStripeEvent.delete.mockResolvedValue({});
    mockPrisma.appointment.findFirst.mockResolvedValue({ id: "appt-1", patientId: "patient-1" });
    mockPrisma.vanServiceRequest.findFirst.mockResolvedValue(null);
  });

  it("emails staff about a new dispute before telling the patient, then audits", async () => {
    mockConstructEvent.mockReturnValue(dispute("charge.dispute.created"));
    mockSendEmail.mockResolvedValue({ success: true });
    const calls: string[] = [];
    mockSendEmail.mockImplementation(async () => (calls.push("staff"), { success: true }));
    mockNotify.mockImplementation(async () => void calls.push("patient"));
    const res = fakeRes();

    await stripeWebhookHandler(req, res);

    expect(calls).toEqual(["staff", "patient"]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "stripe.charge.dispute.created" }));
  });

  it("fails the webhook, and releases the event for Stripe to retry, when staff cannot be emailed", async () => {
    mockConstructEvent.mockReturnValue(dispute("charge.dispute.created"));
    mockSendEmail.mockResolvedValue({ success: false });
    const res = fakeRes();

    await stripeWebhookHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(mockPrisma.processedStripeEvent.delete).toHaveBeenCalledWith({ where: { id: "evt_dp_1" } });
    expect(mockNotify).not.toHaveBeenCalled(); // the retry will not tell the patient twice
  });

  it("emails staff when a dispute closes and records the outcome", async () => {
    mockConstructEvent.mockReturnValue(dispute("charge.dispute.closed", "lost"));
    mockSendEmail.mockResolvedValue({ success: true });
    const res = fakeRes();

    await stripeWebhookHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.stringMatching(/lost/) }));
    expect(mockAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "stripe.charge.dispute.closed", metadata: expect.objectContaining({ outcome: "lost" }) })
    );
  });

  it("does not email twice for a duplicate delivery", async () => {
    mockConstructEvent.mockReturnValue(dispute("charge.dispute.created"));
    mockPrisma.processedStripeEvent.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    const res = fakeRes();

    await stripeWebhookHandler(req, res);

    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true, duplicate: true });
  });
});
