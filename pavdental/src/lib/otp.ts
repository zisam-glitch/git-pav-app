/**
 * Helpers for the one-time-code input: what to keep from typed or pasted text,
 * and how to lay it out across the boxes. Pure, so it can be tested.
 */

/** Digits only: spaces, dashes and letters are dropped, extra digits cut off. */
export function sanitizeOtp(raw: string, length: number): string {
  return raw.replace(/\D/g, "").slice(0, length);
}

export interface OtpCell {
  char: string;
  /** The box the next digit will go in. */
  active: boolean;
  filled: boolean;
}

/** One entry per box. */
export function otpCells(value: string, length: number): OtpCell[] {
  const digits = sanitizeOtp(value, length);
  return Array.from({ length }, (_, i) => ({
    char: digits[i] ?? "",
    active: i === Math.min(digits.length, length - 1),
    filled: i < digits.length,
  }));
}

export function isOtpComplete(value: string, length: number): boolean {
  return sanitizeOtp(value, length).length === length;
}
