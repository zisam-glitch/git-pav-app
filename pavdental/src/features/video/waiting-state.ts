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

/** What the dentist is told about the patient, from the server's record. */
export function patientPresenceLine(input: { admitted: boolean; waiting: boolean }): string {
  if (input.admitted) return "Patient let in. They can join the call now.";
  if (input.waiting) return "The patient is in the waiting room.";
  return "The patient hasn't come into the waiting room yet.";
}

/** What the patient is told while they wait, from the server's record. */
export function waitingStatusLine(input: { admitted: boolean; late: boolean; opensAt?: string | null }): string {
  if (input.admitted) return "You're in";
  if (input.opensAt) return "You're early";
  if (input.late) return "Running a few minutes late";
  return "Your dentist knows you're here";
}
