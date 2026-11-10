/**
 * The phone bundle has a size budget, and no web renderer in it (checklist C2).
 */

import { readFileSync } from "fs";
import { join } from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n📦 BUNDLE BUDGET\n");

const root = join(__dirname, "../..");
const budget = JSON.parse(readFileSync(join(root, "bundle-budget.json"), "utf8")).androidJsBytes;
assert(Number.isInteger(budget) && budget > 1_000_000 && budget < 20_000_000, `bundle-budget.json holds a believable byte count (${budget})`);

const metro = readFileSync(join(root, "metro.config.js"), "utf8");
assert(
  /platform !== "web" && \/\^\(react-native-web\|react-dom\)/.test(metro) && /type: "empty"/.test(metro),
  "Phone builds get an empty module for react-native-web and react-dom"
);

const ci = readFileSync(join(root, "../.github/workflows/ci.yml"), "utf8");
assert(ci.includes("npm run check:bundle"), "CI runs the bundle size check");
assert(readFileSync(join(root, "package.json"), "utf8").includes('"check:bundle"'), "There is an npm script for it");

console.log("\n🎉 ALL BUNDLE BUDGET TESTS PASSED!\n");
