/**
 * Teeth are stored as Universal numbers (1–32, starting at the upper right
 * third molar). Patients see the FDI number used in UK dentistry, so a
 * screen never shows "Tooth #1 (#18)" with two systems side by side.
 */
export function universalToFdi(universal: number): number | null {
  if (!Number.isInteger(universal) || universal < 1 || universal > 32) return null;
  if (universal <= 8) return 10 + (9 - universal); // upper right: 18 → 11
  if (universal <= 16) return 20 + (universal - 8); // upper left: 21 → 28
  if (universal <= 24) return 30 + (25 - universal); // lower left: 38 → 31
  return 40 + (universal - 24); // lower right: 41 → 48
}

/** "Tooth 18"; falls back to the stored number if it is out of range. */
export function toothLabel(universal: number): string {
  const fdi = universalToFdi(universal);
  return `Tooth ${fdi ?? universal}`;
}

/** The stored Universal number for an FDI tooth number (11–48), or null. */
export function fdiToUniversal(fdi: number): number | null {
  if (!Number.isInteger(fdi)) return null;
  const quadrant = Math.floor(fdi / 10);
  const tooth = fdi % 10;
  if (tooth < 1 || tooth > 8) return null;
  if (quadrant === 1) return 9 - tooth; // 18 → 1
  if (quadrant === 2) return 8 + tooth; // 21 → 9
  if (quadrant === 3) return 25 - tooth; // 31 → 24
  if (quadrant === 4) return 24 + tooth; // 41 → 25
  return null;
}

/** The FDI number shown on a chart button ("18"), from a stored number. */
export function fdiText(universal: number): string {
  return String(universalToFdi(universal) ?? universal);
}

/**
 * Chart rows as UK dentists read them, facing the patient: the patient's
 * right is on the left, so the upper row runs 18…11 21…28 and the lower row
 * 48…41 31…38. Values are the stored Universal numbers.
 */
export const UPPER_CHART_ROW: readonly number[] = Array.from({ length: 16 }, (_, i) => i + 1);
export const LOWER_CHART_ROW: readonly number[] = Array.from({ length: 16 }, (_, i) => 32 - i);
