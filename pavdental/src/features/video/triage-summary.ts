// What the clinician reads before a video consult: the patient's own triage
// answers, not the name of the service they booked.

export interface TriageSummary {
  /** The patient's own words, or null when they haven't answered yet. */
  complaint: string | null;
  painLevel: number | null;
  duration: string | null;
  swelling: boolean;
  /** Why the answers were flagged as urgent, when they were. */
  redFlag: string | null;
  photoCount: number;
  submitted: boolean;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function triageSummary(triageData: unknown, intraoralPhotos?: unknown[]): TriageSummary {
  const t = (triageData && typeof triageData === "object" ? triageData : {}) as Record<string, unknown>;
  const symptoms = Array.isArray(t.symptoms) ? t.symptoms.filter((s): s is string => typeof s === "string") : [];
  const pain = typeof t.painLevel === "number" && Number.isFinite(t.painLevel) ? t.painLevel : null;
  const flag = t.redFlag && typeof t.redFlag === "object" ? (t.redFlag as Record<string, unknown>) : null;
  const flagReasons = flag && Array.isArray(flag.reasons) ? flag.reasons.filter((r): r is string => typeof r === "string") : [];
  const triagePhotos = Array.isArray(t.photos) ? t.photos.length : 0;
  const storedPhotos = Array.isArray(intraoralPhotos) ? intraoralPhotos.length : 0;

  return {
    complaint: text(t.chiefComplaint),
    painLevel: pain,
    duration: text(t.duration),
    swelling: symptoms.some((s) => s.toLowerCase().includes("swell")),
    redFlag: flag ? text(flag.reason) || flagReasons.join(", ") || "Flagged as urgent" : null,
    photoCount: Math.max(triagePhotos, storedPhotos),
    submitted: Boolean(t.submittedAt || text(t.chiefComplaint)),
  };
}
