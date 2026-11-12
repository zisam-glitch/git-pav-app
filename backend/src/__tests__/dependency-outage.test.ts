import type { Request, Response } from "express";

// A Redis stand-in that can be switched off, so the tests can pull the plug.
const store = new Map<string, string>();
let redisDown = false;
let storeFails = false;
jest.mock("../lib/redis", () => {
  const down = () => new Error("Connection is closed.");
  return {
    redis: {
      set: jest.fn(async (key: string, value: string, ...args: unknown[]) => {
        if (redisDown) throw down();
        // Claiming works but recording the result fails (the second set on a key).
        if (storeFails && !args.includes("NX")) throw down();
        if (args.includes("NX") && store.has(key)) return null;
        store.set(key, value);
        return "OK";
      }),
      get: jest.fn(async (key: string) => {
        if (redisDown) throw down();
        return store.get(key) ?? null;
      }),
      del: jest.fn(async (key: string) => {
        if (redisDown) throw down();
        store.delete(key);
        return 1;
      }),
    },
  };
});

import { withIdempotency } from "../lib/idempotency";
import { errorHandler, isDependencyOutage, DEPENDENCY_OUTAGE_MESSAGE, HttpError } from "../middleware/error-handler";

function respond(err: unknown) {
  const out: { status: number; body?: Record<string, unknown>; headers: Record<string, string> } = { status: 0, headers: {} };
  const req = { id: "req-1", path: "/x", method: "POST", body: {}, query: {}, headers: {} } as unknown as Request;
  const res = {
    setHeader: (k: string, v: string) => {
      out.headers[k] = v;
    },
    getHeader: () => undefined,
    status(code: number) {
      out.status = code;
      return res;
    },
    json(body: Record<string, unknown>) {
      out.body = body;
      return res;
    },
  } as unknown as Response;
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  errorHandler(err as Error, req, res, () => {});
  spy.mockRestore();
  warn.mockRestore();
  return out;
}

describe("Something we depend on is down (D7)", () => {
  beforeEach(() => {
    store.clear();
    redisDown = false;
    storeFails = false;
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  describe("what counts as an outage", () => {
    it("recognises Stripe, Redis, database and network failures", () => {
      expect(isDependencyOutage({ type: "StripeConnectionError", message: "x" })).toBe(true);
      expect(isDependencyOutage({ type: "StripeAPIError" })).toBe(true);
      expect(isDependencyOutage(Object.assign(new Error("x"), { name: "MaxRetriesPerRequestError" }))).toBe(true);
      expect(isDependencyOutage(new Error("Connection is closed."))).toBe(true);
      expect(isDependencyOutage(Object.assign(new Error("connect"), { code: "ECONNREFUSED" }))).toBe(true);
      expect(isDependencyOutage(Object.assign(new Error("db"), { code: "P1001" }))).toBe(true);
      expect(isDependencyOutage(Object.assign(new Error("slow"), { name: "TimeoutError" }))).toBe(true);
      expect(isDependencyOutage(new TypeError("fetch failed", { cause: { code: "ECONNRESET" } }))).toBe(true);
    });

    it("does not call a bug, a bad request or a declined card an outage", () => {
      expect(isDependencyOutage(new Error("Cannot read properties of undefined"))).toBe(false);
      expect(isDependencyOutage({ type: "StripeInvalidRequestError" })).toBe(false);
      expect(isDependencyOutage({ type: "StripeCardError" })).toBe(false);
      expect(isDependencyOutage(null)).toBe(false);
      expect(isDependencyOutage("down")).toBe(false);
    });
  });

  describe("what the patient is told", () => {
    it("a provider outage is a 503 with a plain message and a retry hint", () => {
      const r = respond({ type: "StripeConnectionError", message: "connect ECONNREFUSED 1.2.3.4:443" });
      expect(r.status).toBe(503);
      expect(r.body?.error).toBe(DEPENDENCY_OUTAGE_MESSAGE);
      expect(r.headers["Retry-After"]).toBe("10");
      expect(JSON.stringify(r.body)).not.toContain("1.2.3.4");
    });

    it("an ordinary bug is still a blanket 500 that leaks nothing", () => {
      const r = respond(new Error("Cannot read properties of undefined (reading 'id')"));
      expect(r.status).toBe(500);
      expect(r.body?.error).toBe("Internal server error");
    });

    it("a deliberate error from our own code keeps its own status and message", () => {
      const r = respond(new HttpError(409, "That time was just taken."));
      expect(r.status).toBe(409);
      expect(r.body?.error).toBe("That time was just taken.");
    });
  });

  describe("idempotency when Redis is down", () => {
    it("still runs the action, once, instead of failing it", async () => {
      redisDown = true;
      let ran = 0;
      const out = await withIdempotency("k-cancel-1", async () => {
        ran += 1;
        return { status: 200, body: "cancelled" };
      });
      expect(out).toEqual({ status: 200, body: "cancelled" });
      expect(ran).toBe(1);
    });

    it("does not turn a finished action into an error if recording it fails", async () => {
      storeFails = true;
      const out = await withIdempotency("k-cancel-2", async () => ({ status: 200, body: "done" }));
      expect(out).toEqual({ status: 200, body: "done" });
    });

    it("still lets the action's own errors through", async () => {
      await expect(
        withIdempotency("k-cancel-3", async () => {
          throw new Error("refund failed");
        })
      ).rejects.toThrow("refund failed");
    });

    it("still replays the first answer when Redis is healthy", async () => {
      let ran = 0;
      const run = () =>
        withIdempotency("k-cancel-4", async () => {
          ran += 1;
          return { status: 200, n: ran };
        });
      const first = await run();
      const again = await run();
      expect(again).toEqual(first);
      expect(ran).toBe(1);
    });
  });
});
