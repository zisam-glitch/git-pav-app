/**
 * Checks for the personal-details steps that match what the server accepts, so
 * a mistake is caught on the step where it was made, not as "Invalid request
 * body" on the last one.
 */

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/;

/** "sw1a1aa" or " sw1a  1aa " becomes "SW1A 1AA"; null if it is not a UK postcode. */
export function normalisePostcode(input: string): string | null {
  const compact = input.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5 || compact.length > 7) return null;
  const spaced = `${compact.slice(0, -3)} ${compact.slice(-3)}`;
  return UK_POSTCODE.test(spaced) ? spaced : null;
}

/** An emergency contact number: empty is fine (it is optional), otherwise 7 to 32 characters with at least 7 digits. */
export function isPlausiblePhone(input: string): boolean {
  const v = input.trim();
  if (!v) return true;
  if (v.length < 7 || v.length > 32) return false;
  return (v.match(/\d/g) ?? []).length >= 7 && /^[+\d\s()-]+$/.test(v);
}

/** Plain wording for a failed save of the profile or consents (never the server's raw message). */
export function onboardingSaveError(serverMessage: string | undefined): string {
  if (!serverMessage || /^invalid request/i.test(serverMessage)) {
    return "Some of your details weren't accepted. Go back and check your postcode and phone number, then try again.";
  }
  return serverMessage;
}
