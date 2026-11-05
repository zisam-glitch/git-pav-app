// Shapes and helpers for the prescriptions register. The register says a
// prescription exists, who issued it and when, whether it was signed and
// whether it was sent. It never carries what was prescribed or for whom; the
// backend leaves those out, so there is nothing here to show.

export const PRESCRIPTIONS_PAGE_SIZE = 25;

export interface PrescriptionRow {
  id: string;
  reference: string | null;
  appointmentId: string | null;
  clinicianId: string;
  clinicianName: string | null;
  clinicianRole: string | null;
  issuedAt: string;
  signed: boolean;
  signingKeyId: string | null;
  dispatchedAt: string | null;
}

export interface PrescriptionFilters {
  clinicianId: string;
  from: string;
  to: string;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The proxy path for one page of the register; empty or malformed filters are left out. */
export function prescriptionsPath(filters: PrescriptionFilters, page = 1): string {
  const query = new URLSearchParams({
    page: String(Math.max(1, Math.floor(page))),
    limit: String(PRESCRIPTIONS_PAGE_SIZE),
  });
  if (ID.test(filters.clinicianId)) query.set("clinicianId", filters.clinicianId);
  if (DAY.test(filters.from)) query.set("from", filters.from);
  if (DAY.test(filters.to)) query.set("to", filters.to);
  return `prescriptions?${query}`;
}

export type PrescriptionState = "sent" | "signed" | "unsigned";

/** Where a prescription has got to. Anything not signed is flagged, because the patient can't get a PDF for it. */
export function prescriptionState(rx: Pick<PrescriptionRow, "signed" | "dispatchedAt">): PrescriptionState {
  if (!rx.signed) return "unsigned";
  return rx.dispatchedAt ? "sent" : "signed";
}

export const PRESCRIPTION_STATE_LABEL: Record<PrescriptionState, string> = {
  sent: "Signed and sent",
  signed: "Signed, not sent",
  unsigned: "Not signed",
};
