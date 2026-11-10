export type WaitingTrouble = "connection" | "closed" | null;

const CLOSED = new Set(["cancelled", "completed", "no_show"]);

/**
 * What is wrong in the waiting room, if anything: the status check keeps
 * failing (three tries in a row), or the consultation is no longer open.
 */
export function waitingTrouble(input: { failures: number; status?: string }): WaitingTrouble {
  if (input.status && CLOSED.has(input.status.toLowerCase())) return "closed";
  return input.failures >= 3 ? "connection" : null;
}

/** True once the start time is more than five minutes past and nobody has let the patient in. */
export function isRunningLate(startTimeUtc: string | null, now: number = Date.now()): boolean {
  if (!startTimeUtc) return false;
  return now - new Date(startTimeUtc).getTime() > 5 * 60_000;
}
