// Runs with tsx (see package.json test:errors). CS-44: what the app sends to
// Sentry is scrubbed of contact details, tokens and record ids, and never
// carries breadcrumbs, request data or the user. Synthetic data only.
import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { isConnectivityError, scrubEvent, scrubText } from "../lib/error-scrub";
import { reportCaughtError, setCaughtErrorReporter } from "../lib/caught-errors";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    failures++;
    console.error(`❌ FAILED: ${message}`);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🧹 ERROR REPORT SCRUBBING\n");

assert(
  scrubText("jane@example.test ZZ1 1ZZ 07700 900123 eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc 3f2b8c1e-1d2a-4c3b-9e8f-0123456789ab") ===
    "[email] [postcode] [phone] [token] [id]",
  "Emails, postcodes, phone numbers, tokens and record ids are replaced"
);

const event = scrubEvent({
  type: undefined,
  message: "Failed for jane@example.test",
  request: { url: "https://api.example.test/patients/1", data: { notes: "Synthetic note" } },
  user: { id: "u1", email: "jane@example.test" },
  extra: { form: { name: "Jane" } },
  breadcrumbs: [{ message: "/records/prescriptions/abc" }],
  exception: { values: [{ type: "Error", value: "No record for 07700 900123", stacktrace: { frames: [{ function: "f", vars: { name: "Jane" } }] } }] },
});
assert(!event.request && !event.user && !event.extra && !event.breadcrumbs, "Request, user, extra and breadcrumbs are dropped");
assert(event.message === "Failed for [email]", "The message is scrubbed");
assert(event.exception?.values?.[0].value === "No record for [phone]", "The exception value is scrubbed");
assert(event.exception?.values?.[0].stacktrace?.frames?.[0].vars === undefined, "Stack frame variables are dropped");

// B15: caught errors go to Sentry, scrubbed; only the network is left out.
assert(isConnectivityError(new TypeError("Network request failed")), "A dropped connection isn't reported");
const timeout = new Error("This is taking too long.");
timeout.name = "RequestTimeoutError";
assert(isConnectivityError(timeout), "A timed-out request isn't reported");
assert(!isConnectivityError(new Error("Could not load the appointment")), "A real failure is reported");
assert(!isConnectivityError("a string"), "A thrown non-error is reported");

const reported: string[] = [];
setCaughtErrorReporter((_error, source) => reported.push(source));
reportCaughtError(new Error("Could not load the appointment"), "video summary");
reportCaughtError(new TypeError("Network request failed"), "video summary");
assert(reported.join(",") === "video summary", "A caught failure reaches the reporter, a dropped connection doesn't");
setCaughtErrorReporter(null);
reportCaughtError(new Error("x"), "before start-up");
assert(reported.length === 1, "Before error tracking starts, nothing is sent");

// No screen hands a raw error to the console, where it is lost in a build and
// can carry a server response with patient details. confirmed.tsx is handled
// by the B4/B5 change, which removes its last console.error.
const root = join(__dirname, "..");
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (name === "__tests__") return [];
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(name) ? [p] : [];
  });
for (const file of ["app", "features", "components", "lib"].flatMap((d) => files(join(root, d)))) {
  const rel = relative(root, file);
  if (rel.endsWith(join("booking", "confirmed.tsx"))) continue;
  const raw = readFileSync(file, "utf8").match(/console\.error\([^)]*,\s*(err|error|e)\s*\)/g) ?? [];
  assert(raw.length === 0, `${rel} reports caught errors instead of logging them raw`);
}

if (failures > 0) {
  console.error(`\n${failures} scrubbing check(s) failed`);
  process.exit(1);
}
