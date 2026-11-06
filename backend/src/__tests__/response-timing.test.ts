import type { NextFunction, Request, Response } from "express";
import { RESPONSE_FLOOR_MS, minResponseTime, remainingDelay } from "../lib/response-timing";

describe("response timing floor", () => {
  it("waits out what is left of the floor, never less than zero", () => {
    expect(remainingDelay(1000, 1500, 1200)).toBe(1300);
    expect(remainingDelay(1000, 1500, 2500)).toBe(0);
    expect(remainingDelay(1000, 1500, 9999)).toBe(0);
    expect(remainingDelay(1000, 1500, 1000)).toBe(1500);
  });

  it("is longer than a normal email send, so the slow case is covered", () => {
    expect(RESPONSE_FLOOR_MS).toBeGreaterThanOrEqual(1000);
  });

  describe("middleware", () => {
    const original = process.env.NODE_ENV;
    beforeEach(() => {
      jest.useFakeTimers();
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    });
    afterEach(() => {
      jest.useRealTimers();
      (process.env as Record<string, string | undefined>).NODE_ENV = original;
    });

    function fakeRes() {
      const sent: unknown[] = [];
      const res = {
        headersSent: false,
        writableEnded: false,
        json(body: unknown) {
          sent.push(body);
          return res;
        },
      };
      return { res: res as unknown as Response, sent };
    }

    it("holds a quick reply until the floor, then sends it", () => {
      const { res, sent } = fakeRes();
      const next = jest.fn() as unknown as NextFunction;
      minResponseTime(1500)({} as Request, res, next);
      expect(next).toHaveBeenCalled();

      res.json({ ok: true });
      expect(sent).toHaveLength(0);
      jest.advanceTimersByTime(1499);
      expect(sent).toHaveLength(0);
      jest.advanceTimersByTime(1);
      expect(sent).toEqual([{ ok: true }]);
    });

    it("does not delay a reply that already took longer than the floor", () => {
      const { res, sent } = fakeRes();
      minResponseTime(1500)({} as Request, res, jest.fn() as unknown as NextFunction);
      jest.advanceTimersByTime(2000);
      res.json({ slow: true });
      expect(sent).toEqual([{ slow: true }]);
    });

    it("does nothing in the test environment or with a zero floor", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "test";
      const { res, sent } = fakeRes();
      const original = res.json;
      minResponseTime(1500)({} as Request, res, jest.fn() as unknown as NextFunction);
      expect(res.json).toBe(original);
      res.json({ now: true });
      expect(sent).toEqual([{ now: true }]);

      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      const second = fakeRes();
      const before = second.res.json;
      minResponseTime(0)({} as Request, second.res, jest.fn() as unknown as NextFunction);
      expect(second.res.json).toBe(before);
    });
  });
});
