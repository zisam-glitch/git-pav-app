import { toLabel } from "@/lib/text";

export interface ToothRecordLike {
  toothNumber: number;
  condition?: string | null;
  notes?: string | null;
}

/**
 * What the chart records for one tooth, in words for the consult room.
 * "Healthy" and "nothing recorded" are different statements, so they are
 * worded differently.
 */
export function toothFinding(records: readonly ToothRecordLike[], toothNumber: number): string {
  const r = records.find((x) => x.toothNumber === toothNumber);
  if (!r || !r.condition) return "Nothing is recorded for this tooth.";
  const note = r.notes?.trim();
  const condition = r.condition === "healthy" ? "Recorded as healthy" : toLabel(r.condition);
  return note ? `${condition}. ${note}` : `${condition}.`;
}
