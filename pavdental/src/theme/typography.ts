import { TextStyle } from "react-native";
import { colors } from "./colors";

// ─── Named text styles — Wise iOS baseline ────────────────────────────────────
// System font (SF Pro on iOS) standing in for Wise Sans: heavy, tightly set
// left-aligned screen titles, 16pt body, semibold row titles, grey 14pt
// secondary copy and section labels.
// Dynamic Type is on by default (allowFontScaling unset = true).
// Use ThemedText component to apply these; screens never touch fontSize directly.
export const type = {
  // Screen titles ("Confirm and send", "Security and privacy")
  largeTitle: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.label,
  },
  // Hero numbers, section titles and sheet titles ("27.40 SGD", "Transactions")
  title: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colors.label,
  },
  // Row titles, card titles, nav-bar titles, button labels
  headline: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    color: colors.label,
  },
  // Body copy
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    color: colors.label,
  },
  // Secondary content, row subtitles, screen intro copy
  subhead: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 21,
    color: colors.secondaryLabel,
  },
  // Row subtitles under a row title
  footnote: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 19,
    color: colors.secondaryLabel,
  },
  // Timestamps, field hints, fine print
  caption: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 17,
    color: colors.secondaryLabel,
  },
  // Prices, stats, metrics — tabular nums for alignment
  mono: {
    fontSize: 16,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    lineHeight: 22,
    color: colors.label,
  },
  // Section labels above lists ("Transfer details", "Held as cash"):
  // grey sentence case, as in Wise.
  overline: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 19,
    color: colors.secondaryLabel,
  },
  // Tab bar labels and tiny badges
  micro: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 13,
    color: colors.secondaryLabel,
  },
} as const satisfies Record<string, TextStyle>;
