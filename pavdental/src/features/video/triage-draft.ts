// The patient's triage answers are saved to the server as they type, so leaving
// the app half way loses nothing (V31). Pure, so it can be tested without a phone.

export const DURATIONS = ["Less than 24 hours", "1 to 2 days", "3 to 7 days", "Over a week"];

export interface TriageAnswers {
  symptomText: string;
  painLevel: number | null;
  hasSwelling: boolean;
  duration: string | null;
}

/** True once there is anything worth saving. An untouched form saves nothing. */
export function hasAnswers(a: TriageAnswers): boolean {
  return Boolean(a.symptomText.trim() || a.painLevel !== null || a.hasSwelling || a.duration);
}

/** The body sent to the server. */
export function draftBody(a: TriageAnswers) {
  return {
    symptomText: a.symptomText,
    painLevel: a.painLevel,
    hasSwelling: a.hasSwelling,
    duration: a.duration,
  };
}

/** What the server sent back, made safe: wrong types and unknown durations are dropped, never trusted. */
export function answersFromDraft(raw: unknown): Partial<TriageAnswers> {
  if (!raw || typeof raw !== "object") return {};
  const d = raw as Record<string, unknown>;
  const out: Partial<TriageAnswers> = {};
  if (typeof d.symptomText === "string") out.symptomText = d.symptomText.slice(0, 500);
  if (typeof d.painLevel === "number" && Number.isInteger(d.painLevel) && d.painLevel >= 0 && d.painLevel <= 10) out.painLevel = d.painLevel;
  if (typeof d.hasSwelling === "boolean") out.hasSwelling = d.hasSwelling;
  if (typeof d.duration === "string" && DURATIONS.includes(d.duration)) out.duration = d.duration;
  return out;
}
