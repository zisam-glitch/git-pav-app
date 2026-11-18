/** Text colour for an accent word, per Hims section theme. Accent words are large type only (3:1 contrast). */
export const ACCENT_TEXT = {
  terracotta: "text-terracotta",
  clay: "text-clay",
  copper: "text-copper",
  rust: "text-rust",
  gold: "text-gold",
  butter: "text-butter",
  sky: "text-sky",
  sage: "text-sage",
  white: "text-white",
  current: "",
} as const;

export type AccentTone = keyof typeof ACCENT_TEXT;
