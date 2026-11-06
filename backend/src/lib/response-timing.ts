/**
 * Same answer, same speed.
 *
 * Routes that answer "if an account exists, we've sent a code" do more work for
 * a real account (write a token, send an email) than for an unknown one, so the
 * real case answers slower and the delay tells an attacker which addresses have
 * accounts (OWASP: uniform response time). This holds every reply back until a
 * fixed minimum has passed, so the quick case and the slow case look the same.
 *
 * The floor must be longer than the slow case normally takes. A reply that
 * takes longer than the floor (an email provider timing out) is sent as soon as
 * it is ready, never delayed further. Off in tests, which would only wait.
 */
import type { NextFunction, Request, Response } from "express";

/** Milliseconds still to wait so the reply goes out no earlier than `floorMs` after `startMs`. */
export function remainingDelay(startMs: number, floorMs: number, nowMs: number): number {
  return Math.max(0, floorMs - (nowMs - startMs));
}

export const RESPONSE_FLOOR_MS = 1500;

/** Express middleware: holds the JSON reply until the floor has passed. */
export function minResponseTime(floorMs: number = RESPONSE_FLOOR_MS) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "test" || floorMs <= 0) return next();
    const start = Date.now();
    const send = res.json.bind(res);
    res.json = ((body?: unknown) => {
      const wait = remainingDelay(start, floorMs, Date.now());
      if (wait === 0) return send(body);
      setTimeout(() => {
        if (!res.headersSent && !res.writableEnded) send(body);
      }, wait);
      return res;
    }) as Response["json"];
    return next();
  };
}
