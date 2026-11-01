import { createHash } from "crypto";

/**
 * The OTP purpose for a phone-change code, tied to the number it was sent to:
 * a code sent to one number can't verify another. Only a short hash of the
 * number is stored with the code. No other imports, so dev scripts can use it.
 */
export function phoneChangePurpose(phone: string): `phone_change:${string}` {
  const digest = createHash("sha256").update(phone.replace(/\s/g, "")).digest("hex").slice(0, 16);
  return `phone_change:${digest}`;
}
