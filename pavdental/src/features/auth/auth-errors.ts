/**
 * Sign-up and email verification errors the app can tell apart.
 *
 * The API sends a plain sentence in `error` and, for the cases the screens
 * react to, a stable `code`. Screens match on the code, never on the wording.
 * Pure (no React Native imports) so it can be tested.
 */
export type AuthErrorCode =
  | "EMAIL_REGISTERED" // sign-up with an address that already has an account
  | "EMAIL_VERIFIED" // asked for a code for an address that is already verified
  | "EMAIL_NOT_SENT" // the email provider refused or was unreachable
  | "RATE_LIMITED" // too many requests or wrong guesses
  | "CODE_INVALID" // wrong or expired six-digit code
  | "CODE_FORMAT"; // not six digits

export class AuthApiError extends Error {
  readonly status: number;
  readonly code?: AuthErrorCode;

  constructor(message: string, status: number, code?: AuthErrorCode) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
  }
}

const KNOWN_CODES: readonly string[] = [
  "EMAIL_REGISTERED",
  "EMAIL_VERIFIED",
  "EMAIL_NOT_SENT",
  "RATE_LIMITED",
  "CODE_INVALID",
  "CODE_FORMAT",
];

/** Builds an error from a failed response, keeping the server's sentence and code. */
export async function readAuthError(res: Response, fallback: string): Promise<AuthApiError> {
  const body = (await res.json().catch(() => ({}))) as { error?: unknown; code?: unknown };
  const message = typeof body.error === "string" && body.error.trim() ? body.error : fallback;
  const code = typeof body.code === "string" && KNOWN_CODES.includes(body.code) ? (body.code as AuthErrorCode) : undefined;
  return new AuthApiError(message, res.status, code);
}

/** The code on an error, if it came from the API. */
export function authErrorCode(err: unknown): AuthErrorCode | undefined {
  return err instanceof AuthApiError ? err.code : undefined;
}

/**
 * What to show for any failure. A dropped connection gets its own message
 * rather than the browser's "Network request failed".
 */
export function friendlyAuthMessage(err: unknown, fallback: string): string {
  if (err instanceof AuthApiError) return err.message || fallback;
  const text = err instanceof Error ? err.message : "";
  if (/network request failed|failed to fetch|network error|timed? ?out|aborted/i.test(text)) {
    return "We couldn't reach Pav Dental. Check your internet connection and try again.";
  }
  return text || fallback;
}

/** "sent" and "failed" are what the API reports after registering. */
export type VerificationEmailStatus = "sent" | "failed";

export function parseVerificationEmailStatus(value: unknown): VerificationEmailStatus | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "sent" || raw === "failed" ? raw : undefined;
}

/** Whole seconds left on a resend cooldown, never below zero. */
export function secondsLeft(readyAt: number, now: number): number {
  return Math.max(0, Math.ceil((readyAt - now) / 1000));
}
