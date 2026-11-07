import jwt from "jsonwebtoken";
import { deployedServiceGaps, env, hostedMockPaymentsProblem, parseNodeEnv, validateDeployedConfig } from "../config/env";
import { LEGACY_TOKEN_CUTOFF, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../lib/jwt";

// Synthetic values only: none of these are real keys.
const strong = (label: string) => `${label}_unit_test_secret_0123456789abcdef0123`;

function deployed(overrides: Record<string, unknown> = {}) {
  return {
    databaseUrl: "postgresql://u:p@db:5432/pav",
    redisUrl: "redis://cache:6379",
    jwtAccessSecret: strong("access"),
    jwtRefreshSecret: strong("refresh"),
    auditIpHmacSecret: strong("audit"),
    encryptionKey: strong("kek"),
    stripeSecretKey: "sk_live_unittestnotarealkey",
    stripeWebhookSecret: "whsec_unittestnotarealsecret",
    stripePublishableKey: "pk_live_unittestnotarealkey",
    allowedOrigins: ["https://app.example.com"],
    appUrl: "https://app.example.com",
    postmarkServerToken: "unittest-postmark-token-not-real",
    dailyApiKey: "unittest-daily-key-not-real",
    s3BucketName: "unittest-bucket",
    prescriptionSigningKey: "unittest-signing-key-not-real",
    twilioAccountSid: "unittest-twilio-sid-not-real",
    twilioAuthToken: "unittest-twilio-token-not-real",
    twilioFromPhone: "+447700900000",
    sentryDsn: "https://mockpublickey@o123456.ingest.sentry.io/1234567",
    ...overrides,
  };
}

describe("parseNodeEnv", () => {
  it.each(["development", "test", "staging", "production"])("accepts %s", (value) => {
    expect(parseNodeEnv(value)).toBe(value);
  });

  it.each([undefined, "", "  ", "prod", "Production", "dev", "local"])("rejects %p", (value) => {
    expect(() => parseNodeEnv(value)).toThrow(/NODE_ENV/);
  });
});

describe("module boot", () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = original;
  });

  it("refuses to load with an unknown NODE_ENV instead of using dev defaults", () => {
    process.env.NODE_ENV = "prod";
    jest.isolateModules(() => {
      expect(() => require("../config/env")).toThrow(/not recognised/);
    });
  });
});

