// The "who gets the website form emails" setting, as plain functions with no
// imports so tests load them directly. The database side is
// email-alert-settings.server.ts; the sender is enquiry-alert.ts.

export const MAX_RECIPIENTS = 5;

/** What the dashboard saves: a switch and up to five addresses. */
export interface EmailAlertSettings {
  enabled: boolean;
  recipients: string[];
}

const EMAIL = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:"]{2,}$/;

/** A plain `name@domain.tld` address. Not a full RFC check: it keeps typos and injected headers out. */
export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL.test(value);
}

export type ParsedRecipients = { ok: true; recipients: string[] } | { ok: false; error: string };

/**
 * Reads the addresses a person typed (comma, semicolon, space or line separated)
 * or an array of them. Lower-cases, drops repeats, refuses anything that is not
 * an address and more than MAX_RECIPIENTS.
 */
export function parseRecipients(input: unknown): ParsedRecipients {
  let parts: string[] = [];
  if (Array.isArray(input)) parts = input.map((item) => String(item ?? ""));
  else if (typeof input === "string") parts = input.split(/[\s,;]+/);
  const recipients: string[] = [];
  for (const raw of parts) {
    const address = raw.trim().toLowerCase();
    if (!address) continue;
    if (!isValidEmail(address)) return { ok: false, error: `"${raw.trim().slice(0, 80)}" is not a valid email address.` };
    if (!recipients.includes(address)) recipients.push(address);
  }
  if (recipients.length > MAX_RECIPIENTS) {
    return { ok: false, error: `Add at most ${MAX_RECIPIENTS} email addresses.` };
  }
  return { ok: true, recipients };
}

/** The saved value from the database, or null when it is missing or not the shape we write. */
export function readSettingsValue(raw: unknown): EmailAlertSettings | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as { enabled?: unknown; recipients?: unknown };
  const parsed = parseRecipients(value.recipients);
  if (!parsed.ok) return null;
  return { enabled: value.enabled !== false, recipients: parsed.recipients };
}

export type AlertSource = "dashboard" | "environment" | "none";

/** Where the alerts will go right now, for the settings page to show. */
export function describeAlertTarget(
  saved: EmailAlertSettings | null,
  environmentRecipient: string | null,
): { source: AlertSource; recipients: string[]; enabled: boolean } {
  if (saved && !saved.enabled) return { source: "dashboard", recipients: saved.recipients, enabled: false };
  if (saved && saved.recipients.length > 0) return { source: "dashboard", recipients: saved.recipients, enabled: true };
  const fallback = environmentRecipient?.trim();
  if (fallback) return { source: "environment", recipients: [fallback], enabled: true };
  return { source: "none", recipients: [], enabled: false };
}
