/**
 * Which arch a tooth sits in. The patient chart used to test
 * `quadrant.includes("U")`, which works for the app's own "UR"/"UL" codes
 * but not for the "upper_right"/"lower_left" quadrants the server and the
 * clinician's chart editor store, so every recorded tooth dropped out of the
 * chart. Falls back to the tooth number (1–16 upper, 17–32 lower).
 */
export function isUpperArch(quadrant: string | null | undefined, toothNumber: number): boolean {
  const q = (quadrant ?? "").trim().toLowerCase();
  if (q.startsWith("upper") || q === "ur" || q === "ul") return true;
  if (q.startsWith("lower") || q === "lr" || q === "ll") return false;
  return toothNumber >= 1 && toothNumber <= 16;
}
