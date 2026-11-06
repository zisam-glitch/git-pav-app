/**
 * Password rules the screens show. The server decides (length, common and
 * breached passwords: backend/src/lib/password-policy.ts); this only gives
 * instant feedback and the same wording.
 *
 * Length is the rule. There are no "must contain a capital and a number"
 * requirements, which push people toward "Password1" (NIST SP 800-63B).
 * Pure (no React Native imports) so it can be tested.
 */
export const MIN_PASSWORD_LENGTH = 15;
export const MAX_PASSWORD_LENGTH = 128;

export const PASSWORD_HINT = `Use at least ${MIN_PASSWORD_LENGTH} characters. Three or four random words work well.`;

/** What's wrong with the length, or null when it's fine. */
export function passwordLengthProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters. Three or four random words work well.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  }
  return null;
}

export type PasswordMeterLevel = 0 | 1 | 2 | 3;

/** Meter for the sign-up and reset screens: length, nothing else. */
export function passwordMeter(password: string): { level: PasswordMeterLevel; label: string } {
  if (!password) return { level: 0, label: "" };
  if (password.length < MIN_PASSWORD_LENGTH) return { level: 1, label: "Too short" };
  if (password.length < 20) return { level: 2, label: "Good" };
  return { level: 3, label: "Strong" };
}
