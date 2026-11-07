import dotenv from "dotenv";
import { isPlaceholderCredential } from "./placeholder";

// Load local development settings before any module reads process.env. Production
// deployments provide these values through their secret manager instead.
dotenv.config();

// Fail closed: NODE_ENV must be set to a known value. Development defaults (and
// mock Stripe) are only ever used for "development" and "test"; any other value,
// including an unset or misspelt one, refuses to boot instead of silently running
// with public default secrets.
const KNOWN_ENVS = ["development", "test", "staging", "production"] as const;
type NodeEnv = (typeof KNOWN_ENVS)[number];

export function parseNodeEnv(value: string | undefined): NodeEnv {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`NODE_ENV must be set to one of: ${KNOWN_ENVS.join(", ")}`);
  }
  if (!(KNOWN_ENVS as readonly string[]).includes(trimmed)) {
    throw new Error(`NODE_ENV "${trimmed}" is not recognised; use one of: ${KNOWN_ENVS.join(", ")}`);
  }
  return trimmed as NodeEnv;
}

const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
const isProduction = nodeEnv === "production";
const isStaging = nodeEnv === "staging";
const isDevelopment = nodeEnv === "development";
const isTest = nodeEnv === "test";

function readOptional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function parsePort(value: string | undefined): number {
  if (!value) return 3000;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
}

function parseOrigins(value: string | undefined): string[] {
  if (!value) {
    if (isProduction) return [];
    if (isStaging) return ["http://localhost:8081", "http://localhost:19006", "exp://localhost:8081"];
    return ["http://localhost:8081", "http://localhost:19006", "exp://localhost:8081"];
  }

  const origins = value.split(",").map((origin) => origin.trim()).filter(Boolean);
  for (const origin of origins) {
    if (origin === "*") throw new Error("ALLOWED_ORIGINS must not include '*'");
    try {
      const parsed = new URL(origin);
      // Allow exp:// protocol for Expo development
      const allowedProtocols = isProduction ? ["https:"] : isStaging ? ["https:", "http:", "exp:"] : ["http:", "https:", "exp:"];
      if (!allowedProtocols.includes(parsed.protocol)) {
        throw new Error("unsupported protocol");
      }
      if (isProduction && parsed.protocol !== "https:") {
        throw new Error("production origins must use HTTPS");
      }
    } catch {
      throw new Error(`ALLOWED_ORIGINS contains an invalid origin: ${origin}`);
    }
  }
  return origins;
}

