import { isPlaceholderCredential } from "../config/placeholder";
import { CommunicationService } from "../lib/communication-service";

// Copying backend/.env.example must give a working local setup: the template
// values there mean "not configured", never a real provider call (plan B1).
describe("placeholder provider credentials", () => {
  it.each([
    undefined,
    "",
    "   ",
    "sk_test_replace_with_stripe_secret_key",
    "pm_server_token_replace_me",
    "replace_with_daily_api_key",
    "AC_replace_with_twilio_account_sid",
    "pk_test_placeholder",
  ])("treats %p as not configured", (value) => {
    expect(isPlaceholderCredential(value)).toBe(true);
  });

  it.each(["sk_test_51Habc123realkey", "pm-0f3a9c2e-real-token", "AC0123456789abcdef", "stub"])(
    "treats %p as a real value",
    (value) => {
      expect(isPlaceholderCredential(value)).toBe(false);
    }
  );

  describe("email and SMS", () => {
    const saved = { ...process.env };
    const fetchSpy = jest.spyOn(global, "fetch");

    beforeEach(() => fetchSpy.mockReset());
    afterAll(() => {
      process.env = saved;
      fetchSpy.mockRestore();
    });

    it("does not call Postmark or Twilio with .env.example values", async () => {
      process.env.POSTMARK_SERVER_TOKEN = "pm_server_token_replace_me";
      process.env.TWILIO_ACCOUNT_SID = "AC_replace_with_twilio_account_sid";
      process.env.TWILIO_AUTH_TOKEN = "replace_with_twilio_auth_token";
      process.env.TWILIO_FROM_PHONE = "+447000000000";
      const service = new CommunicationService();

      const email = await service.sendEmail({ to: "someone@example.test", subject: "Test", html: "<p>Hi</p>", text: "Hi" });
      const sms = await service.sendSms({ to: "+447700900000", body: "Test" });

      expect(email.success).toBe(true);
      expect(sms.success).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
