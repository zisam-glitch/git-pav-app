// E4: Prove health data and PII are scrubbed from Sentry breadcrumbs, events,
// and caught-error console logs. Synthetic data only.
import { readFileSync } from "fs";
import { join } from "path";
import { scrubBreadcrumb, scrubEvent, scrubText } from "../lib/error-scrub";
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

console.log("\n🛡️  HEALTH DATA BREADCRUMB & LOG SCRUBBING (E4)\n");

const SENSITIVE_TERMS = [
  "severe molar pain",
  "asthma and hypertension",
  "penicillin anaphylaxis",
  "amoxicillin 500mg",
  "type 2 diabetes",
  "patient anxious about needles",
  "irreversible pulpitis",
  "root canal therapy",
  "jane.patient@example.test",
  "07700 900123",
  "SW1A 1AA",
  "42 Acacia Avenue",
  "https://api.pavdental.test",
];

function assertNoSensitiveTerms(serialized: string, label: string) {
  for (const term of SENSITIVE_TERMS) {
    assert(!serialized.toLowerCase().includes(term.toLowerCase()), `${label}: omits "${term}"`);
  }
}

// 1. scrubText on realistic JSON error payload with clinical/health fields & URL
const rawPayloadError = JSON.stringify({
  url: "https://api.pavdental.test/v1/triage?email=jane.patient@example.test",
  triageData: { pain: "severe molar pain" },
  medicalHistory: "asthma and hypertension",
  allergies: ["penicillin anaphylaxis"],
  medications: ["amoxicillin 500mg"],
  conditions: ["type 2 diabetes"],
  notes: "patient anxious about needles",
  diagnosis: "irreversible pulpitis",
  treatmentPlan: "root canal therapy",
  email: "jane.patient@example.test",
  phone: "07700 900123",
  postcode: "SW1A 1AA",
  address: "42 Acacia Avenue",
});

const scrubbedPayload = scrubText(rawPayloadError);
assertNoSensitiveTerms(scrubbedPayload, "scrubText(JSON payload)");

// 2. scrubText on relative URL with query string and key=value clinical text
const rawKv =
  "GET /api/patients/3f2b8c1e-1d2a-4c3b-9e8f-0123456789ab?medicalHistory=asthma+and+hypertension " +
  "failed: allergies=penicillin anaphylaxis diagnosis=irreversible pulpitis";
const scrubbedKv = scrubText(rawKv);
assert(!scrubbedKv.includes("asthma+and+hypertension"), "scrubText strips query string health data");
assert(!scrubbedKv.includes("penicillin"), "scrubText strips key=value allergies");
assert(!scrubbedKv.includes("3f2b8c1e-1d2a-4c3b-9e8f-0123456789ab"), "scrubText strips UUIDs");

// 3. scrubBreadcrumb drops network/navigation/console breadcrumbs and scrubs custom data
assert(
  scrubBreadcrumb({
    category: "http",
    type: "http",
    data: { url: "https://api.pavdental.test/triage", responseBody: rawPayloadError },
  }) === null,
  "HTTP breadcrumbs are dropped completely",
);
assert(
  scrubBreadcrumb({
    category: "navigation",
    type: "navigation",
    data: { from: "/triage", to: "/records/3f2b8c1e-1d2a-4c3b-9e8f-0123456789ab" },
  }) === null,
  "Navigation breadcrumbs are dropped completely",
);
assert(
  scrubBreadcrumb({
    category: "console",
    message: "Failed with allergies=penicillin",
  }) === null,
  "Console breadcrumbs are dropped completely",
);

const customBreadcrumb = scrubBreadcrumb({
  category: "app.action",
  message: "Triage submit failed at https://api.pavdental.test/v1/triage",
  data: {
    triageData: { pain: "severe molar pain" },
    medicalHistory: "asthma and hypertension",
    allergies: ["penicillin anaphylaxis"],
    medications: ["amoxicillin 500mg"],
    conditions: ["type 2 diabetes"],
    notes: "patient anxious about needles",
    diagnosis: "irreversible pulpitis",
    treatmentPlan: "root canal therapy",
    email: "jane.patient@example.test",
    phone: "07700 900123",
    postcode: "SW1A 1AA",
    address: "42 Acacia Avenue",
    requestBody: rawPayloadError,
    responseBody: rawPayloadError,
  },
});
assert(customBreadcrumb !== null, "Non-network custom breadcrumb is retained in scrubbed form");
assertNoSensitiveTerms(JSON.stringify(customBreadcrumb), "scrubBreadcrumb(custom)");

