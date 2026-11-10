/**
 * Patient-facing screens use plain words (readiness plan §6).
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🗣️ PLAIN WORDING\n");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n: string) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

const appDir = join(__dirname, "../app");
// Clinician and van-operator screens are written for staff.
const patientFiles = files(appDir).filter((f) => !f.includes("(clinician)") && !f.includes("(operator)"));
const text = patientFiles.map((f) => readFileSync(f, "utf8")).join("\n");

const banned = [
  "Digital odontogram",
  "Clinical vault",
  "Document vault",
  "Treatment estimates",
  "Telehealth waiting room",
  "intraoral photos",
  "Live van dispatch",
  "polygon",
  "surgery van",
  "surgical van",
  "clinical block",
  "phone OTP",
  "Consent & GDPR",
  "GDPR data bundle",
  "authorised sessions",
  "Danger zone",
  "has been dispatched",
  "Route message to",
  "Care team clinician",
  "Consultation ready",
];
for (const phrase of banned) {
  assert(!text.toLowerCase().includes(phrase.toLowerCase()), `Patient screens no longer say "${phrase}"`);
}

console.log("\n🎉 ALL PLAIN WORDING TESTS PASSED!\n");
