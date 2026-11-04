// Run with `npm test`.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let access;
let jwt;

before(async () => {
  process.env.ADMIN_JWT_SECRET = "test-secret-not-used-anywhere";
  access = await import("./order-access.ts");
  jwt = await import("../auth/jwt.ts");
});

const ORDER = "11111111-1111-4111-8111-111111111111";
const OTHER_ORDER = "22222222-2222-4222-8222-222222222222";
describe("who can view an order", () => {
  it("refuses someone who only knows the order id", async () => {
    assert.equal(await access.canViewOrder(ORDER, null), false);
  });

  it("allows this order's own link", async () => {
    const accessToken = await access.createOrderAccessToken(ORDER);
    assert.equal(await access.canViewOrder(ORDER, accessToken), true);
  });

  it("refuses another order's link", async () => {
    const accessToken = await access.createOrderAccessToken(OTHER_ORDER);
    assert.equal(await access.canViewOrder(ORDER, accessToken), false);
  });

  it("refuses other kinds of token, including an old shopper session and a staff member's", async () => {
    for (const purpose of ["auth", jwt.STAFF_PURPOSE, "password_reset"]) {
      const accessToken = await jwt.signToken({ orderId: ORDER, userId: "u", role: "admin", purpose }, 60);
      assert.equal(await access.canViewOrder(ORDER, accessToken), false, purpose);
    }
  });

  it("refuses an expired, tampered or malformed link", async () => {
    const expired = await jwt.signToken({ orderId: ORDER, purpose: "order_view" }, -10);
    const valid = await access.createOrderAccessToken(ORDER);
    const [header, , signature] = valid.split(".");
    const forgedBody = Buffer.from(JSON.stringify({ orderId: OTHER_ORDER, purpose: "order_view" })).toString("base64url");

    for (const accessToken of [expired, `${header}.${forgedBody}.${signature}`, "garbage", "a.b.c"]) {
      assert.equal(await access.canViewOrder(OTHER_ORDER, accessToken), false);
    }
  });
});
