import { query } from "@/lib/db/client";
import { type EmailAlertSettings, readSettingsValue } from "@/lib/email-alert-settings";
import type { AlertOverride } from "@/lib/enquiry-alert";

const KEY = "email_alerts";

/** What staff saved on the "Email alerts" page, or null when nothing is saved (or the table is not there yet). */
export async function loadEmailAlertSettings(): Promise<EmailAlertSettings | null> {
  try {
    const rows = await query<{ value: unknown }>("SELECT value FROM site_settings WHERE key = $1", [KEY]);
    return readSettingsValue(rows[0]?.value);
  } catch (error) {
    // The form must still be saved and the practice still emailed from the server's own address.
    console.error("[email-alert-settings] could not read the saved settings", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return null;
  }
}

export async function saveEmailAlertSettings(settings: EmailAlertSettings): Promise<void> {
  await query(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [KEY, JSON.stringify(settings)],
  );
}

/** The saved settings in the shape the alert sender takes. Routes pass this to sendEnquiryAlert. */
export async function alertOverride(): Promise<AlertOverride> {
  const saved = await loadEmailAlertSettings();
  return saved ? { enabled: saved.enabled, recipients: saved.recipients } : {};
}
