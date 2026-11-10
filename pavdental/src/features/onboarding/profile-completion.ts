/**
 * What is still missing from a patient's profile before they can book.
 * Onboarding can be skipped ("I'll do this later"), so the app checks again at
 * booking and offers to finish. The server stays the final check.
 */
export type MissingPart = "personal details" | "medical history" | "consent";

export function missingProfileParts(profile: unknown): MissingPart[] {
  if (!profile || typeof profile !== "object") return [];
  const p = profile as {
    dob?: unknown;
    medicalHistory?: unknown;
    consents?: Record<string, unknown> | null;
  };
  const missing: MissingPart[] = [];
  if (!p.dob) missing.push("personal details");
  const history = p.medicalHistory;
  if (!history || typeof history !== "object" || Object.keys(history as object).length === 0) {
    missing.push("medical history");
  }
  if (!p.consents || p.consents["data_processing"] !== true) missing.push("consent");
  return missing;
}

/** "personal details, medical history and consent" */
export function describeMissing(parts: MissingPart[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
