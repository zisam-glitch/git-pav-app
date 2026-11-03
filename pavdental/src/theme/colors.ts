// ─── Semantic palette — Wise iOS baseline (docs/redesign/reference-map.md) ────
// Static LIGHT values (app is light-only — see app.json userInterfaceStyle).
// A white canvas, warm neutral surfaces for cards and fills, forest-green ink
// for icons, links and dark surfaces, and Wise's bright green only for the
// primary action and selected controls. Colour beyond that is for status.
// Never hardcode hexes in screens.
//
// Every text colour passes WCAG AA (4.5:1) on both the canvas and the card
// surface; src/__tests__/accessibility.test.ts checks this.
export const colors = {
  // Core ink — Wise "forest green": icons, links, dark surfaces, selected chips
  ink: "#163300", // 13.9:1 on white
  inkSoft: "#0E2400", // pressed ink
  onInk: "#FFFFFF",
  inkSubtle: "#E8EBE6", // neutral fill — secondary buttons, chips, icon buttons

  // Brand accent — Wise "bright green": primary buttons and selected controls only
  accent: "#9FE870",
  accentPressed: "#80E142",
  onAccent: "#163300", // 9.3:1 on accent
  accentSubtle: "#E2F6D5", // light green pills ("Add money", "Request")

  // Text
  label: "#0E0F0C",
  secondaryLabel: "#454745", // 9.4:1 on white
  tertiaryLabel: "#5F615F", // placeholders, disabled, inactive tab icons (AA on fills too)

  // Surfaces
  background: "#FFFFFF", // screen canvas
  systemBackground: "#F2F4EF", // cards and grouped surfaces on the canvas
  secondaryBackground: "#FFFFFF", // subtle fill on a card
  tertiaryBackground: "#FFFFFF", // text fields
  sheet: "#FFFFFF", // bottom sheets and modals
  tabBar: "#FFFFFF",

  // Lines
  separator: "#E2E4DF", // row dividers, card borders
  inputUnderline: "#868685", // text field border (3.6:1, enough for a control outline)

  // Status semantics
  success: "#2F5711", // text-safe green
  successFill: "#2F5711", // switches, check circles
  successSubtle: "#E2F6D5",
  warning: "#5C4A00",
  warningFill: "#EDC843",
  warningSubtle: "#FBF2CF",
  danger: "#A8200D",
  dangerSubtle: "#FBE7E3",
  info: "#163300", // links are forest green and underlined, as in Wise
  infoSubtle: "#E2F6D5",

  // Toast / snackbar
  toast: "#0E0F0C",

  // Always-fixed values (do not adapt to theme)
  onTint: "#FFFFFF",
  alwaysBlack: "#000000",
  alwaysWhite: "#FFFFFF",
  scrim: "rgba(14, 15, 12, 0.4)",
} as const;
