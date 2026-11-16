import type { Breadcrumb, ErrorEvent } from "@sentry/react-native";

// Scrubbing for error reports (CS-44, E4). Kept apart from the Sentry client so
// it can be tested without React Native.

const SENSITIVE_KEY_LIST = [
  "triageData",
  "medicalHistory",
  "allergies",
  "medications",
  "conditions",
  "notes",
  "clinicalNotes",
  "diagnosis",
  "treatmentPlan",
  "symptoms",
  "chiefComplaint",
  "email",
  "phone",
  "phoneNumber",
  "postcode",
  "postalCode",
  "address",
  "streetAddress",
  "dateOfBirth",
  "dob",
  "nhsNumber",
  "patientName",
  "firstName",
  "lastName",
  "fullName",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "cookies",
  "headers",
  "request",
  "response",
  "requestBody",
  "responseBody",
  "body",
  "payload",
  "url",
  "query",
  "params",
] as const;

const SENSITIVE_KEY_SET = new Set(SENSITIVE_KEY_LIST.map((k) => k.toLowerCase()));
const SENSITIVE_KEY_PATTERN = SENSITIVE_KEY_LIST.join("|");

const JSON_SENSITIVE_FIELD_RE = new RegExp(
  `("(${SENSITIVE_KEY_PATTERN})"\\s*:\\s*)(\\{[^}]*\\}|\\[[^\\]]*\\]|"(?:\\\\.|[^"\\\\])*"|[^,}\\]]+)`,
  "gi",
);

const KV_SENSITIVE_FIELD_RE = new RegExp(
  `\\b(${SENSITIVE_KEY_PATTERN})\\s*[:=]\\s*(?:"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|[^\\s,;}\\]]+)`,
  "gi",
);

const PATTERNS: [RegExp, string][] = [
  [/https?:\/\/[^\s"'`<>]+/gi, "[url]"],
  [/\?[a-zA-Z0-9_.-]+=[^\s"'`<>]*/g, "?[redacted]"],
  [JSON_SENSITIVE_FIELD_RE, '$1"[redacted]"'],
  [KV_SENSITIVE_FIELD_RE, "$1=[redacted]"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]"],
  [/\b(?:Bearer\s+)?eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[token]"],
  [/\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]+/g, "[key]"],
  [/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi, "[postcode]"],
  [/(?:\+44\s?|\b0)(?:\d\s?){9,10}\b/g, "[phone]"],
  [/\b\d{3}\s?\d{3}\s?\d{4}\b/g, "[number]"],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[id]"],
];

/** Replaces URLs, clinical/health fields, emails, tokens, keys, postcodes, phone or NHS-style numbers and record ids. */
export function scrubText(text: string): string {
  return PATTERNS.reduce((out, [pattern, label]) => out.replace(pattern, label), text);
}

/** Recursively scrubs strings and sensitive clinical/PII keys from arbitrary objects. */
export function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[redacted]";
  if (typeof value === "string") return scrubText(value);
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEY_SET.has(key.toLowerCase())) {
        out[key] = "[redacted]";
      } else {
        out[key] = scrubValue(val, depth + 1);
      }
    }
    return out;
  }
  return value;
}

const DROPPED_BREADCRUMB_CATEGORIES = new Set([
  "http",
  "xhr",
  "fetch",
  "network",
  "navigation",
  "console",
]);

/**
 * Scrubs or drops a Sentry breadcrumb so URLs, request/response bodies, and
 * clinical/health or personal data can never leave the device.
 */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  const category = breadcrumb.category?.toLowerCase() ?? "";
  const type = breadcrumb.type?.toLowerCase() ?? "";
  if (DROPPED_BREADCRUMB_CATEGORIES.has(category) || type === "http" || type === "navigation") {
    return null;
  }
  const scrubbed: Breadcrumb = { ...breadcrumb };
  if (scrubbed.message) scrubbed.message = scrubText(scrubbed.message);
  if (scrubbed.category) scrubbed.category = scrubText(scrubbed.category);
  if (scrubbed.data) {
    scrubbed.data = scrubValue(scrubbed.data) as Record<string, unknown>;
  }
  return scrubbed;
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.request;
  delete event.user;
  delete event.extra;
  delete event.breadcrumbs;
  if (event.contexts) {
    delete event.contexts.request;
    delete event.contexts.response;
    event.contexts = scrubValue(event.contexts) as ErrorEvent["contexts"];
  }
  if (event.tags) {
    const scrubbedTags: NonNullable<ErrorEvent["tags"]> = {};
    for (const [k, v] of Object.entries(event.tags)) {
      scrubbedTags[k] = typeof v === "string" ? scrubText(v) : v;
    }
    event.tags = scrubbedTags;
  }
  if (event.message) event.message = scrubText(event.message);
  if (event.logentry?.message) event.logentry.message = scrubText(event.logentry.message);
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = scrubText(exception.value);
    for (const frame of exception.stacktrace?.frames ?? []) delete frame.vars;
  }
  return event;
}

/**
 * A lost connection or a timed-out request is the network, not a bug, so it
 * isn't reported.
 */
export function isConnectivityError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "RequestTimeoutError" || error.name === "AbortError") return true;
  return error instanceof TypeError && /network request failed|failed to fetch|load failed/i.test(error.message);
}
