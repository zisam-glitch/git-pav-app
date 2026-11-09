import { isConnectivityError, scrubText } from "./error-scrub";

// Errors a screen catches and recovers from (B15). They used to go to
// console.error only: lost in a build, and the raw object can carry a server
// response with patient details. Now they go to the error reporter, which
// error-tracking.ts plugs in at start-up (this file stays free of the Sentry
// SDK so plain-Node tests can load the modules that use it).

type Reporter = (error: unknown, source: string) => void;
let reporter: Reporter | null = null;

export function setCaughtErrorReporter(next: Reporter | null): void {
  reporter = next;
}

export function reportCaughtError(error: unknown, source: string): void {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    const message = error instanceof Error ? scrubText(error.message) : typeof error;
    console.warn(`[${source}]`, message);
  }
  // A lost connection or a timed-out request is the network, not a bug.
  if (isConnectivityError(error)) return;
  reporter?.(error, source);
}
