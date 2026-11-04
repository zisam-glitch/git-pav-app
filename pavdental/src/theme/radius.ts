// ─── Border radius scale ───────────────────────────────────────────────────────
// Wise baseline: pill buttons and chips, softly rounded cards, 10pt fields.
// Pair non-capsule radii with borderCurve: "continuous" for iOS squircle feel.
export const radius = {
  xs: 4, // progress bars, tiny badges
  sm: 10, // text fields, thumbnails, small inline buttons
  md: 12, // icon tiles, nested panels inside cards
  lg: 16, // cards and grouped surfaces
  xl: 24, // bottom sheets, hero cards
  full: 9999, // capsule / pill — buttons, chips, avatars, icon buttons
} as const;
