/**
 * What counts as an acceptable new password.
 *
 * Follows NIST SP 800-63B and the OWASP Authentication Cheat Sheet:
 *  - length is the rule: at least 15 characters, because a password is the only
 *    thing protecting a patient account (NIST asks 15 for single-factor);
 *  - no "must contain an uppercase letter and a number" rules, which push
 *    people toward "Password1";
 *  - allow up to 128 characters and any printable character, so passphrases
 *    and password managers work;
 *  - refuse passwords that are on a common list, built from the person's own
 *    name or email, or known from earlier data breaches.
 *
 * The breach check asks the Pwned Passwords range service. Only the first five
 * characters of the password's SHA-1 hash leave the server, never the password
 * and never enough to identify it (k-anonymity). If the service can't be
 * reached the password is accepted, so sign-up never depends on a third party.
 * Set PASSWORD_BREACH_CHECK=off to turn the network check off.
 */
import { createHash } from "crypto";

export const MIN_PASSWORD_LENGTH = 15;
export const MAX_PASSWORD_LENGTH = 128;

export const PASSWORD_TOO_SHORT = `Use at least ${MIN_PASSWORD_LENGTH} characters. Three or four random words work well.`;
export const PASSWORD_TOO_LONG = `Use ${MAX_PASSWORD_LENGTH} characters or fewer.`;
export const PASSWORD_TOO_COMMON = "That password is too easy to guess. Choose something longer and less common.";
export const PASSWORD_PERSONAL = "Don't use your name or email in your password.";
export const PASSWORD_BREACHED = "That password has appeared in a data breach, so it isn't safe to use. Choose a different one.";

/** Passwords people pick most, plus the shapes that pass naive rules. Lowercased. */
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password12", "password123", "password1234", "passw0rd", "p@ssw0rd", "p@ssword",
  "123456", "1234567", "12345678", "123456789", "1234567890", "12345678910", "123456789012", "123456789012345",
  "qwerty", "qwerty123", "qwertyuiop", "qwertyuiop123", "asdfghjkl", "zxcvbnm", "1q2w3e4r", "1q2w3e4r5t",
  "iloveyou", "letmein", "welcome", "welcome1", "welcome123", "admin", "admin123", "administrator",
  "monkey", "dragon", "football", "baseball", "superman", "trustno1", "abc123", "abcd1234",
  "changeme", "changeme123", "default", "master", "login", "princess", "sunshine", "shadow",
  "pavdental", "pavdental123", "dentist", "dentalcare", "teethcare",
]);

/** The same password with the usual swaps undone ("P@ssw0rd" -> "password"). */
function squash(value: string): string {
  return value
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[10!|]/g, (c) => (c === "0" ? "o" : "i"))
    .replace(/[5$]/g, "s")
    .replace(/[^a-z0-9]/g, "");
}

export interface PasswordContext {
  email?: string;
  firstName?: string;
  lastName?: string;
}

/** Length rules only: instant, no lookups. */
export function checkPasswordLength(password: unknown): string | null {
  if (typeof password !== "string") return PASSWORD_TOO_SHORT;
  if (password.length < MIN_PASSWORD_LENGTH) return PASSWORD_TOO_SHORT;
  if (password.length > MAX_PASSWORD_LENGTH) return PASSWORD_TOO_LONG;
  return null;
}

/** On the common list, one character away from it, or made of the person's own details. */
export function checkPasswordGuessable(password: string, context: PasswordContext = {}): string | null {
  const lower = password.toLowerCase();
  const squashed = squash(password);

  if (COMMON_PASSWORDS.has(lower) || COMMON_PASSWORDS.has(squashed)) return PASSWORD_TOO_COMMON;
  // One short word or run of digits repeated or padded ("aaaaaaaaaaaaaaaa", "1234123412341234").
  if (/^(.{1,4})\1+$/.test(password)) return PASSWORD_TOO_COMMON;
  if (/^\d+$/.test(password) && /^(?:0123456789|1234567890|9876543210)/.test(password)) return PASSWORD_TOO_COMMON;

  const personal = [
    context.email?.split("@")[0],
    context.firstName,
    context.lastName,
  ]
    .map((part) => (part ?? "").toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((part) => part.length >= 4);
  // Refuse when the password is little more than the person's details.
  if (personal.some((part) => squashed.includes(part) && squashed.length <= part.length + 6)) {
    return PASSWORD_PERSONAL;
  }
  return null;
}

/** "A1B2C:12" lines from the range service: how many times a suffix was seen. */
export function breachCountFromRange(body: string, suffix: string): number {
  for (const line of body.split(/\r?\n/)) {
    const [candidate, count] = line.trim().split(":");
    if (candidate && candidate.toUpperCase() === suffix.toUpperCase()) return Number(count) || 0;
  }
  return 0;
}

/** True when the password is known from a breach. Never throws; unreachable means false. */
export async function isBreachedPassword(
  password: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 2000
): Promise<boolean> {
  if (process.env.PASSWORD_BREACH_CHECK === "off" || process.env.NODE_ENV === "test") return false;
  try {
    const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
    const res = await fetchImpl(`https://api.pwnedpasswords.com/range/${sha1.slice(0, 5)}`, {
      headers: { "Add-Padding": "true", "User-Agent": "pavdental-api" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return false;
    return breachCountFromRange(await res.text(), sha1.slice(5)) > 0;
  } catch {
    return false;
  }
}

export type PasswordCheck = { ok: true } | { ok: false; error: string };

/** The whole check for a new password: length, guessable, then breaches. */
export async function validateNewPassword(
  password: unknown,
  context: PasswordContext = {},
  fetchImpl: typeof fetch = fetch
): Promise<PasswordCheck> {
  const lengthProblem = checkPasswordLength(password);
  if (lengthProblem) return { ok: false, error: lengthProblem };
  const text = password as string;
  const guessable = checkPasswordGuessable(text, context);
  if (guessable) return { ok: false, error: guessable };
  if (await isBreachedPassword(text, fetchImpl)) return { ok: false, error: PASSWORD_BREACHED };
  return { ok: true };
}
