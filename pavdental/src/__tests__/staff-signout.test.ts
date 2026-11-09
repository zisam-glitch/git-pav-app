/**
 * Clinicians and van operators can sign out (R14).
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🚪 STAFF SIGN-OUT (R14)\n");

const app = join(__dirname, "../app");
const shared = readFileSync(join(__dirname, "../features/auth/staff-settings-screen.tsx"), "utf8");
assert(shared.includes("authApi.signOut()"), "The settings screen signs out through the auth API");
assert(shared.includes("ConfirmSheet"), "Signing out asks first");

for (const group of ["(clinician)", "(operator)"]) {
  assert(existsSync(join(app, group, "settings.tsx")), `${group} has a settings screen`);
  assert(readFileSync(join(app, group, "_layout.tsx"), "utf8").includes('name="settings"'), `${group} lists the settings screen`);
}
assert(readFileSync(join(app, "(clinician)/schedule.tsx"), "utf8").includes("/(clinician)/settings"), "The clinician schedule links to settings");
assert(readFileSync(join(app, "(operator)/shift.tsx"), "utf8").includes("/(operator)/settings"), "The operator shift screen links to settings");

console.log("\n🎉 ALL STAFF SIGN-OUT TESTS PASSED!\n");
