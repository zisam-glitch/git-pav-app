/**
 * Requests give up after a time limit (B7).
 *
 * Without one, a request on a weak signal could hang with a spinner for
 * minutes. A timed-out request says so in plain words and never signs the
 * patient out.
 */

import { authFetch, configureRequestTimeouts, publicFetch, TIMEOUT_MESSAGE, timedFetch } from "../features/auth/auth-api";
import { useAuthStore } from "../features/auth/auth-store";
import { tokenStore } from "../lib/token-store";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

// A server that never answers, but lets the request be cancelled.
function hangingFetch(calls: string[]) {
  return (url: string, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      calls.push(String(url));
      init?.signal?.addEventListener("abort", () => reject(new Error("Aborted")));
    });
}

async function messageOf(promise: Promise<unknown>, giveUpMs = 1000) {
  const watchdog = new Promise<string>((resolve) => setTimeout(() => resolve("STILL HANGING"), giveUpMs));
  return Promise.race([
    promise.then(() => "resolved", (err) => (err instanceof Error ? err.message : String(err))),
    watchdog,
  ]);
}

async function run() {
  console.log("\n⏱  RUNNING REQUEST TIMEOUT TESTS (B7)...\n");
  const originalFetch = global.fetch;
  const calls: string[] = [];
  globalThis.fetch = hangingFetch(calls) as typeof globalThis.fetch;
  configureRequestTimeouts({ requestMs: 40, uploadMs: 120 });

  assert((await messageOf(timedFetch("https://api.example.test/x"))) === TIMEOUT_MESSAGE, "A hung request gives up with a clear message");
  assert((await messageOf(publicFetch("/api/services"))) === TIMEOUT_MESSAGE, "Public requests have the time limit");

  useAuthStore.getState().setAuth("live-token", {
    id: "usr_1",
    sub: "usr_1",
    email: "patient@example.test",
    role: "patient",
    emailVerified: true,
    phoneVerified: true,
    isMfaEnabled: false,
    mfaEnabled: false,
  });
  await tokenStore.setRefreshToken("kept-refresh-token");
  assert((await messageOf(authFetch("/api/booking/appointments"))) === TIMEOUT_MESSAGE, "Signed-in requests have the time limit");
  assert(useAuthStore.getState().user !== null, "A timed-out request doesn't sign the patient out");
  assert((await tokenStore.getRefreshToken()) === "kept-refresh-token", "A timed-out request keeps the refresh token");

  const started = Date.now();
  const form = new FormData();
  form.append("note", "x");
  const uploadMessage = await messageOf(timedFetch("https://api.example.test/upload", { method: "POST", body: form }));
  assert(uploadMessage === TIMEOUT_MESSAGE && Date.now() - started >= 100, "Uploads get the longer limit");

  // A caller cancelling still cancels, and isn't reported as a timeout.
  const caller = new AbortController();
  const cancelled = messageOf(timedFetch("https://api.example.test/y", { signal: caller.signal }, 500));
  caller.abort();
  assert((await cancelled) !== TIMEOUT_MESSAGE && (await cancelled) !== "STILL HANGING", "A caller's own cancel still works");

  // A quick answer is passed straight through.
  globalThis.fetch = (async () => new Response(JSON.stringify({ ok: true }), { status: 200 })) as typeof globalThis.fetch;
  const res = await timedFetch("https://api.example.test/z");
  assert(res.status === 200, "A quick answer comes back unchanged");

  global.fetch = originalFetch;
  console.log("\n🎉 ALL REQUEST TIMEOUT TESTS PASSED!\n");
}

run().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