// 4. scrubEvent scrubs contexts, tags, message, exception, and drops request/user/extra/breadcrumbs
const scrubbedEvent = scrubEvent({
  type: undefined,
  message: `Save failed: ${rawPayloadError}`,
  request: { url: "https://api.pavdental.test/v1/triage", data: rawPayloadError },
  user: { id: "usr_1", email: "jane.patient@example.test" },
  extra: { medicalHistory: "asthma and hypertension" },
  breadcrumbs: [{ category: "http", message: "https://api.pavdental.test/v1/triage" }],
  tags: {
    source: "triage at https://api.pavdental.test/v1/triage",
    detail: "email: jane.patient@example.test",
  },
  contexts: {
    response: { body: rawPayloadError },
    clinical: {
      triageData: { pain: "severe molar pain" },
      diagnosis: "irreversible pulpitis",
      treatmentPlan: "root canal therapy",
    },
  },
  exception: {
    values: [
      {
        type: "Error",
        value: `Request to https://api.pavdental.test/v1/triage failed: ${rawPayloadError}`,
        stacktrace: { frames: [{ function: "submitTriage", vars: { notes: "patient anxious about needles" } }] },
      },
    ],
  },
});

assert(
  !scrubbedEvent.request && !scrubbedEvent.user && !scrubbedEvent.extra && !scrubbedEvent.breadcrumbs,
  "scrubEvent drops request, user, extra and breadcrumbs",
);
assert(scrubbedEvent.contexts?.response === undefined, "scrubEvent drops contexts.response");
assertNoSensitiveTerms(JSON.stringify(scrubbedEvent), "scrubEvent");

// 5. reportCaughtError scrubs console.warn in __DEV__ and source passed to reporter
const originalWarn = console.warn;
const originalDev = (globalThis as Record<string, unknown>).__DEV__;
const warnArgs: unknown[][] = [];
const reportedSources: string[] = [];

console.warn = (...args: unknown[]) => {
  warnArgs.push(args);
};
(globalThis as Record<string, unknown>).__DEV__ = true;
setCaughtErrorReporter((_err, source) => reportedSources.push(source));

try {
  reportCaughtError(
    new Error(`Submit failed at https://api.pavdental.test/triage: ${rawPayloadError}`),
    "triage https://api.pavdental.test/triage jane.patient@example.test",
  );
} finally {
  console.warn = originalWarn;
  (globalThis as Record<string, unknown>).__DEV__ = originalDev;
  setCaughtErrorReporter(null);
}

assert(warnArgs.length === 1, "reportCaughtError logs once in __DEV__");
assertNoSensitiveTerms(JSON.stringify(warnArgs[0]), "reportCaughtError console.warn");
assertNoSensitiveTerms(reportedSources.join(" "), "reportCaughtError reporter source");

// 6. error-tracking.ts disables breadcrumbs and PII at Sentry.init
const errorTrackingSource = readFileSync(join(__dirname, "../lib/error-tracking.ts"), "utf8");
assert(errorTrackingSource.includes("maxBreadcrumbs: 0"), "Sentry.init sets maxBreadcrumbs: 0");
assert(errorTrackingSource.includes("beforeBreadcrumb: () => null"), "Sentry.init sets beforeBreadcrumb: () => null");
assert(errorTrackingSource.includes("sendDefaultPii: false"), "Sentry.init sets sendDefaultPii: false");
assert(errorTrackingSource.includes("beforeSend: scrubEvent"), "Sentry.init sets beforeSend: scrubEvent");

if (failures > 0) {
  console.error(`\n${failures} E4 health-data breadcrumb check(s) failed`);
  process.exit(1);
}
console.log("\n🎉 ALL HEALTH DATA BREADCRUMB & LOG SCRUBBING TESTS PASSED (E4)!\n");