export function validateDeployedConfig(envName: NodeEnv, values: {
  databaseUrl?: string;
  redisUrl?: string;
  jwtAccessSecret?: string;
  jwtRefreshSecret?: string;
  auditIpHmacSecret?: string;
  encryptionKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  stripePublishableKey?: string;
  allowedOrigins: string[];
  appUrl?: string;
  postmarkServerToken?: string;
  dailyApiKey?: string;
  s3BucketName?: string;
  prescriptionSigningKey?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromPhone?: string;
  twilioVerifyServiceSid?: string;
  sentryDsn?: string;
  allowDevDefaults?: boolean;
}) {
  if (values.allowDevDefaults && (envName === "production" || envName === "staging")) {
    throw new Error("ALLOW_DEV_DEFAULTS must not be set in staging or production");
  }

  if (envName !== "production" && envName !== "staging") {
    const missingDevDefaults = [
      ["JWT_ACCESS_SECRET", values.jwtAccessSecret],
      ["JWT_REFRESH_SECRET", values.jwtRefreshSecret],
      ["AUDIT_IP_HMAC_SECRET", values.auditIpHmacSecret],
      ["ENCRYPTION_KEY", values.encryptionKey],
    ].filter(([, value]) => !value).map(([name]) => name);

    if (missingDevDefaults.length > 0 && !values.allowDevDefaults) {
      throw new Error(
        `Missing required configuration: ${missingDevDefaults.join(", ")}. In ${envName}, set ALLOW_DEV_DEFAULTS=1 or provide explicit secrets.`
      );
    }
    return;
  }
  const isProduction = envName === "production";

  const missing = [
    ["DATABASE_URL", values.databaseUrl],
    ["REDIS_URL", values.redisUrl],
    ["JWT_ACCESS_SECRET", values.jwtAccessSecret],
    ["JWT_REFRESH_SECRET", values.jwtRefreshSecret],
    ["AUDIT_IP_HMAC_SECRET", values.auditIpHmacSecret],
    ["ENCRYPTION_KEY", values.encryptionKey],
    ["STRIPE_SECRET_KEY", values.stripeSecretKey],
    ["STRIPE_WEBHOOK_SECRET", values.stripeWebhookSecret],
    ["STRIPE_PUBLISHABLE_KEY", values.stripePublishableKey],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required ${envName} configuration: ${missing.join(", ")}`);
  }
  if (isProduction && values.allowedOrigins.length === 0) {
    throw new Error("ALLOWED_ORIGINS must include at least one HTTPS origin in production");
  }

  for (const [name, secret] of [
    ["JWT_ACCESS_SECRET", values.jwtAccessSecret],
    ["JWT_REFRESH_SECRET", values.jwtRefreshSecret],
    ["AUDIT_IP_HMAC_SECRET", values.auditIpHmacSecret],
    ["ENCRYPTION_KEY", values.encryptionKey],
  ] as const) {
    if (
      !secret ||
      secret.length < 32 ||
      secret.includes("change_me") ||
      secret.includes("default-key") ||
      secret.includes("replace_with") ||
      secret.startsWith("dev_") ||
      secret.startsWith("pavdental_dev_")
    ) {
      throw new Error(`${name} must be a unique ${envName} secret of at least 32 characters`);
    }
  }

  // Production takes live Stripe keys only; staging takes real test-mode keys
  // only. Mock and placeholder keys are rejected in both, so mock payments can
  // never be switched on outside development and test.
  const secretKey = values.stripeSecretKey!;
  const publishableKey = values.stripePublishableKey!;
  const webhookSecret = values.stripeWebhookSecret!;
  const mode = isProduction ? "live" : "test";
  if (
    !(secretKey.startsWith(`sk_${mode}_`) || secretKey.startsWith(`rk_${mode}_`)) ||
    secretKey.startsWith("sk_test_mock") ||
    secretKey.includes("replace_with")
  ) {
    throw new Error(`STRIPE_SECRET_KEY must be a real ${mode}-mode key in ${envName}`);
  }
  if (!publishableKey.startsWith(`pk_${mode}_`) || /placeholder|replace_with/.test(publishableKey)) {
    throw new Error(`STRIPE_PUBLISHABLE_KEY must be a real ${mode}-mode key in ${envName}`);
  }
  if (!webhookSecret.startsWith("whsec_") || webhookSecret.includes("replace_with")) {
    throw new Error(`STRIPE_WEBHOOK_SECRET must be a real webhook signing secret in ${envName}`);
  }

  // Production also needs the services patients depend on. Without them,
  // sign-in codes, password resets and invites aren't emailed, links point
  // nowhere, video consults can't start and documents can't be stored, all
  // silently. Staging (the free test environment) only gets a warning.
  if (isProduction) {
    const gaps = deployedServiceGaps(values);
    if (gaps.length > 0) {
      throw new Error(`Missing or placeholder production services: ${gaps.join(", ")}`);
    }
  }
}

/** Services that are missing or still set to a placeholder or stub. */
export function deployedServiceGaps(values: {
  appUrl?: string;
  postmarkServerToken?: string;
  dailyApiKey?: string;
  s3BucketName?: string;
  prescriptionSigningKey?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromPhone?: string;
  twilioVerifyServiceSid?: string;
  sentryDsn?: string;
}): string[] {
  const placeholder = (value?: string) => !value || /^(mock|stub)|replace_?with|replace_me/i.test(value);
  const gaps: string[] = [];
  let appUrlOk = false;
  try {
    appUrlOk = !!values.appUrl && new URL(values.appUrl).protocol === "https:";
  } catch {
    appUrlOk = false;
  }
  if (!appUrlOk) gaps.push("APP_URL (an https URL)");
  if (placeholder(values.postmarkServerToken)) gaps.push("POSTMARK_SERVER_TOKEN");
  if (placeholder(values.dailyApiKey)) gaps.push("DAILY_API_KEY");
  if (!values.s3BucketName) gaps.push("S3_BUCKET_NAME");
  // Without a signing key, prescriptions can't be issued; without Twilio,
  // SMS sign-in codes are never sent.
  if (placeholder(values.prescriptionSigningKey)) gaps.push("PRESCRIPTION_SIGNING_KEY");
  if (placeholder(values.twilioAccountSid)) gaps.push("TWILIO_ACCOUNT_SID");
  if (placeholder(values.twilioAuthToken)) gaps.push("TWILIO_AUTH_TOKEN");
  // Phone codes need either Twilio Verify (no sending number) or a sending number.
  if (placeholder(values.twilioFromPhone) && placeholder(values.twilioVerifyServiceSid)) {
    gaps.push("TWILIO_VERIFY_SERVICE_SID or TWILIO_FROM_PHONE");
  }
  // OPS-04: Sentry error tracking DSN required in production
  if (placeholder(values.sentryDsn)) gaps.push("SENTRY_DSN");
  return gaps;
}

function printConfigurationSummary(values: {
  databaseUrl?: string;
  redisUrl?: string;
  jwtAccessSecret?: string;
  jwtRefreshSecret?: string;
  auditIpHmacSecret?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  stripePublishableKey?: string;
  allowedOrigins: string[];
  appUrl?: string;
  postmarkServerToken?: string;
  dailyApiKey?: string;
  s3BucketName?: string;
  prescriptionSigningKey?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromPhone?: string;
  twilioVerifyServiceSid?: string;
  sentryDsn?: string;
}) {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║          Pav Dental API - Configuration Summary                ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log(`Environment: ${nodeEnv.toUpperCase()}`);
  console.log(`Port: ${parsePort(readOptional("PORT"))}`);
  console.log("");
  console.log("Configuration Status:");
  console.log(`  Database URL: ${values.databaseUrl ? "✓ Configured" : "✗ Missing"}`);
  console.log(`  Redis URL: ${values.redisUrl ? "✓ Configured" : "✗ Missing"}`);
  console.log(`  JWT Access Secret: ${values.jwtAccessSecret ? "✓ Configured" : "✗ Missing (using dev default)"}`);
  console.log(`  JWT Refresh Secret: ${values.jwtRefreshSecret ? "✓ Configured" : "✗ Missing (using dev default)"}`);
  console.log(`  Audit IP HMAC Secret: ${values.auditIpHmacSecret ? "✓ Configured" : "✗ Missing (using dev default)"}`);
  console.log(
    `  Stripe Secret Key: ${
      !values.stripeSecretKey
        ? "✗ Missing (mock Stripe)"
        : isPlaceholderCredential(values.stripeSecretKey)
          ? "✗ Template value (mock Stripe)"
          : "✓ Configured"
    }`
  );
  console.log(`  Stripe Webhook Secret: ${values.stripeWebhookSecret ? "✓ Configured" : "✗ Missing"}`);
  console.log(`  Stripe Publishable Key: ${values.stripePublishableKey ? "✓ Configured" : "✗ Missing (using dev default)"}`);
  console.log(`  Allowed Origins: ${values.allowedOrigins.length} origin(s) configured`);
  console.log("");
  
  if (isProduction) {
    console.log("⚠️  PRODUCTION MODE - All secrets must be properly configured");
  } else if (isStaging) {
    console.log("⚠️  STAGING MODE - Secrets must be properly configured for testing");
    const gaps = deployedServiceGaps(values);
    if (gaps.length > 0) {
      console.log(`⚠️  Not configured (required in production): ${gaps.join(", ")}`);
    }
  } else {
    console.log("⚠️  DEVELOPMENT MODE - Using development defaults for missing secrets");
    console.log("⚠️  DO NOT use development defaults in production or staging");
    // Template or missing provider keys run in local mode: nothing is sent.
    const local = [
      ["email (Postmark)", values.postmarkServerToken],
      ["SMS (Twilio)", values.twilioAccountSid],
      ["video (Daily)", values.dailyApiKey],
    ]
      .filter(([, value]) => isPlaceholderCredential(value))
      .map(([name]) => name);
    if (local.length > 0) {
      console.log(`ℹ️  Not configured, running locally without sending: ${local.join(", ")}`);
    }
  }
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");
}

const allowDevDefaults = readOptional("ALLOW_DEV_DEFAULTS") === "1" || readOptional("ALLOW_DEV_DEFAULTS") === "true";
const allowedOrigins = parseOrigins(readOptional("ALLOWED_ORIGINS"));
const values = {
  databaseUrl: readOptional("DATABASE_URL"),
  redisUrl: readOptional("REDIS_URL"),
  jwtAccessSecret: readOptional("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: readOptional("JWT_REFRESH_SECRET"),
  auditIpHmacSecret: readOptional("AUDIT_IP_HMAC_SECRET"),
  encryptionKey: readOptional("ENCRYPTION_KEY"),
  kmsKeyId: readOptional("KMS_KEY_ID"),
  stripeSecretKey: readOptional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: readOptional("STRIPE_WEBHOOK_SECRET"),
  stripePublishableKey: readOptional("STRIPE_PUBLISHABLE_KEY"),
  allowedOrigins,
  appUrl: readOptional("APP_URL"),
  postmarkServerToken: readOptional("POSTMARK_SERVER_TOKEN"),
  dailyApiKey: readOptional("DAILY_API_KEY"),
  s3BucketName: readOptional("S3_BUCKET_NAME"),
  prescriptionSigningKey: readOptional("PRESCRIPTION_SIGNING_KEY"),
  twilioAccountSid: readOptional("TWILIO_ACCOUNT_SID"),
  twilioAuthToken: readOptional("TWILIO_AUTH_TOKEN"),
  twilioFromPhone: readOptional("TWILIO_FROM_PHONE"),
  twilioVerifyServiceSid: readOptional("TWILIO_VERIFY_SERVICE_SID"),
  sentryDsn: readOptional("SENTRY_DSN"),
  allowDevDefaults,
};

// Print configuration summary before validation
printConfigurationSummary(values);

// Validate deployed (staging/production) configuration; throws if invalid.
validateDeployedConfig(nodeEnv, values);

const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "postgres"]);
const HOSTING_PLATFORM_VARS = ["RENDER", "FLY_APP_NAME", "RAILWAY_ENVIRONMENT", "DYNO", "K_SERVICE", "AWS_EXECUTION_ENV", "KUBERNETES_SERVICE_HOST"];

/**
 * Mock payments confirm a booking without taking any money, so they exist for a
 * developer's own machine and for tests only. This says why mock Stripe must
 * not run here, or null when it may: running on a hosting platform, or against
 * a database that is not on this machine, both mean real patients could book
 * without paying. There is deliberately no override.
 */
export function hostedMockPaymentsProblem(
  environment: NodeJS.ProcessEnv,
  databaseUrl: string | undefined
): string | null {
  const platform = HOSTING_PLATFORM_VARS.find((name) => !!environment[name]?.trim());
  if (platform) return `it is running on a hosting platform (${platform} is set)`;
  if (databaseUrl) {
    try {
      const host = new URL(databaseUrl).hostname.toLowerCase();
      if (!LOCAL_DB_HOSTS.has(host)) return "DATABASE_URL points at a database that is not on this machine";
    } catch {
      return "DATABASE_URL could not be read";
    }
  }
  return null;
}

// A missing or template key (`sk_test_replace_with_…` from .env.example) means
// mock Stripe locally rather than real calls with a junk key.
const stripeSecretKey = isPlaceholderCredential(values.stripeSecretKey)
  ? "sk_test_mock_stripe_key_pav_dental"
  : values.stripeSecretKey!;

// Fail closed: a deployment missing its Stripe key must not quietly start
// confirming bookings without payment.
if (stripeSecretKey.startsWith("sk_test_mock") && nodeEnv !== "test") {
  const problem = hostedMockPaymentsProblem(process.env, values.databaseUrl);
  if (problem) {
    throw new Error(
      `STRIPE_SECRET_KEY is missing or a placeholder, which turns on mock payments (bookings confirmed without payment), and ${problem}. Set a real Stripe test-mode key (sk_test_...), or run against a local database.`
    );
  }
}

export const env = Object.freeze({
  nodeEnv,
  isProduction,
  isStaging,
  isDevelopment,
  isTest,
  allowDevDefaults,
  port: parsePort(readOptional("PORT")),
  databaseUrl: values.databaseUrl,
  redisUrl: values.redisUrl,
  jwtAccessSecret: values.jwtAccessSecret ?? "dev_access_secret_change_me",
  jwtRefreshSecret: values.jwtRefreshSecret ?? "dev_refresh_secret_change_me",
  auditIpHmacSecret: values.auditIpHmacSecret ?? "dev_audit_hmac_secret_change_me",
  auditHmacSecret: readOptional("AUDIT_HMAC_SECRET") ?? values.auditIpHmacSecret ?? "dev_audit_hmac_secret_change_me",
  opsAlertEmail: readOptional("OPS_ALERT_EMAIL") ?? "ops@pavdental.com",
  // Deployed environments reject a missing or template key above, so this
  // fallback only ever applies in development and test.
  encryptionKey: isPlaceholderCredential(values.encryptionKey)
    ? "dev_clinical_envelope_kek_32_bytes_minimum_key"
    : values.encryptionKey!,
  kmsKeyId: values.kmsKeyId ?? "arn:aws:kms:eu-west-2:000000000000:key/pavdental-clinical-cmk",
  stripeSecretKey,
  // Mock Stripe is only reachable in development and test: validateDeployedConfig
  // rejects mock keys in staging and production.
  isMockStripe: stripeSecretKey.startsWith("sk_test_mock"),
  stripeWebhookSecret: values.stripeWebhookSecret,
  stripePublishableKey: values.stripePublishableKey ?? "pk_test_placeholder",
  allowedOrigins,
  // Where patients read about payment plans. Credit decisions are made by the
  // practice's finance provider, never in the app (decisions log #5).
  financeInfoUrl: readOptional("FINANCE_INFO_URL") ?? "https://www.pavdental.com/services/finance",
  // Signed private prescriptions (decisions log #4). Base64 PKCS#8 DER Ed25519
  // key; without it, deployed environments refuse to issue prescriptions.
  prescriptionSigningKey: readOptional("PRESCRIPTION_SIGNING_KEY"),
  // Printed on prescriptions as the prescriber's practice address.
  practiceName: readOptional("PRACTICE_NAME") ?? "Pav Dental",
  practiceAddress: readOptional("PRACTICE_ADDRESS"),
  practicePhone: readOptional("PRACTICE_PHONE") ?? "0800 1938 786",
  // Retention sweeps only report until this is "true" (CS-23); then van
  // location history older than 30 days is deleted daily.
  retentionEnforce: readOptional("RETENTION_ENFORCE") === "true",
  // Error tracking (CS-44). Off unless a DSN is set; see lib/error-tracking.ts.
  sentryDsn: readOptional("SENTRY_DSN"),
  sentryEnvironment: readOptional("SENTRY_ENVIRONMENT") ?? nodeEnv,
  sentryRelease: readOptional("SENTRY_RELEASE"),
});
