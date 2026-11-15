// Maps a prescription from the API to what the patient screens show. Every
// clinical field comes from the record; anything missing reads "Not recorded"
// instead of a plausible-looking default drug, dose or prescriber (MC-4).

import { PRESCRIPTION_STATUS } from "../../lib/domain-enums";

export const NOT_RECORDED = "Not recorded";

export interface NormalizedPrescription {
  id: string;
  drugName: string;
  strength: string;
  form: string;
  dosage: string;
  course: string;
  notes: string;
  pharmacy: string;
  prescriber: string;
  /** null when the record has no issue date. */
  issuedIso: string | null;
  status: "active" | "completed";
  refillsRemaining: number;
  /** Practice reference printed on the signed PDF (decisions log #4). */
  reference?: string;
  /** False for prescriptions recorded before signed PDFs. */
  hasPdf: boolean;
}

const text = (...values: unknown[]): string | undefined =>
  values.find((v): v is string => typeof v === "string" && v.trim() !== "")?.trim();

export function normalizePrescription(raw: any): NormalizedPrescription {
  const issuedIso = text(raw.issuedIso, raw.createdAt, raw.dispatchedAt, raw.issuedAt) ?? null;
  const durationDays = Number(raw.durationDays);
  const hasDuration = Number.isFinite(durationDays) && durationDays > 0;
  // Only call a course finished when both the issue date and its length are known.
  const isCompleted =
    hasDuration && issuedIso !== null && Date.now() - new Date(issuedIso).getTime() > durationDays * 86_400_000;

  const clinicianName = text(raw.clinician?.fullName, raw.clinicianName);
  const gdc = text(raw.clinician?.gdcNumber);
  const prescriber =
    text(raw.prescriber) ?? (clinicianName ? (gdc ? `${clinicianName} (GDC ${gdc})` : clinicianName) : NOT_RECORDED);

  return {
    id: raw.id,
    drugName: text(raw.drugName, raw.medicationName, raw.medication) ?? NOT_RECORDED,
    strength: text(raw.strength) ?? "",
    form: text(raw.form) ?? "",
    dosage: text(raw.dosageInstructions, raw.frequency, raw.dosage) ?? NOT_RECORDED,
    course: text(raw.course) ?? (hasDuration ? `${durationDays} days` : NOT_RECORDED),
    notes: text(raw.notes) ?? "",
    pharmacy: text(raw.dispensingPharmacy, raw.pharmacy) ?? NOT_RECORDED,
    prescriber,
    issuedIso,
    status:
      raw.status === PRESCRIPTION_STATUS.COMPLETED || raw.status === PRESCRIPTION_STATUS.ACTIVE
        ? raw.status
        : isCompleted
          ? PRESCRIPTION_STATUS.COMPLETED
          : PRESCRIPTION_STATUS.ACTIVE,
    refillsRemaining: typeof raw.refillsRemaining === "number" ? raw.refillsRemaining : 0,
    // Older records carry an invented "NHS-EPS" reference, which isn't shown.
    reference: text(raw.reference),
    hasPdf: raw.hasPdf === true,
  };
}
