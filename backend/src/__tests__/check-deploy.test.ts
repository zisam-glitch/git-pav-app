import { spawnSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

// npm run check:deploy reads a deployment's settings from a file and reports
// what would stop the server or leave production services missing (Phase 5).
// Synthetic values only.
describe("check:deploy", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-deploy-"));
  const backendRoot = path.join(__dirname, "..", "..");

  const complete: Record<string, string> = {
    DATABASE_URL: "postgresql://u:p@db.example.test:5432/pav",
    REDIS_URL: "rediss://default:p@redis.example.test:6379",
    JWT_ACCESS_SECRET: "synthetic-access-secret-0123456789abcdefghijklmnop",
    JWT_REFRESH_SECRET: "synthetic-refresh-secret-0123456789abcdefghijklmno",
    AUDIT_IP_HMAC_SECRET: "synthetic-audit-secret-0123456789abcdefghijklmnopq",
    ENCRYPTION_KEY: "synthetic-encryption-key-0123456789abcdefghijklmnop",
    // Built from parts so secret scanners don't mistake these fakes for real keys.
    STRIPE_SECRET_KEY: ["sk", "live", "synthetic"].join("_"),
    STRIPE_PUBLISHABLE_KEY: ["pk", "live", "synthetic"].join("_"),
    STRIPE_WEBHOOK_SECRET: ["whsec", "synthetic"].join("_"),
    ALLOWED_ORIGINS: "https://pavdental.example.test",
    APP_URL: "https://pavdental.example.test",
    POSTMARK_SERVER_TOKEN: "synthetic-postmark-token",
    DAILY_API_KEY: "synthetic-daily-key",
    S3_BUCKET_NAME: "synthetic-bucket",
    AWS_ACCESS_KEY_ID: "synthetic",
    AWS_SECRET_ACCESS_KEY: "synthetic",
    // A real (throwaway) Ed25519 key, in the format the server reads.
    PRESCRIPTION_SIGNING_KEY: crypto
      .generateKeyPairSync("ed25519")
      .privateKey.export({ format: "der", type: "pkcs8" })
      .toString("base64"),
    TWILIO_ACCOUNT_SID: "ACsynthetic",
    TWILIO_AUTH_TOKEN: "synthetic-twilio-token",
    TWILIO_FROM_PHONE: "+447700900000",
    SENTRY_DSN: "https://synthetic@sentry.example.test/1",
    FROM_EMAIL: "noreply@example.test",
    PRACTICE_ADDRESS: "1 Example Street, Testville",
    TRUST_PROXY: "1",
  };

  const run = (target: string, vars: Record<string, string>) => {
    const file = path.join(dir, `${target}-${Object.keys(vars).length}-${Math.random()}.env`);
    fs.writeFileSync(file, Object.entries(vars).map(([k, v]) => `${k}=${v}`).join("\n"));
    const result = spawnSync("npx", ["tsx", "scripts/check-deploy.ts", target, file], {
      cwd: backendRoot,
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: "" },
    });
    return { status: result.status, out: `${result.stdout}${result.stderr}` };
  };

  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  it("passes a complete production configuration", () => {
    const result = run("production", complete);
    expect(result.out).toContain("Ready: no problems found");
    expect(result.status).toBe(0);
  }, 60000);

  it("fails on the .env.example template, naming what's wrong", () => {
    const example = Object.fromEntries(
      fs
        .readFileSync(path.join(backendRoot, ".env.example"), "utf8")
        .split("\n")
        .filter((line) => /^[A-Z_]+=/.test(line))
        .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).replace(/^"|"$/g, "")])
    );
    const result = run("production", example);
    expect(result.status).toBe(1);
    expect(result.out).toMatch(/must be https in production/);
    expect(result.out).toMatch(/ALLOW_DEV_DEFAULTS must not be set/);
  }, 60000);

  it("names a missing production service", () => {
    const { DAILY_API_KEY: _omit, ...withoutVideo } = complete;
    const result = run("production", withoutVideo);
    expect(result.status).toBe(1);
    expect(result.out).toContain("Missing or placeholder: DAILY_API_KEY");
  }, 60000);

  it("catches a prescription signing key the server couldn't use", () => {
    const result = run("production", { ...complete, PRESCRIPTION_SIGNING_KEY: "bm90LWEta2V5" });
    expect(result.status).toBe(1);
    expect(result.out).toContain("PRESCRIPTION_SIGNING_KEY: isn't a base64 PKCS#8 DER private key");
  }, 60000);

  it("never prints a secret's value", () => {
    const result = run("production", { ...complete, DAILY_API_KEY: "replace_with_daily_api_key" });
    expect(result.out).not.toContain(complete.JWT_ACCESS_SECRET);
    expect(result.out).not.toContain(complete.ENCRYPTION_KEY);
  }, 60000);
});
