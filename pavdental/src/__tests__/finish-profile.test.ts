/**
 * A skipped onboarding is offered again (R15).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { describeMissing, missingProfileParts } from "../features/onboarding/profile-completion";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n📝 FINISH YOUR PROFILE (R15)\n");

const full = { dob: "1990-04-15", medicalHistory: { hasAllergies: false }, consents: { data_processing: true } };
assert(missingProfileParts(full).length === 0, "A complete profile has nothing missing");
assert(missingProfileParts({ ...full, dob: null }).join() === "personal details", "A missing date of birth is reported");
assert(missingProfileParts({ ...full, medicalHistory: null }).join() === "medical history", "Missing medical history is reported");
assert(missingProfileParts({ ...full, medicalHistory: {} }).join() === "medical history", "An empty medical history is reported");
assert(missingProfileParts({ ...full, consents: {} }).join() === "consent", "Missing consent is reported");
assert(missingProfileParts({}).length === 3, "An empty profile is missing all three");
assert(missingProfileParts(undefined).length === 0, "While the profile is still loading nothing blocks booking");
assert(describeMissing(["personal details", "medical history", "consent"]) === "personal details, medical history and consent", "The list reads as a sentence");

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
assert(read("app/(patient)/booking/service-catalog.tsx").includes("Finish your profile first"), "Choosing a treatment offers to finish the profile");
assert(read("app/(patient)/(tabs)/home.tsx").includes("Finish your profile"), "Home shows a finish-your-profile card");
assert(read("app/onboarding/consents.tsx").includes('queryKey: ["patient-profile"]'), "Finishing onboarding refreshes the saved profile");

console.log("\n🎉 ALL FINISH PROFILE TESTS PASSED!\n");
