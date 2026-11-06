/**
 * Sign-up and verification messages: the screens match on the API's error
 * code, never its wording, and a dropped connection gets a plain message.
 */
import {
  AuthApiError,
  authErrorCode,
  friendlyAuthMessage,
  parseVerificationEmailStatus,
  readAuthError,
  secondsLeft,
} from "../features/auth/auth-errors";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

const response = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

async function main() {
  const registered = await readAuthError(
    response(409, { error: "This email is already registered.", code: "EMAIL_REGISTERED" }),
    "Registration failed"
  );
  assert(registered instanceof AuthApiError && registered.status === 409, "keeps the status");
  assert(authErrorCode(registered) === "EMAIL_REGISTERED", "keeps a known code");
  assert(registered.message === "This email is already registered.", "keeps the server's sentence");

  const unknown = await readAuthError(response(400, { error: "Nope", code: "SOMETHING_NEW" }), "x");
  assert(authErrorCode(unknown) === undefined, "ignores a code it doesn't know");

  const empty = await readAuthError(new Response("not json", { status: 500 }), "Could not resend");
  assert(empty.message === "Could not resend" && empty.status === 500, "falls back when the body isn't JSON");

  assert(authErrorCode(new Error("plain")) === undefined, "a plain error has no code");

  assert(
    /couldn't reach Pav Dental/.test(friendlyAuthMessage(new TypeError("Network request failed"), "fallback")),
    "a dropped connection gets a plain message"
  );
  assert(friendlyAuthMessage(registered, "fallback") === "This email is already registered.", "API errors show their own sentence");
  assert(friendlyAuthMessage("weird", "fallback") === "fallback", "anything else gets the fallback");

  assert(parseVerificationEmailStatus("sent") === "sent", "reads sent");
  assert(parseVerificationEmailStatus(["failed"]) === "failed", "reads failed from route params");
  assert(parseVerificationEmailStatus("") === undefined, "an empty param means unknown");
  assert(parseVerificationEmailStatus("ok") === undefined, "an unknown status means unknown");

  assert(secondsLeft(10_000, 4_500) === 6, "rounds the cooldown up");
  assert(secondsLeft(10_000, 10_000) === 0 && secondsLeft(10_000, 20_000) === 0, "never goes below zero");

  console.log("\n🎉 ALL AUTH ERROR TESTS PASSED!");
}

main();
