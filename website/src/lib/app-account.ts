// The website pages that email links open: verify an email address, and set or
// reset a password (staff invitations use the same link). They talk to the
// app's backend, which owns accounts, not the dashboard the rest of the site
// uses.

/** The app backend, e.g. https://api.pavdental.com (VITE_APP_API_URL). */
export const APP_API_BASE: string =
  (typeof window !== "undefined" &&
    (window as unknown as { __ENV__?: Record<string, string> }).__ENV__?.VITE_APP_API_URL) ||
  import.meta.env?.VITE_APP_API_URL ||
  "http://localhost:3000";

/** Same rules as the backend (8–128 characters, upper and lower case, a number). */
export function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 8) problems.push("At least 8 characters");
  if (password.length > 128) problems.push("No more than 128 characters");
  if (!/[A-Z]/.test(password)) problems.push("An uppercase letter");
  if (!/[a-z]/.test(password)) problems.push("A lowercase letter");
  if (!/[0-9]/.test(password)) problems.push("A number");
  return problems;
}

/**
 * Reads the one-time token from the link, then removes it from the address
 * bar so it doesn't stay in history or reach analytics.
 */
export function takeTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token")?.trim() || null;
  if (token) {
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }
  return token;
}

export type AccountResult = { ok: true } | { ok: false; message: string };

async function post(path: string, body: unknown, fetchImpl: typeof fetch): Promise<AccountResult> {
  try {
    const res = await fetchImpl(`${APP_API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    if (res.status === 429) return { ok: false, message: "Too many attempts. Please wait a few minutes and try again." };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 400 && /token/i.test(data.error ?? "")) {
      return { ok: false, message: "This link has expired or has already been used." };
    }
    return { ok: false, message: data.error || "Something went wrong. Please try again." };
  } catch {
    return { ok: false, message: "We couldn't reach Pav Dental. Check your connection and try again." };
  }
}

export function confirmEmail(token: string, fetchImpl: typeof fetch = fetch): Promise<AccountResult> {
  return post("/api/auth/verify-email/confirm", { token }, fetchImpl);
}

export function resetPassword(token: string, newPassword: string, fetchImpl: typeof fetch = fetch): Promise<AccountResult> {
  return post("/api/auth/password-reset/confirm", { token, newPassword }, fetchImpl);
}
