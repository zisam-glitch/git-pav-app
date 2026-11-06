/** One-time code input: what it keeps from typed or pasted text, and how it fills the boxes. */
import { isOtpComplete, otpCells, sanitizeOtp } from "../lib/otp";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

assert(sanitizeOtp("483921", 6) === "483921", "keeps six digits");
assert(sanitizeOtp("483 921", 6) === "483921", "drops the space from a pasted '483 921'");
assert(sanitizeOtp("483-921", 6) === "483921", "drops dashes");
assert(sanitizeOtp("48a3b9", 6) === "4839", "drops letters");
assert(sanitizeOtp("12345678", 6) === "123456", "cuts extra digits");
assert(sanitizeOtp("Your code is 483 921.", 6) === "483921", "finds the digits in a pasted sentence");
assert(sanitizeOtp("", 6) === "", "empty stays empty");
assert(sanitizeOtp("٤٨٣", 6) === "", "ignores non-ASCII digits");

assert(isOtpComplete("483921", 6) && !isOtpComplete("48392", 6), "complete only at six digits");

const empty = otpCells("", 6);
assert(empty.length === 6 && empty.every((c) => c.char === "" && !c.filled), "six empty boxes");
assert(empty[0].active && empty.slice(1).every((c) => !c.active), "the first box is active when empty");

const partial = otpCells("48", 6);
assert(partial[0].char === "4" && partial[1].char === "8" && partial[2].char === "", "digits fill left to right");
assert(partial[2].active && !partial[1].active, "the next empty box is active");

const full = otpCells("483921", 6);
assert(full.every((c) => c.filled), "all boxes filled");
assert(full[5].active && full.slice(0, 5).every((c) => !c.active), "the last box stays active when full");

assert(otpCells("4839", 4).length === 4, "length is configurable");

console.log("\n🎉 ALL OTP INPUT TESTS PASSED!");
