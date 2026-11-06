/**
 * Phone sign-in codes through Twilio Verify.
 *
 * Verify sends the code by SMS from Twilio's own sender pool, so we don't buy
 * or register a sending number, and it keeps the code and counts wrong guesses
 * itself. We only ask it to start a verification and to check a code.
 *
 *   POST /v2/Services/{VA...}/Verifications       { To, Channel: "sms" }
 *   POST /v2/Services/{VA...}/VerificationCheck   { To, Code } -> status "approved"
 *
 * Used when TWILIO_VERIFY_SERVICE_SID, TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
 * are all set; otherwise phone sign-in keeps using the codes the API makes and
 * stores itself. Errors log the Twilio error code only, never the number or
 * the code (CS-1).
 */
import { maskPhone } from "./log-safety";

const VERIFY_BASE = "https://verify.twilio.com/v2/Services";
const TIMEOUT_MS = 6000;

export interface VerifyConfig {
  accountSid: string;
  authToken: string;
  serviceSid: string;
}

/** The three settings, or null when phone codes should not go through Verify. */
export function verifyConfigFromEnv(env: NodeJS.ProcessEnv = process.env): VerifyConfig | null {
  const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = env.TWILIO_AUTH_TOKEN?.trim();
  const serviceSid = env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (!accountSid || !authToken || !serviceSid) return null;
  // A Verify service ID is "VA" and 32 hex characters; anything else is a placeholder.
  if (!/^VA[0-9a-fA-F]{32}$/.test(serviceSid)) return null;
  if (accountSid.startsWith("mock") || authToken.startsWith("mock")) return null;
  return { accountSid, authToken, serviceSid };
}

async function post(
  config: VerifyConfig,
  endpoint: "Verifications" | "VerificationCheck",
  form: Record<string, string>,
  fetchImpl: typeof fetch
): Promise<{ status: number; body: Record<string, unknown> }> {
  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const res = await fetchImpl(`${VERIFY_BASE}/${config.serviceSid}/${endpoint}`, {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form).toString(),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, body };
}

/** Asks Twilio to text a code to the number. True when it accepted the request. */
export async function startPhoneVerification(
  config: VerifyConfig,
  phone: string,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  try {
    const { status, body } = await post(config, "Verifications", { To: phone, Channel: "sms" }, fetchImpl);
    if (status >= 200 && status < 300) return true;
    console.error("[TwilioVerify] Could not start a verification:", {
      status,
      errorCode: body.code,
      to: maskPhone(phone),
    });
    return false;
  } catch (err) {
    console.error("[TwilioVerify] Could not reach Twilio:", err instanceof Error ? err.name : "error");
    return false;
  }
}

/** True only when Twilio says the code is right and still valid. Never throws. */
export async function checkPhoneVerification(
  config: VerifyConfig,
  phone: string,
  code: string,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  try {
    const { status, body } = await post(config, "VerificationCheck", { To: phone, Code: code }, fetchImpl);
    if (status >= 200 && status < 300) return body.status === "approved";
    // 404: no verification waiting (expired, or already used) - same as a wrong code.
    if (status !== 404) {
      console.error("[TwilioVerify] Check failed:", { status, errorCode: body.code, to: maskPhone(phone) });
    }
    return false;
  } catch (err) {
    console.error("[TwilioVerify] Could not reach Twilio:", err instanceof Error ? err.name : "error");
    return false;
  }
}
