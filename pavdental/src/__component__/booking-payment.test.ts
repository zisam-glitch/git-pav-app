import {
  runBookingPayment,
  type BookingInput,
  type PaymentDeps,
  type PreparedPayment,
} from "@/features/booking/booking-payment";

const intent = (over: Partial<PreparedPayment> = {}): PreparedPayment => ({
  clientSecret: "pi_secret",
  paymentIntentId: "pi_1",
  publishableKey: "pk_test",
  amountPence: 2500,
  customerId: null,
  customerEphemeralKeySecret: null,
  isMock: false,
  ...over,
});

function setup(over: Partial<PaymentDeps> = {}) {
  const calls: string[] = [];
  const deps: PaymentDeps = {
    createAppointment: jest.fn(async () => {
      calls.push("create");
      return { id: "appt-1" };
    }),
    createPaymentIntent: jest.fn(async () => {
      calls.push("intent");
      return intent();
    }),
    confirmAppointment: jest.fn(async () => {
      calls.push("confirm");
      return {};
    }),
    initStripe: jest.fn(async () => {
      calls.push("initStripe");
    }),
    payWithWallet: jest.fn(async () => {
      calls.push("wallet");
      return {};
    }),
    payWithSheet: jest.fn(async () => {
      calls.push("sheet");
      return {};
    }),
    onPaid: jest.fn(() => {
      calls.push("paid");
    }),
    report: jest.fn(),
    ...over,
  };
  return { deps, calls };
}

const input = (over: Partial<BookingInput> = {}): BookingInput => ({
  service: { id: "check-up" },
  slot: { id: "s1", startTimeUtc: "2026-11-20T10:00:00Z", endTimeUtc: "2026-11-20T10:30:00Z", clinicianId: "d1", clinicId: "c1" },
  channel: "clinic",
  clinic: { id: "c1" },
  clinician: { id: "d1" },
  attemptKey: "key-1",
  method: "card",
  ...over,
});

