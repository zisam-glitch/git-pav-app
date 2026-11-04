// Checks a deployment's settings before you deploy, without starting the
// server: the same rules the server applies at startup (config/env.ts), plus
// the services production needs. Settings are read from a file you pass, so
// your own environment isn't touched.
//
//   npm run check:deploy -- production path/to/production.env
//   npm run check:deploy -- staging path/to/staging.env
//
// Exits 1 when the server would refuse to start or production services are
// missing. Values are never printed.
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";

async function main() {
  const [target, file] = process.argv.slice(2);
  if ((target !== "production" && target !== "staging") || !file) {
    throw new Error("Usage: npm run check:deploy -- <production|staging> <env file>");
  }
  const vars = dotenv.parse(fs.readFileSync(file));
  const read = (name: string) => {
    const value = vars[name]?.trim();
    return value ? value : undefined;
  };

  // Load the shared rules as a local run would, so importing them doesn't
  // validate this machine's own settings.
  process.env.NODE_ENV = "development";
  process.env.ALLOW_DEV_DEFAULTS = "1";
  // The import prints this machine's own config summary; keep it out of the report.
  const log = console.log;
  console.log = () => {};
  const { validateDeployedConfig, deployedServiceGaps } = await import("../src/config/env.js").finally(() => {
    console.log = log;
  });

  const problems: string[] = [];
  const allowedOrigins = (read("ALLOWED_ORIGINS") ?? "").split(",").map((o) => o.trim()).filter(Boolean);
  for (const origin of allowedOrigins) {
    try {
      const { protocol } = new URL(origin);
      if (target === "production" && protocol !== "https:") problems.push(`ALLOWED_ORIGINS: ${origin} must be https in production`);
    } catch {
      problems.push(`ALLOWED_ORIGINS: ${origin} isn't a valid origin`);
    }
  }

  const values = {
    databaseUrl: read("DATABASE_URL"),
    redisUrl: read("REDIS_URL"),
    jwtAccessSecret: read("JWT_ACCESS_SECRET"),
    jwtRefreshSecret: read("JWT_REFRESH_SECRET"),
    auditIpHmacSecret: read("AUDIT_IP_HMAC_SECRET"),
    encryptionKey: read("ENCRYPTION_KEY"),
    stripeSecretKey: read("STRIPE_SECRET_KEY"),
    stripeWebhookSecret: read("STRIPE_WEBHOOK_SECRET"),
    stripePublishableKey: read("STRIPE_PUBLISHABLE_KEY"),
    allowedOrigins,
    appUrl: read("APP_URL"),
    postmarkServerToken: read("POSTMARK_SERVER_TOKEN"),
    dailyApiKey: read("DAILY_API_KEY"),
    s3BucketName: read("S3_BUCKET_NAME"),
    prescriptionSigningKey: read("PRESCRIPTION_SIGNING_KEY"),
    twilioAccountSid: read("TWILIO_ACCOUNT_SID"),
    twilioAuthToken: read("TWILIO_AUTH_TOKEN"),
    twilioFromPhone: read("TWILIO_FROM_PHONE"),
    sentryDsn: read("SENTRY_DSN"),
    allowDevDefaults: ["1", "true"].includes(read("ALLOW_DEV_DEFAULTS") ?? ""),
  };

  try {
    validateDeployedConfig(target, values);
  } catch (err) {
    problems.push(`The server would refuse to start: ${err instanceof Error ? err.message : String(err)}`);
  }
  const gaps = deployedServiceGaps(values);

  // Not checked at startup, but needed for a working deployment.
  if (!read("FROM_EMAIL")) problems.push("FROM_EMAIL: the address emails come from");
  if (!read("PRACTICE_ADDRESS")) problems.push("PRACTICE_ADDRESS: printed on prescriptions as the prescriber's address");
  if (read("S3_BUCKET_NAME") && !(read("AWS_ACCESS_KEY_ID") && read("AWS_SECRET_ACCESS_KEY"))) {
    problems.push("AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY: needed to reach S3_BUCKET_NAME");
  }
  const signingKey = read("PRESCRIPTION_SIGNING_KEY");
  if (signingKey && !/replace|placeholder/i.test(signingKey)) {
    try {
      const key = crypto.createPrivateKey({ key: Buffer.from(signingKey, "base64"), format: "der", type: "pkcs8" });
      if (key.asymmetricKeyType !== "ed25519") problems.push("PRESCRIPTION_SIGNING_KEY: must be an Ed25519 key");
    } catch {
      problems.push("PRESCRIPTION_SIGNING_KEY: isn't a base64 PKCS#8 DER private key (prescriptions would fail to sign)");
    }
  }
  if (!read("TRUST_PROXY")) problems.push("TRUST_PROXY: set the hop count behind your load balancer (usually 1) so rate limits see real client IPs");

  console.log(`Checking ${file} for ${target}\n`);
  if (target === "production") {
    for (const gap of gaps) problems.push(`Missing or placeholder: ${gap}`);
  } else if (gaps.length > 0) {
    console.log(`Not configured (fine for staging, required in production): ${gaps.join(", ")}\n`);
  }

  if (problems.length === 0) {
    console.log("✓ Ready: no problems found.");
    return;
  }
  for (const p of problems) console.log(`✗ ${p}`);
  console.log(`\n${problems.length} problem(s).`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
