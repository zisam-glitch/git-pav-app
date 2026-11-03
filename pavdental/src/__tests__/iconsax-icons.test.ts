/**
 * Icon rules from the Wise audit: every icon is Iconsax, Linear by default
 * (Bold only for the active tab), and no text glyphs stand in for icons.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🔣 RUNNING ICONSAX ICON TESTS...\n");

const SRC = join(__dirname, "..");
const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "__tests__" || name === "node_modules") continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name)) files.push(p);
  }
};
walk(SRC);

const iconModule = readFileSync(join(SRC, "components/app-icon.tsx"), "utf8");
const required = [...iconModule.matchAll(/require\("iconsax-react-native\/dist\/cjs\/([A-Za-z0-9]+)\.js"\)/g)].map((m) => m[1]);
assert(required.length > 50, `AppIcon maps its names to Iconsax glyphs (${required.length})`);
const missing = required.filter((n) => !existsSync(join(SRC, "..", "node_modules/iconsax-react-native/dist/cjs", `${n}.js`)));
assert(missing.length === 0, `every Iconsax glyph exists in the package${missing.length ? `: ${missing.join(", ")}` : ""}`);
assert(!/from "iconsax-react-native";/.test(iconModule.replace(/import type[^;]*;/g, "")), "AppIcon doesn't import the whole icon set into the bundle");
assert(/variant = "Linear"/.test(iconModule), "Linear is the default style");

const otherLibs = files.filter((f) => /from "(@expo\/vector-icons|react-native-vector-icons|lucide-react-native|expo-symbols)/.test(readFileSync(f, "utf8")));
assert(otherLibs.length === 0, `no other icon library is imported${otherLibs.length ? `: ${otherLibs.join(", ")}` : ""}`);

const bold = files.filter((f) => /variant=\{?"Bold"/.test(readFileSync(f, "utf8"))).map((f) => f.slice(SRC.length + 1)).sort();
assert(bold.every((f) => ["app/(patient)/(tabs)/_layout.tsx", "components/checkbox-mark.tsx"].includes(f)), `Bold appears only on the active tab and a ticked checkbox (${bold.join(", ")})`);

const glyphs = files.filter((f) => !f.endsWith("app-icon.tsx") && /[✓✕☑☐✔✗✘○]/.test(readFileSync(f, "utf8")));
assert(glyphs.length === 0, `no text glyphs used as icons${glyphs.length ? `: ${glyphs.join(", ")}` : ""}`);
const typedPlus = files.filter((f) => /title="\+ /.test(readFileSync(f, "utf8")));
assert(typedPlus.length === 0, "buttons use the Iconsax plus, not a typed '+'");

console.log("\n🎉 ALL ICONSAX ICON TESTS PASSED (0 FAILURES)!\n");
