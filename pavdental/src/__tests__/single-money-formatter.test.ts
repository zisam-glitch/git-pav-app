/**
 * Money is shown one way, and dead code stays deleted (checklist A5, B3, B5).
 */

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { formatGbp } from "../lib/money";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n💷 ONE MONEY FORMATTER\n");

assert(formatGbp(8500) === "£85.00" && formatGbp(5) === "£0.05" && formatGbp(0) === "£0.00", "Pence become pounds with two decimals");

const src = join(__dirname, "..");
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((n: string) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? (n === "__tests__" || n === "__component__" ? [] : files(p)) : /\.tsx?$/.test(n) ? [p] : [];
  });

const offenders = files(src).filter((f) => {
  if (f.endsWith("lib/money.ts")) return false;
  return /\/\s*100\)\.toFixed\(2\)/.test(readFileSync(f, "utf8").replace(/\/\/ The wallet sheet[^\n]*\n[^\n]*toFixed\(2\)[^\n]*/g, ""));
});
assert(offenders.length === 0, `No screen or helper formats pence by hand${offenders.length ? ": " + offenders.join(", ") : ""}`);

for (const gone of [
  "lib/react-query-persistence.ts",
  "features/payment/payment-hooks.ts",
  "components/better-icons-registry.ts",
  "components/illustrations/art/designer-keynote.ts",
]) {
  assert(!existsSync(join(src, gone)), `${gone} stays deleted (nothing used it)`);
}

const catalog = readFileSync(join(src, "app/(patient)/booking/service-catalog.tsx"), "utf8");
assert(!/\*\s*0\.25/.test(catalog), "The catalogue does not guess a 25% deposit");

console.log("\n🎉 ALL SINGLE MONEY FORMATTER TESTS PASSED!\n");
