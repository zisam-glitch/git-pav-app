// ─── Single theme entry point ─────────────────────────────────────────────────
// Import from "@/theme" everywhere — never from sub-files directly.
// Only one theme entry point may exist; never create competing token files.
export { colors, illustrationColors, type IllustrationColor } from "./colors";
export { spacing, sizes } from "./spacing";
export { type } from "./typography";
export { radius } from "./radius";
export { shadows } from "./shadows";
export { motion, spring, easing } from "./motion";

