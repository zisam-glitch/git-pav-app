// Run with `npm test`. Plain .mjs so the Next build's typecheck skips it;
// Node strips the types from jwt.ts when it is imported.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let jwt;

before(async () => {
  process.env.ADMIN_JWT_SECRET = "test-secret-not-used-anywhere";
  jwt = await import("./jwt.ts");
});

describe("token purposes", () => {
  it("accepts a staff session as staff and not as a shopper", async () => {
    const token = await jwt.signToken({ email: "staff@example.test", role: "admin", purpose: jwt.STAFF_PURPOSE }, 60);
    assert.ok(await jwt.verifyStaffToken(token));
    assert.equal(await jwt.verifyShopperToken(token), null);
  });

  it("refuses a shopper session as staff", async () => {
    const token = await jwt.signToken({ userId: "u1", purpose: jwt.SHOPPER_PURPOSE }, 60);
    assert.equal(await jwt.verifyStaffToken(token), null);
    assert.ok(await jwt.verifyShopperToken(token));
  });

  it("refuses a shopper token that claims the admin role", async () => {
    const token = await jwt.signToken({ userId: "u1", role: "admin", purpose: jwt.SHOPPER_PURPOSE }, 60);
    assert.equal(await jwt.verifyStaffToken(token), null);
  });

  it("refuses reset and verification tokens everywhere", async () => {
    for (const purpose of ["password_reset", "email_verification"]) {
      const token = await jwt.signToken({ userId: "u1", purpose }, 60);
      assert.equal(await jwt.verifyStaffToken(token), null);
      assert.equal(await jwt.verifyShopperToken(token), null);
    }
  });

  it("refuses a staff session from before purposes were set", async () => {
    const token = await jwt.signToken({ email: "staff@example.test", role: "admin" }, 60);
    assert.equal(await jwt.verifyStaffToken(token), null);
  });

  it("refuses a token signed with another secret", async () => {
    const token = await jwt.signToken({ email: "staff@example.test", role: "admin", purpose: jwt.STAFF_PURPOSE }, 60);
    process.env.ADMIN_JWT_SECRET = "a-different-secret";
    try {
      assert.equal(await jwt.verifyStaffToken(token), null);
    } finally {
      process.env.ADMIN_JWT_SECRET = "test-secret-not-used-anywhere";
    }
  });

  it("refuses an expired staff session", async () => {
    const token = await jwt.signToken({ email: "staff@example.test", role: "admin", purpose: jwt.STAFF_PURPOSE }, -1);
    assert.equal(await jwt.verifyStaffToken(token), null);
  });

  it("refuses an unsigned token that claims alg none", async () => {
    const part = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const claims = { email: "staff@example.test", role: "admin", purpose: jwt.STAFF_PURPOSE, exp: 9999999999 };
    const forged = `${part({ alg: "none", typ: "JWT" })}.${part(claims)}.`;
    assert.equal(await jwt.verifyStaffToken(forged), null);
  });

  it("refuses a token whose claims were changed after signing", async () => {
    const token = await jwt.signToken({ userId: "u1", purpose: jwt.SHOPPER_PURPOSE }, 60);
    const [head, , signature] = token.split(".");
    const claims = Buffer.from(JSON.stringify({ role: "admin", purpose: jwt.STAFF_PURPOSE, exp: 9999999999 })).toString("base64url");
    assert.equal(await jwt.verifyStaffToken(`${head}.${claims}.${signature}`), null);
  });

  it("refuses a malformed token instead of throwing", async () => {
    assert.equal(await jwt.verifyStaffToken("a.%%%.c"), null);
    assert.equal(await jwt.verifyShopperToken("not-a-token"), null);
  });
});