describe("validateDeployedConfig", () => {
  it("accepts a complete production config", () => {
    expect(() => validateDeployedConfig("production", deployed())).not.toThrow();
  });

  it("allows dev defaults in development and test when allowDevDefaults is true", () => {
    expect(() => validateDeployedConfig("development", { allowedOrigins: [], allowDevDefaults: true })).not.toThrow();
    expect(() => validateDeployedConfig("test", { allowedOrigins: [], allowDevDefaults: true })).not.toThrow();
  });

  it("rejects missing secrets in development and test when allowDevDefaults is false", () => {
    expect(() => validateDeployedConfig("development", { allowedOrigins: [], allowDevDefaults: false })).toThrow(
      /ALLOW_DEV_DEFAULTS=1/
    );
    expect(() => validateDeployedConfig("test", { allowedOrigins: [], allowDevDefaults: false })).toThrow(
      /ALLOW_DEV_DEFAULTS=1/
    );
  });

  it("rejects allowDevDefaults in production and staging", () => {
    expect(() => validateDeployedConfig("production", deployed({ allowDevDefaults: true }))).toThrow(
      /ALLOW_DEV_DEFAULTS must not be set/
    );
    expect(() => validateDeployedConfig("staging", deployed({ allowDevDefaults: true }))).toThrow(
      /ALLOW_DEV_DEFAULTS must not be set/
    );
  });

  it("rejects missing secrets in production", () => {
    expect(() => validateDeployedConfig("production", deployed({ jwtAccessSecret: undefined }))).toThrow(
      /JWT_ACCESS_SECRET/
    );
  });

  it.each([
    "dev_access_secret_change_me_padding_padding",
    "pavdental_dev_jwt_access_secret_super_secure_32chars_min",
    "replace_with_a_long_random_value_0123456789",
    "short",
  ])("rejects dev or weak JWT secret %p", (secret) => {
    expect(() => validateDeployedConfig("production", deployed({ jwtAccessSecret: secret }))).toThrow(
      /JWT_ACCESS_SECRET/
    );
  });

  it.each(["sk_test_mock_stripe_key_pav_dental", "sk_test_realtestkey", "sk_live_replace_with_key"])(
    "production rejects Stripe secret key %p",
    (key) => {
      expect(() => validateDeployedConfig("production", deployed({ stripeSecretKey: key }))).toThrow(
        /STRIPE_SECRET_KEY/
      );
    }
  );

  it("staging rejects mock and live Stripe keys but accepts real test keys", () => {
    const staging = (overrides: Record<string, unknown>) =>
      deployed({ stripePublishableKey: "pk_test_unittestnotarealkey", ...overrides });
    expect(() => validateDeployedConfig("staging", staging({ stripeSecretKey: "sk_test_mock_e2e" }))).toThrow(
      /STRIPE_SECRET_KEY/
    );
    expect(() => validateDeployedConfig("staging", staging({ stripeSecretKey: "sk_live_unittest" }))).toThrow(
      /STRIPE_SECRET_KEY/
    );
    expect(() => validateDeployedConfig("staging", staging({ stripeSecretKey: "sk_test_unittest" }))).not.toThrow();
  });

  it.each(["pk_test_placeholder", "pk_live_placeholder"])("production rejects publishable key %p", (key) => {
    expect(() => validateDeployedConfig("production", deployed({ stripePublishableKey: key }))).toThrow(
      /STRIPE_PUBLISHABLE_KEY/
    );
  });

  it("rejects a placeholder webhook secret", () => {
    expect(() =>
      validateDeployedConfig("production", deployed({ stripeWebhookSecret: "whsec_replace_with_stripe_webhook_secret" }))
    ).toThrow(/STRIPE_WEBHOOK_SECRET/);
  });

  it("requires an HTTPS origin in production", () => {
    expect(() => validateDeployedConfig("production", deployed({ allowedOrigins: [] }))).toThrow(/ALLOWED_ORIGINS/);
  });

  it.each([
    ["appUrl", undefined, /APP_URL/],
    ["appUrl", "http://app.example.com", /APP_URL/],
    ["postmarkServerToken", undefined, /POSTMARK_SERVER_TOKEN/],
    ["postmarkServerToken", "pm_server_token_replace_me", /POSTMARK_SERVER_TOKEN/],
    ["postmarkServerToken", "mock-token", /POSTMARK_SERVER_TOKEN/],
    ["dailyApiKey", "stub", /DAILY_API_KEY/],
    ["dailyApiKey", "replace_with_daily_api_key", /DAILY_API_KEY/],
    ["s3BucketName", undefined, /S3_BUCKET_NAME/],
    ["prescriptionSigningKey", undefined, /PRESCRIPTION_SIGNING_KEY/],
    ["twilioAccountSid", undefined, /TWILIO_ACCOUNT_SID/],
    ["twilioAuthToken", "replace_me", /TWILIO_AUTH_TOKEN/],
    ["twilioFromPhone", undefined, /TWILIO_FROM_PHONE/],
    ["sentryDsn", undefined, /SENTRY_DSN/],
    ["sentryDsn", "replace_me", /SENTRY_DSN/],
    ["sentryDsn", "mock-sentry-dsn", /SENTRY_DSN/],
    ["sentryDsn", "stub", /SENTRY_DSN/],
  ])("production rejects %s = %p", (field, value, pattern) => {
    expect(() => validateDeployedConfig("production", deployed({ [field]: value }))).toThrow(pattern);
  });

  it("staging boots without email, video or storage, which it only warns about", () => {
    const staging = deployed({
      stripeSecretKey: "sk_test_unittest",
      stripePublishableKey: "pk_test_unittestnotarealkey",
      appUrl: undefined,
      postmarkServerToken: undefined,
      dailyApiKey: "stub",
      s3BucketName: undefined,
      prescriptionSigningKey: undefined,
      twilioAccountSid: undefined,
      sentryDsn: undefined,
    });
    expect(() => validateDeployedConfig("staging", staging)).not.toThrow();
    expect(deployedServiceGaps(staging)).toEqual([
      "APP_URL (an https URL)",
      "POSTMARK_SERVER_TOKEN",
      "DAILY_API_KEY",
      "S3_BUCKET_NAME",
      "PRESCRIPTION_SIGNING_KEY",
      "TWILIO_ACCOUNT_SID",
      "SENTRY_DSN",
    ]);
  });
});

describe("JWT algorithm pinning", () => {
  it("round-trips an HS256 token", () => {
    const token = signAccessToken({ sub: "u1", role: "patient", sessionId: "s1" });
    expect(verifyAccessToken(token).sub).toBe("u1");
  });

  it("rejects a token signed with any other algorithm, even with the right secret", () => {
    const other = jwt.sign({ sub: "u1", role: "operator", sessionId: "s1" }, env.jwtAccessSecret, {
      algorithm: "HS384",
    });
    expect(() => verifyAccessToken(other)).toThrow(/invalid algorithm/);
  });
});

