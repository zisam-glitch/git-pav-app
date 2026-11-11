import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";

// An in-memory stand-in for Redis, so this runs without any service.
const store = new Map<string, string>();
jest.mock("../lib/redis", () => ({
  redis: {
    set: jest.fn(async (key: string, value: string, ...args: unknown[]) => {
      if (args.includes("NX") && store.has(key)) return null;
      store.set(key, value);
      return "OK";
    }),
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    del: jest.fn(async (key: string) => {
      store.delete(key);
      return 1;
    }),
  },
}));

import { runIdempotent } from "../lib/idempotent-handler";

function call(opts: { key?: string; user?: string; id?: string }, handler: (req: AuthRequest, res: Response) => Promise<unknown>) {
  const out: { status: number; body?: unknown } = { status: 200 };
  const req = {
    user: { sub: opts.user ?? "u1" },
    params: { id: opts.id ?? "a1" },
    header: (name: string) => (name === "Idempotency-Key" ? opts.key : undefined),
  } as unknown as AuthRequest;
  const res = {
    status(code: number) {
      out.status = code;
      return res;
    },
    json(body: unknown) {
      out.body = body;
      return res;
    },
  } as unknown as Response;
  return runIdempotent(req, res, "cancel", handler).then(() => out);
}

describe("Running a handler once per Idempotency-Key (D3)", () => {
  beforeEach(() => store.clear());

  const cancelOk = (counter: { n: number }) => async (_req: AuthRequest, res: Response) => {
    counter.n += 1;
    res.json({ refundAmountPence: 2000, stripeRefundId: `re_${counter.n}` });
  };

  it("with no key, runs every time, exactly as before", async () => {
    const c = { n: 0 };
    await call({}, cancelOk(c));
    await call({}, cancelOk(c));
    expect(c.n).toBe(2);
  });

  it("with a key, a retry gets the first answer back and does not run again", async () => {
    const c = { n: 0 };
    const first = await call({ key: "attempt-0001" }, cancelOk(c));
    const retry = await call({ key: "attempt-0001" }, cancelOk(c));
    expect(c.n).toBe(1);
    expect(retry.status).toBe(200);
    expect(retry.body).toEqual(first.body);
    expect(retry.body).toMatchObject({ refundAmountPence: 2000, stripeRefundId: "re_1" });
  });

  it("does not keep a failed attempt, so the same key can try again", async () => {
    let n = 0;
    const flaky = async (_req: AuthRequest, res: Response) => {
      n += 1;
      if (n === 1) res.status(502).json({ error: "Could not refund your deposit" });
      else res.json({ refundAmountPence: 2000 });
    };
    const first = await call({ key: "attempt-0002" }, flaky);
    expect(first).toEqual({ status: 502, body: { error: "Could not refund your deposit" } });
    const second = await call({ key: "attempt-0002" }, flaky);
    expect(second.status).toBe(200);
    expect(n).toBe(2);
  });

  it("keeps one person's key from replaying another's answer, or another appointment's", async () => {
    const c = { n: 0 };
    await call({ key: "attempt-0003", user: "u1" }, cancelOk(c));
    await call({ key: "attempt-0003", user: "u2" }, cancelOk(c));
    await call({ key: "attempt-0003", user: "u1", id: "a2" }, cancelOk(c));
    expect(c.n).toBe(3);
  });

  it("refuses a malformed key without running the handler", async () => {
    const c = { n: 0 };
    const out = await call({ key: "no spaces allowed!" }, cancelOk(c));
    expect(out.status).toBe(400);
    expect(c.n).toBe(0);
  });

  it("tells a second request that arrives while the first is still running to wait", async () => {
    let release: () => void = () => {};
    const slow = async (_req: AuthRequest, res: Response) => {
      await new Promise<void>((r) => (release = r));
      res.json({ ok: true });
    };
    const first = call({ key: "attempt-0004" }, slow);
    await new Promise((r) => setTimeout(r, 10));
    const second = await call({ key: "attempt-0004" }, slow);
    expect(second.status).toBe(409);
    release();
    expect((await first).status).toBe(200);
  });
});
