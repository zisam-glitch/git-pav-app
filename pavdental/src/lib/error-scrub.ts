import type { ErrorEvent } from "@sentry/react-native";

// Scrubbing for error reports (CS-44). Kept apart from the Sentry client so
// it can be tested without React Native.

const PATTERNS: [RegExp, string][] = [
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]"],
  [/\b(?:Bearer\s+)?eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[token]"],
  [/\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]+/g, "[key]"],
  [/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi, "[postcode]"],
  [/(?:\+44\s?|\b0)(?:\d\s?){9,10}\b/g, "[phone]"],
  [/\b\d{3}\s?\d{3}\s?\d{4}\b/g, "[number]"],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[id]"],
];

/** Replaces emails, tokens, keys, postcodes, phone or NHS-style numbers and record ids. */
export function scrubText(text: string): string {
  return PATTERNS.reduce((out, [pattern, label]) => out.replace(pattern, label), text);
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.request;
  delete event.user;
  delete event.extra;
  delete event.breadcrumbs;
  if (event.message) event.message = scrubText(event.message);
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
