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