describe("runBookingPayment", () => {
  it("books, prepares, pays, then confirms, and marks paid before confirming", async () => {
    const { deps, calls } = setup();
    const out = await runBookingPayment(deps, input());
    expect(out).toEqual({ kind: "confirmed", appointmentId: "appt-1" });
    expect(calls).toEqual(["create", "intent", "initStripe", "sheet", "paid", "confirm"]);
    expect(deps.confirmAppointment).toHaveBeenCalledWith("appt-1", "pi_1");
  });

  it("is still confirmed when the confirm call fails after payment (the webhook will confirm)", async () => {
    const { deps } = setup({ confirmAppointment: jest.fn(async () => Promise.reject(new Error("503"))) });
    expect(await runBookingPayment(deps, input())).toEqual({ kind: "confirmed", appointmentId: "appt-1" });
    expect(deps.onPaid).toHaveBeenCalled();
  });

  it("does not confirm or report when the patient closes the sheet", async () => {
    const { deps } = setup({ payWithSheet: jest.fn(async () => ({ error: { code: "Canceled" }, stage: "present" as const })) });
    expect(await runBookingPayment(deps, input())).toEqual({ kind: "cancelled" });
    expect(deps.confirmAppointment).not.toHaveBeenCalled();
    expect(deps.onPaid).not.toHaveBeenCalled();
    expect(deps.report).not.toHaveBeenCalled();
  });

  it("treats a cancelled wallet sheet as a choice too", async () => {
    const { deps } = setup({ payWithWallet: jest.fn(async () => ({ error: { code: "Canceled" } })) });
    expect(await runBookingPayment(deps, input({ method: "wallet" }))).toEqual({ kind: "cancelled" });
    expect(deps.payWithSheet).not.toHaveBeenCalled();
  });

  it("uses the wallet when asked, not the card sheet", async () => {
    const { deps, calls } = setup();
    await runBookingPayment(deps, input({ method: "wallet" }));
    expect(calls).toContain("wallet");
    expect(calls).not.toContain("sheet");
  });

  it("shows plain wording for a decline, never the provider's text, and reports the original", async () => {
    const providerError = { code: "Failed", message: "Your card was declined. Decline code: insufficient_funds" };
    const { deps } = setup({ payWithSheet: jest.fn(async () => ({ error: providerError, stage: "present" as const })) });
    const out = await runBookingPayment(deps, input());
    expect(out.kind).toBe("failed");
    if (out.kind === "failed") {
      expect(out.message).not.toContain("insufficient_funds");
      expect(out.message).toMatch(/payment didn't go through/i);
    }
    expect(deps.report).toHaveBeenCalledWith(providerError, "payment failed");
    expect(deps.confirmAppointment).not.toHaveBeenCalled();
  });

  it("a setup error is a failure even when it says Canceled", async () => {
    const { deps } = setup({ payWithSheet: jest.fn(async () => ({ error: { code: "Canceled" }, stage: "setup" as const })) });
    expect((await runBookingPayment(deps, input())).kind).toBe("failed");
    expect(deps.report).toHaveBeenCalledWith({ code: "Canceled" }, "payment sheet setup failed");
  });

  it("confirms a mock payment straight away without opening any sheet", async () => {
    const { deps, calls } = setup({ createPaymentIntent: jest.fn(async () => intent({ isMock: true, clientSecret: null })) });
    expect(await runBookingPayment(deps, input())).toEqual({ kind: "confirmed", appointmentId: "appt-1" });
    expect(calls).toEqual(["create", "confirm", "paid"]);
    expect(deps.payWithSheet).not.toHaveBeenCalled();
    expect(deps.payWithWallet).not.toHaveBeenCalled();
  });

  it("fails plainly when the server sends no client secret", async () => {
    const { deps } = setup({ createPaymentIntent: jest.fn(async () => intent({ clientSecret: null })) });
    expect((await runBookingPayment(deps, input())).kind).toBe("failed");
    expect(deps.payWithSheet).not.toHaveBeenCalled();
  });

  it("says to check the connection when the booking request cannot reach the server", async () => {
    const { deps } = setup({ createAppointment: jest.fn(async () => Promise.reject(new TypeError("Network request failed"))) });
    const out = await runBookingPayment(deps, input());
    expect(out).toEqual({ kind: "failed", title: "Something went wrong", message: "We couldn't reach the server. Check your connection and try again." });
    expect(deps.createPaymentIntent).not.toHaveBeenCalled();
  });

  it("keeps our server's plain message, such as a time that was just taken", async () => {
    const { deps } = setup({ createAppointment: jest.fn(async () => Promise.reject(new Error("That time has just been taken."))) });
    const out = await runBookingPayment(deps, input());
    expect(out.kind === "failed" && out.message).toBe("That time has just been taken.");
  });

  it("sends nothing for 'any practitioner' and drops the clinic for a video visit", async () => {
    const { deps } = setup();
    await runBookingPayment(
      deps,
      input({ channel: "video", clinic: { id: "c1" }, clinician: { id: "" }, slot: { id: "s1", startTimeUtc: "a", endTimeUtc: "b" } })
    );
    const sent = (deps.createAppointment as jest.Mock).mock.calls[0][0];
    expect(sent.clinicianId).toBeUndefined();
    expect(sent.clinicId).toBeUndefined();
    expect(sent.channel).toBe("video");
  });

  it("passes the attempt key, the voucher and the child it is for", async () => {
    const { deps } = setup();
    await runBookingPayment(deps, input({ voucherCode: "V-123", dependantId: "kid-1" }));
    expect((deps.createAppointment as jest.Mock).mock.calls[0][1]).toBe("key-1");
    expect((deps.createAppointment as jest.Mock).mock.calls[0][0].dependantId).toBe("kid-1");
    expect(deps.createPaymentIntent).toHaveBeenCalledWith("appt-1", "V-123");
  });

  it("sends the patient back to choose when a service or time is missing, creating nothing", async () => {
    const a = setup();
    expect(await runBookingPayment(a.deps, input({ service: null }))).toMatchObject({ kind: "incomplete", redirect: "service-catalog" });
    const b = setup();
    expect(await runBookingPayment(b.deps, input({ slot: { id: "s1" } }))).toMatchObject({ kind: "incomplete", redirect: "slot-picker" });
    expect(a.deps.createAppointment).not.toHaveBeenCalled();
    expect(b.deps.createAppointment).not.toHaveBeenCalled();
  });
});
