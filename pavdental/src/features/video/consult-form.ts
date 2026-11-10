// The dentist's end-of-consult form (V34). The patient's summary is exactly
// what is saved here, so nothing is filled in on the dentist's behalf: no
// stock sentence for the notes, and follow-up is a choice, not always "none".
// The wording is a draft until a clinician reviews it (owner decision 7).

export type FollowUp = "none" | "clinic" | "van" | "video";

export const FOLLOW_UP_OPTIONS: { key: FollowUp; label: string }[] = [
  { key: "none", label: "None" },
  { key: "clinic", label: "Clinic" },
  { key: "van", label: "Van" },
  { key: "video", label: "Video" },
];

export interface ConsultForm {
  diagnosis: string;
  notes: string;
  plan: string;
  followUp: FollowUp;
}

/** A visit can be completed once the dentist has recorded something: what they found, advice, a plan, or a follow-up. */
export function canSaveConsult(form: ConsultForm): boolean {
  return Boolean(form.diagnosis.trim() || form.notes.trim() || form.plan.trim() || form.followUp !== "none");
}

/** The request body for ending the consult: only what the dentist wrote. */
export function consultPayload(appointmentId: string, form: ConsultForm) {
  return {
    appointmentId,
    diagnosis: form.diagnosis.trim() || undefined,
    notes: form.notes.trim() || undefined,
    treatmentPlan: form.plan.trim() || undefined,
    followUpRecommended: form.followUp,
  };
}
