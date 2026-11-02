import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { confirmEmail, passwordProblems, resetPassword } from "./app-account.ts";

const respond = (status: number, body: unknown) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("passwordProblems", () => {
  it("accepts a password the backend accepts", () => {
    assert.deepEqual(passwordProblems("Synthetic1pass"), []);
  });
  it("lists every missing rule", () => {
    assert.deepEqual(passwordProblems("short"), ["At least 8 characters", "An uppercase letter", "A number"]);
    assert.deepEqual(passwordProblems("ALLUPPERCASE1"), ["A lowercase letter"]);
  });
});

describe("account links", () => {
  it("sends the token to the backend's confirm endpoint", async () => {
    let seen: { url: string; body: unknown } | null = null;
    const spy = (async (url: string, init: RequestInit) => {
      seen = { url, body: JSON.parse(String(init.body)) };
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;
    assert.deepEqual(await confirmEmail("abc123", spy), { ok: true });
    assert.match(seen!.url, /\/api\/auth\/verify-email\/confirm$/);
    assert.deepEqual(seen!.body, { token: "abc123" });
  });

  it("explains an expired or used link in plain words", async () => {
    const r = await resetPassword("old", "Synthetic1pass", respond(400, { error: "Invalid or expired token" }));
    assert.deepEqual(r, { ok: false, message: "This link has expired or has already been used." });
  });

  it("explains rate limiting and network failures", async () => {
    const limited = await confirmEmail("t", respond(429, {}));
    assert.equal(limited.ok, false);
    assert.match((limited as { message: string }).message, /Too many attempts/);
    const offline = (async () => {
      throw new TypeError("network");
    }) as unknown as typeof fetch;
    const r = await confirmEmail("t", offline);
    assert.equal(r.ok, false);
  });
});