describe("JWT issuer and audience (JW-1)", () => {
  const before = new Date(LEGACY_TOKEN_CUTOFF.getTime() - 1000);
  const after = new Date(LEGACY_TOKEN_CUTOFF.getTime() + 1000);

  it("signs tokens with an issuer and a per-type audience", () => {
    const access = jwt.decode(signAccessToken({ sub: "u1", role: "patient", sessionId: "s1" })) as jwt.JwtPayload;
    const refresh = jwt.decode(signRefreshToken({ sub: "u1", sessionId: "s1" })) as jwt.JwtPayload;
    expect(access).toMatchObject({ iss: "pavdental-api", aud: "pavdental-access" });
    expect(refresh).toMatchObject({ iss: "pavdental-api", aud: "pavdental-refresh" });
  });

  it("never accepts one token type as the other, even with the same secret", () => {
    // Re-sign a refresh-shaped token with the access secret: only the audience tells them apart.
    const swapped = jwt.sign({ sub: "u1", sessionId: "s1" }, env.jwtAccessSecret, {
      algorithm: "HS256",
      issuer: "pavdental-api",
      audience: "pavdental-refresh",
      expiresIn: "5m",
    });
    expect(() => verifyAccessToken(swapped, before)).toThrow(/issuer or audience/);
    expect(() => verifyAccessToken(swapped, after)).toThrow(/issuer or audience/);
  });

  it("accepts a token from before iss/aud only until the cutoff", () => {
    const legacy = jwt.sign({ sub: "u1", sessionId: "s1" }, env.jwtRefreshSecret, { algorithm: "HS256", expiresIn: "5m" });
    expect(verifyRefreshToken(legacy, before).sub).toBe("u1");
    expect(() => verifyRefreshToken(legacy, after)).toThrow(/issuer or audience/);
  });

  it("rejects a foreign issuer", () => {
    const foreign = jwt.sign({ sub: "u1", role: "admin", sessionId: "s1" }, env.jwtAccessSecret, {
      algorithm: "HS256",
      issuer: "someone-else",
      audience: "pavdental-access",
      expiresIn: "5m",
    });
    expect(() => verifyAccessToken(foreign)).toThrow(/issuer or audience/);
  });
});

describe("mock payments never run on a hosted deployment", () => {
  const local = "postgresql://u:p@localhost:5432/pav";

  it("allows a developer's own machine", () => {
    expect(hostedMockPaymentsProblem({}, local)).toBeNull();
    expect(hostedMockPaymentsProblem({}, "postgresql://u:p@127.0.0.1:5432/pav")).toBeNull();
    expect(hostedMockPaymentsProblem({}, "postgresql://u:p@postgres:5432/pav")).toBeNull(); // docker compose
    expect(hostedMockPaymentsProblem({}, undefined)).toBeNull();
  });

  it.each(["RENDER", "FLY_APP_NAME", "RAILWAY_ENVIRONMENT", "DYNO", "K_SERVICE", "AWS_EXECUTION_ENV", "KUBERNETES_SERVICE_HOST"])(
    "refuses when %s says this is a hosting platform",
    (name) => {
      expect(hostedMockPaymentsProblem({ [name]: "true" }, local)).toMatch(/hosting platform/);
    }
  );

  it("refuses a database that is not on this machine, even with no platform variable", () => {
    expect(hostedMockPaymentsProblem({}, "postgresql://u:p@dpg-abc123-a/pav")).toMatch(/not on this machine/);
    expect(hostedMockPaymentsProblem({}, "postgresql://u:p@db.example.com:5432/pav")).toMatch(/not on this machine/);
  });

  it("refuses when the database address cannot be read", () => {
    expect(hostedMockPaymentsProblem({}, "not a url")).toMatch(/could not be read/);
  });

  it("the module refuses to load with no Stripe key on a hosting platform", () => {
    const saved = { ...process.env };
    process.env.NODE_ENV = "development";
    process.env.ALLOW_DEV_DEFAULTS = "1";
    process.env.RENDER = "true";
    delete process.env.STRIPE_SECRET_KEY;
    try {
      jest.isolateModules(() => {
        expect(() => require("../config/env")).toThrow(/mock payments/);
      });
    } finally {
      process.env = saved;
    }
  });
});
