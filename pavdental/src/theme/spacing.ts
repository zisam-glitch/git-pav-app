// ─── 4-point grid spacing scale ───────────────────────────────────────────────
// All values divisible by 4. Use gap with these tokens for layout rhythm.
// Screen edge padding is spacing.gutter (20), as in the iOS reference.
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  gutter: 16, // screen side margin and card inner padding (Wise: 16)
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 80,
  max: 96,
} as const;

// ─── Fixed component sizes from the reference ─────────────────────────────────
export const sizes = {
  button: 52, // primary / secondary pill buttons
  buttonSmall: 36, // inline pills ("Change", "Send"); still ≥44pt hit area via hitSlop
  iconButton: 44, // round back / close / profile buttons
  iconTile: 48, // round outlined icon at the start of list rows
  input: 52, // bordered text field
  row: 72, // list row with icon, title and subtitle
} as const;
