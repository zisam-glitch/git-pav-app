import { reportError } from "./error-tracking";
import { safeError } from "./log-safety";

/**
 * For work that mustn't fail the request or job it belongs to, but must not fail
 * silently either: a lost audit entry or a reminder that wasn't cancelled needs
 * someone to know. `what` is a fixed description and never holds personal data;
 * safeError scrubs the error before it is logged.
 */
export function logFailure(what: string): (err: unknown) => void {
  return (err) => {
    console.error(`[best-effort] ${what} failed:`, safeError(err));
    reportError(err, { source: what });
  };
}
