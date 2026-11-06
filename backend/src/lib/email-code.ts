/**
 * Short email verification codes.
 *
 * The emailed link carries a long random token. People who can't open the link
 * on their phone type a short code instead. A short code is only safe when it
 * is tied to one account and the number of guesses is capped, so:
 *
 *  - the code is stored hashed together with the user id, so two people can
 *    hold the same six digits without clashing;
 *  - confirming needs the email address as well as the code;
 *  - the route allows EMAIL_CODE_MAX_ATTEMPTS tries per address per window;
 *  - a code lives 30 minutes, far shorter than the 24-hour link.
 *
 * Pure helpers only (no database or Redis), so they can be unit tested.
 */
import { createHash, randomInt } from "crypto";

export const EMAIL_CODE_LENGTH = 6;
export const EMAIL_CODE_VALID_SECONDS = 30 * 60;
export const EMAIL_CODE_MAX_ATTEMPTS = 5;
export const EMAIL_CODE_WINDOW_SECONDS = 15 * 60;

/** A random six-digit code, zero padded ("004821"). */
export function generateEmailCode(): string {
  return String(randomInt(0, 10 ** EMAIL_CODE_LENGTH)).padStart(EMAIL_CODE_LENGTH, "0");
}

/**
 * What the app sends: digits only, spaces and dashes allowed ("483 921").
 * Returns null when it isn't exactly six digits.
 */
export function normaliseEmailCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/[\s-]/g, "");
  return new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`).test(digits) ? digits : null;
}

/** Stored form of a code: bound to the user, never the bare digits. */
export function hashEmailCode(userId: string, code: string): string {
  return createHash("sha256").update(`email-code:${userId}:${code}`).digest("hex");
}

/** "483921" becomes "483 921" for the email body. */
export function formatEmailCode(code: string): string {
  const half = Math.ceil(code.length / 2);
  return `${code.slice(0, half)} ${code.slice(half)}`;
}
