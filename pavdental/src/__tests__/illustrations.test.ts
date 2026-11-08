/**
 * Spot illustrations (src/components/illustrations).
 *
 * Every registered piece exists, draws only with colours from the app's
 * illustration palette (no stray Streamline red or navy), and stays decorative:
 * hidden from screen readers so the heading beside it carries the meaning.
 * Screens only ask for names the registry has.
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { illustrationColors } from "../theme";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🖼  RUNNING ILLUSTRATION TESTS...\n");

const dir = join(__dirname, "../components/illustrations");
const registry = readFileSync(join(dir, "index.tsx"), "utf8");
const entries = [...registry.matchAll(/^\s+(\w+): \(\) => require\("\.\/art\/([\w-]+)"\)\.default,$/gm)].map(
  ([, name, file]) => ({ name, file }),
);
assert(entries.length >= 10, `registry lists the illustrations (${entries.length})`);

for (const { name, file } of entries) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const xml: string = require(join(dir, "art", file)).default;
  assert(xml.startsWith("<svg") && xml.endsWith("</svg>"), `${name}: ${file} is one SVG`);
  const tokens = [...new Set([...xml.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
  const unknown = tokens.filter((t) => !(t in illustrationColors));
  assert(unknown.length === 0, `${name}: only palette colours (${unknown.join(", ") || "ok"})`);
  assert(!/#[0-9a-f]{3,6}\b|"black"|"white"/i.test(xml), `${name}: no hard-coded colours`);
}

assert(
  /accessibilityElementsHidden/.test(registry) && /importantForAccessibility="no-hide-descendants"/.test(registry),
  "illustrations are hidden from screen readers",
);

// Every name a screen asks for is in the registry.
const names = new Set(entries.map((e) => e.name));
function walk(d: string): string[] {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : /\.tsx?$/.test(e.name) ? [join(d, e.name)] : [],
  );
}
const used = new Set<string>();
for (const f of walk(join(__dirname, "../app"))) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/(?:illustration|emptyIllustration)="(\w+)"|<Illustration name="(\w+)"/g)) used.add(m[1] ?? m[2]);
  for (const m of src.matchAll(/<Illustration name=\{[^}]*?"(\w+)"[^}]*?"(\w+)"\s*\}/g)) [m[1], m[2]].forEach((n) => used.add(n));
}
const missing = [...used].filter((n) => !names.has(n));
assert(used.size > 0 && missing.length === 0, `screens use registered illustrations (${missing.join(", ") || [...used].length + " names"})`);

console.log("\n🎉 ALL ILLUSTRATION TESTS PASSED (0 FAILURES)!\n");
