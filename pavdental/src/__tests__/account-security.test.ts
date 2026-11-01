/**
 * Phone change, consent history and two-step sign-in (plan Phase 4).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { consentLabel, sortHistory } from "../features/account/consents";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

const src = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

console.log("\n🔐 RUNNING ACCOUNT SECURITY TESTS (Phase 4)...\n");

// ─── A new phone number is only saved once verified ──────────────────────────
const personal = src("app/(patient)/(tabs)/profile/personal-info.tsx");
assert(/\.\.\.\(phoneChanged \? \{\} : \{ phone: formData\.phone \}\)/.test(personal), "a changed number isn't sent with the other details");
assert(personal.includes("accountApi.requestPhoneChange(userId"), "a code is sent to the new number");
assert(personal.includes("accountApi.verifyPhoneChange(userId, pendingPhone"), "the number is saved by verifying the code for that number");
assert(personal.includes("Keep my old number"), "the patient can back out and keep their old number");

// ─── Consent history ──────────────────────────────────────────────────────────
const history = sortHistory([
  { id: "a", consentType: "data_processing", version: 1, isGranted: true, grantedAt: "2026-10-01T10:00:00Z", withdrawnAt: null },
  { id: "b", consentType: "marketing", version: 1, isGranted: false, grantedAt: "2026-09-01T10:00:00Z", withdrawnAt: "2026-10-20T10:00:00Z" },
  { id: "c", consentType: "clinical_records", version: 2, isGranted: true, grantedAt: "2026-10-10T10:00:00Z", withdrawnAt: null },
]);
assert(history.map((h) => h.id).join() === "b,c,a", "history is newest first, counting withdrawals");
assert(consentLabel("marketing") === "Recall & preventive reminders", "consents have the names the screen uses");
assert(consentLabel("some_new_type") === "some new type", "an unknown type is still readable");
const consent = src("app/(patient)/(tabs)/profile/consent.tsx");
assert(consent.includes("/api/consents/history?includeWithdrawn=true"), "consent screen loads the full history, withdrawals included");
assert(!/: "v1"\}/.test(consent), "no made-up 'v1' for a consent that was never given");
assert(!consent.includes('return "Recorded"'), "no 'Recorded' date for a consent that was never given");

// ─── Two-step sign-in ─────────────────────────────────────────────────────────
const card = src("features/security/two-step-card.tsx");
assert(card.includes('if (user?.role !== "patient") return null;'), "only patients see the switch (staff always use a code)");
assert(card.includes("accountApi.disableTwoStep(password, code.trim())"), "turning it off needs the password and a code");
assert(src("app/(patient)/(tabs)/profile/security.tsx").includes("<TwoStepCard />"), "the security screen shows it");

console.log("\n🎉 ALL ACCOUNT SECURITY TESTS PASSED (0 FAILURES)!\n");
