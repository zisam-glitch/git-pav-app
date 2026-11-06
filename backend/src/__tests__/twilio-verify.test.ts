import { checkPhoneVerification, startPhoneVerification, verifyConfigFromEnv } from "../lib/twilio-verify";

const SERVICE = "VA" + "a1".repeat(16);
const config = { accountSid: "ACtest", authToken: "token-test", serviceSid: SERVICE };

interface Call {
  url: string;
  auth: string;
  body: URLSearchParams;
}

/** A stand-in for fetch that records what was sent and answers with a fixed reply. */
function fakeFetch(status: number, reply: unknown) {
  const calls: Call[] = [];
  const impl = (async (url: unknown, init?: RequestInit) => {
    calls.push({
      url: String(url),
      auth: String((init?.headers as Record<string, string>).Authorization),
      body: new URLSearchParams(String(init?.body)),
    });
    return new Response(JSON.stringify(reply), { status });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe("Twilio Verify for phone codes", () => {
  let errors: jest.SpyInstance;
  beforeEach(() => {
    errors = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => errors.mockRestore());

  describe("config", () => {
    const base = { TWILIO_ACCOUNT_SID: "ACabc", TWILIO_AUTH_TOKEN: "tok", TWILIO_VERIFY_SERVICE_SID: SERVICE } as NodeJS.ProcessEnv;

    it("needs all three settings", () => {
      expect(verifyConfigFromEnv(base)).toEqual({ accountSid: "ACabc", authToken: "tok", serviceSid: SERVICE });
      expect(verifyConfigFromEnv({ ...base, TWILIO_VERIFY_SERVICE_SID: undefined })).toBeNull();
      expect(verifyConfigFromEnv({ ...base, TWILIO_AUTH_TOKEN: undefined })).toBeNull();
      expect(verifyConfigFromEnv({ ...base, TWILIO_ACCOUNT_SID: "" })).toBeNull();
    });

    it("ignores a placeholder or mistyped service id", () => {
      expect(verifyConfigFromEnv({ ...base, TWILIO_VERIFY_SERVICE_SID: "VAxxxxxxxx" })).toBeNull();
      expect(verifyConfigFromEnv({ ...base, TWILIO_VERIFY_SERVICE_SID: "replace_me" })).toBeNull();
      expect(verifyConfigFromEnv({ ...base, TWILIO_ACCOUNT_SID: "mock_sid" })).toBeNull();
    });
  });

  describe("starting a verification", () => {
    it("asks Twilio to text the number, signed with the account credentials", async () => {
      const { impl, calls } = fakeFetch(201, { sid: "VE123", status: "pending" });
      expect(await startPhoneVerification(config, "+447700900123", impl)).toBe(true);
      expect(calls[0].url).toBe(`https://verify.twilio.com/v2/Services/${SERVICE}/Verifications`);
      expect(calls[0].body.get("To")).toBe("+447700900123");
      expect(calls[0].body.get("Channel")).toBe("sms");
      expect(calls[0].auth).toBe(`Basic ${Buffer.from("ACtest:token-test").toString("base64")}`);
    });

    it("reports a refusal without leaking the number into the log", async () => {
      const { impl } = fakeFetch(400, { code: 60203, message: "Max send attempts reached" });
      expect(await startPhoneVerification(config, "+447700900123", impl)).toBe(false);
      const logged = JSON.stringify(errors.mock.calls);
      expect(logged).toContain("60203");
      expect(logged).not.toContain("+447700900123");
      expect(logged).not.toContain("token-test");
    });

    it("reports false when Twilio can't be reached", async () => {
      const down = (async () => {
        throw new Error("offline");
      }) as unknown as typeof fetch;
      expect(await startPhoneVerification(config, "+447700900123", down)).toBe(false);
    });
  });

  describe("checking a code", () => {
    it("accepts only an approved verification", async () => {
      const ok = fakeFetch(200, { status: "approved" });
      expect(await checkPhoneVerification(config, "+447700900123", "483921", ok.impl)).toBe(true);
      expect(ok.calls[0].url).toBe(`https://verify.twilio.com/v2/Services/${SERVICE}/VerificationCheck`);
      expect(ok.calls[0].body.get("To")).toBe("+447700900123");
      expect(ok.calls[0].body.get("Code")).toBe("483921");

      const wrong = fakeFetch(200, { status: "pending" });
      expect(await checkPhoneVerification(config, "+447700900123", "000000", wrong.impl)).toBe(false);
    });

    it("treats an expired or used verification (404) as a wrong code, quietly", async () => {
      const gone = fakeFetch(404, { code: 20404 });
      expect(await checkPhoneVerification(config, "+447700900123", "483921", gone.impl)).toBe(false);
      expect(errors).not.toHaveBeenCalled();
    });

    it("treats a server error or an outage as a failed check", async () => {
      const broken = fakeFetch(500, { code: 20500 });
      expect(await checkPhoneVerification(config, "+447700900123", "483921", broken.impl)).toBe(false);
      const down = (async () => {
        throw new Error("offline");
      }) as unknown as typeof fetch;
      expect(await checkPhoneVerification(config, "+447700900123", "483921", down)).toBe(false);
    });

    it("never logs the code", async () => {
      const broken = fakeFetch(500, { code: 20500 });
      await checkPhoneVerification(config, "+447700900123", "483921", broken.impl);
      expect(JSON.stringify(errors.mock.calls)).not.toContain("483921");
    });
  });
});
