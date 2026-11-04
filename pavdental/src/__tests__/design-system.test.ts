/**
 * The Wise-baseline design system (docs/redesign).
 *
 * Every colour pair the shared components put text or icons on meets WCAG AA,
 * small controls keep a 44pt touch target, and the shared confirm sheet sizes
 * itself to its content (a fixed 34% height cut its second button off).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { colors, sizes, radius } from "../theme";
import { contrastRatio } from "../lib/a11y-scan";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🎨 RUNNING DESIGN SYSTEM TESTS...\n");

// ─── Text and icon colour pairs used by the shared components ────────────────
const pairs: [string, string, string, number][] = [
  ["onAccent", "accent", "primary button label", 4.5],
  ["onAccent", "accentSubtle", "secondary button label", 4.5],
  ["onInk", "ink", "text on forest-green surfaces", 4.5],
  ["tertiaryLabel", "background", "placeholder on the canvas", 4.5],
  ["tertiaryLabel", "inkSubtle", "disabled button label", 4.5],
  ["label", "inkSubtle", "chip label", 4.5],
  ["success", "successSubtle", "success badge", 4.5],
  ["warning", "warningSubtle", "warning badge", 4.5],
  ["danger", "dangerSubtle", "danger badge", 4.5],
  ["info", "infoSubtle", "info badge", 4.5],
  ["onInk", "toast", "toast text", 4.5],
  ["accent", "toast", "toast success icon", 3],
  ["inputUnderline", "background", "text field border", 3],
];
for (const [fg, bg, what, min] of pairs) {
  const ratio = contrastRatio(
    (colors as Record<string, string>)[fg],
    (colors as Record<string, string>)[bg]
  );
  assert(ratio >= min, `${what}: ${fg} on ${bg} is ${ratio.toFixed(1)}:1 (needs ${min}:1)`);
}

// ─── Touch targets ────────────────────────────────────────────────────────────
assert(sizes.button >= 44 && sizes.input >= 44 && sizes.iconButton >= 44, "buttons, fields and icon buttons are at least 44pt");
const button = readFileSync(join(__dirname, "../components/button.tsx"), "utf8");
const slop = button.match(/smallHitSlop = \{ top: (\d+), bottom: (\d+)/);
assert(!!slop && sizes.buttonSmall + Number(slop[1]) + Number(slop[2]) >= 44, "small pill buttons keep a 44pt touch target");
assert(/borderRadius: radius\.full/.test(button) && radius.full > 1000, "buttons are Wise pills");

// ─── Confirm sheet fits its content ──────────────────────────────────────────
const sheet = readFileSync(join(__dirname, "../components/confirm-sheet.tsx"), "utf8");
assert(/enableDynamicSizing/.test(sheet), "confirm sheet sizes itself to its content");
assert(!/snapPoints=\{/.test(sheet), "confirm sheet has no fixed height that could cut off its buttons");
assert(/insets\.bottom/.test(sheet), "confirm sheet keeps its buttons above the home indicator");

console.log("\n🎉 ALL DESIGN SYSTEM TESTS PASSED (0 FAILURES)!\n");
