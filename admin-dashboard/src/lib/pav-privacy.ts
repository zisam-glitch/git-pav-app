// Shapes and helpers for the consent records and subject access (SAR) screens.
// Both are read-only lists. IP addresses, metadata, file keys and bundle
// contents never reach this side; the backend leaves them out.

export const PRIVACY_PAGE_SIZE = 25;

export const CONSENT_TYPES = [
  "data_processing",
  "telehealth",
  "data_sharing",
  "marketing",
  "clinical_records",
  "payment_processing",
  "treatment_data_processing",
  "marketing_communications",
  "research_participation",
  "photo_video_usage",
  "third_party_sharing",
  "emergency_contact",
  "guardian_consent",
] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];
export type ConsentStatus = "" | "granted" | "withdrawn";

export interface ConsentRow {
  id: string;
  patientId: string;
  patientName: string;
  consentType: string;
  version: number;
  lawfulBasis: string;
  isGranted: boolean;
  grantedAt: string;
  withdrawnAt: string | null;
}

export interface SarExportRow {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  fileSizeBytes: number;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const page1 = (page: number) => String(Math.max(1, Math.floor(page)));

export interface ConsentFilters {
  consentType: ConsentType | "";
  status: ConsentStatus;
  patientId: string;
}

/** The proxy path for one page of consent records; empty or malformed filters are left out. */
export function consentsPath(filters: ConsentFilters, page = 1): string {
  const query = new URLSearchParams({ page: page1(page), limit: String(PRIVACY_PAGE_SIZE) });
  if ((CONSENT_TYPES as readonly string[]).includes(filters.consentType)) query.set("consentType", filters.consentType);
  if (filters.status === "granted" || filters.status === "withdrawn") query.set("status", filters.status);
  if (ID.test(filters.patientId.trim())) query.set("patientId", filters.patientId.trim());
  return `consents?${query}`;
}

export interface SarFilters {
  from: string;
  to: string;
  patientId: string;
}

/** The proxy path for one page of subject access bundles. */
export function sarExportsPath(filters: SarFilters, page = 1): string {
  const query = new URLSearchParams({ page: page1(page), limit: String(PRIVACY_PAGE_SIZE) });
  if (DAY.test(filters.from)) query.set("from", filters.from);
  if (DAY.test(filters.to)) query.set("to", filters.to);
  if (ID.test(filters.patientId.trim())) query.set("patientId", filters.patientId.trim());
  return `sar-exports?${query}`;
}

/** "marketing_communications" -> "Marketing communications". */
export function consentLabel(type: string): string {
  const words = type.replaceAll("_", " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const LAWFUL_BASIS: Record<string, string> = {
  consent: "Consent",
  contract: "Contract",
  legal_obligation: "Legal obligation",
  vital_interests: "Vital interests",
  public_task: "Public task",
  legitimate_interests: "Legitimate interests",
};

export const lawfulBasisLabel = (basis: string) => LAWFUL_BASIS[basis] ?? consentLabel(basis);

/** "2.0 KB" for the size staff see; the file itself is never offered. */
export function fileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
