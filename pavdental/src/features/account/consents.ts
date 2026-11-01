// How the consent screen names and orders a patient's consent records.

export interface ConsentHistoryEntry {
  id: string;
  consentType: string;
  version: number;
  isGranted: boolean;
  grantedAt: string;
  withdrawnAt: string | null;
}

const CONSENT_LABELS: Record<string, string> = {
  data_processing: "Health data processing",
  treatment_data_processing: "Health data processing",
  clinical_records: "Clinical treatment & records",
  marketing: "Recall & preventive reminders",
  marketing_communications: "Recall & preventive reminders",
};

export function consentLabel(type: string): string {
  return CONSENT_LABELS[type] ?? type.replace(/_/g, " ");
}

/** Newest first: by when it was withdrawn or given, whichever is later. */
export function sortHistory(entries: ConsentHistoryEntry[]): ConsentHistoryEntry[] {
  const latest = (e: ConsentHistoryEntry) => Math.max(Date.parse(e.grantedAt), e.withdrawnAt ? Date.parse(e.withdrawnAt) : 0);
  return [...entries].sort((a, b) => latest(b) - latest(a));
}
