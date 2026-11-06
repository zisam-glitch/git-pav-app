/** The password rules the screens show: length is the rule, no composition requirements. */
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, passwordLengthProblem, passwordMeter } from "../features/auth/password-rules";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

assert(MIN_PASSWORD_LENGTH === 15 && MAX_PASSWORD_LENGTH === 128, "15 to 128 characters, as the server");
assert(passwordLengthProblem("a".repeat(14)) !== null, "14 characters is too short");
assert(passwordLengthProblem("a".repeat(15)) === null, "15 characters is fine");
assert(passwordLengthProblem("correct horse battery staple") === null, "a lowercase passphrase is fine (no capital or digit needed)");
assert(passwordLengthProblem("tea & biscuits at the harbour") === null, "spaces and symbols are fine");
assert(passwordLengthProblem("a".repeat(129)) !== null, "129 characters is too long");
assert(/random words/.test(passwordLengthProblem("short") ?? ""), "the message suggests a passphrase");

assert(passwordMeter("").level === 0, "no meter for an empty field");
assert(passwordMeter("Abcd1234!").level === 1 && passwordMeter("Abcd1234!").label === "Too short", "short passwords read 'Too short' however mixed");
assert(passwordMeter("a".repeat(15)).level === 2 && passwordMeter("a".repeat(15)).label === "Good", "15 characters reads 'Good'");
assert(passwordMeter("a".repeat(20)).level === 3 && passwordMeter("a".repeat(20)).label === "Strong", "20 characters reads 'Strong'");

console.log("\n🎉 ALL PASSWORD RULE TESTS PASSED!");
