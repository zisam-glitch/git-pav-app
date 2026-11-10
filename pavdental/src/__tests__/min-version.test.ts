/**
 * A broken build can be retired with a minimum version (plan section 4, item 8).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { isOlderVersion } from "../lib/app-version";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n⬆️ MINIMUM VERSION\n");

assert(isOlderVersion("1.0.0", "1.0.1"), "1.0.0 is older than 1.0.1");
assert(isOlderVersion("1.9.0", "1.10.0"), "1.9.0 is older than 1.10.0 (numbers, not text)");
assert(isOlderVersion("0.9.9", "1.0.0"), "0.9.9 is older than 1.0.0");
assert(!isOlderVersion("1.0.0", "1.0.0"), "The same version is allowed");
assert(!isOlderVersion("2.0.0", "1.9.9"), "A newer version is allowed");
assert(!isOlderVersion(undefined, "1.0.0") && !isOlderVersion("1.0.0", undefined) && !isOlderVersion("x", "1.0.0"), "Unknown versions are never blocked");
assert(!isOlderVersion("1.0.0", "0.0.0"), "A minimum of 0.0.0 blocks nobody");

const gate = readFileSync(join(__dirname, "../features/app-config/update-gate.tsx"), "utf8");
assert(gate.includes(".catch(() => {})"), "A failed check lets the app through");
assert(readFileSync(join(__dirname, "../app/_layout.tsx"), "utf8").includes("<UpdateGate>"), "The root layout is wrapped in the gate");

console.log("\n🎉 ALL MINIMUM VERSION TESTS PASSED!\n");
