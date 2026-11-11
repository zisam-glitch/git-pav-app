/**
 * Ending a visit: "Mark completed" and "Mark no-show". Neither can be undone
 * from the app (the server refuses a second change), so both are confirmed
 * first, and the schedule is refreshed afterwards.
 */

export type VisitOutcome = "complete" | "no_show";

export interface VisitOutcomeCopy {
  title: string;
  message: string;
  confirmLabel: string;
  doneMessage: string;
}

export function visitOutcomeCopy(kind: VisitOutcome, patientName?: string): VisitOutcomeCopy {
  const who = patientName && patientName !== "Patient Record" ? patientName : "this patient";
  if (kind === "complete") {
    return {
      title: "Mark this visit completed?",
      message: `This closes the visit with ${who}. It can't be changed from the app afterwards.`,
      confirmLabel: "Mark completed",
      doneMessage: "Visit marked as completed.",
    };
  }
  return {
    title: "Mark as a no-show?",
    message: `${who} will be recorded as not attending. This can't be changed from the app afterwards.`,
    confirmLabel: "Mark no-show",
    doneMessage: "Patient marked as a no-show.",
  };
}

export interface VisitOutcomeDeps {
  complete: (appointmentId: string) => Promise<unknown>;
  noShow: (appointmentId: string) => Promise<unknown>;
}

export type VisitOutcomeResult = { ok: true } | { ok: false; message: string };

/** Records the outcome, and says in plain words why if it could not be. */
export async function recordVisitOutcome(
  deps: VisitOutcomeDeps,
  kind: VisitOutcome,
  appointmentId: string,
): Promise<VisitOutcomeResult> {
  try {
    await (kind === "complete" ? deps.complete(appointmentId) : deps.noShow(appointmentId));
    return { ok: true };
  } catch (err) {
    const fallback = kind === "complete" ? "Couldn't mark the visit completed." : "Couldn't mark the no-show.";
    const message = err instanceof Error && err.message ? err.message : fallback;
    return { ok: false, message };
  }
}

/** Names the parts of a patient's record that failed to load, for one sentence. */
export function failedPartsMessage(failed: readonly string[]): string | null {
  if (failed.length === 0) return null;
  const list = failed.length === 1 ? failed[0] : `${failed.slice(0, -1).join(", ")} and ${failed[failed.length - 1]}`;
  return `Couldn't load the ${list}. What is shown may be incomplete, so don't rely on it until it loads.`;
}
