import * as Sentry from "@sentry/react-native";
import { scrubEvent } from "./error-scrub";
import { setCaughtErrorReporter } from "./caught-errors";
import { setCallEventReporter, type CallEventName } from "./call-events";

// Crash and error reporting (CS-44, decisions log #18). Sentry is outside the
// clinical boundary, so an event carries the error type, a scrubbed message,
// the stack and the device/OS. No breadcrumbs (screen names and route params
// can identify a patient), screenshots, view hierarchy, replays, request data
// or user. Off unless EXPO_PUBLIC_SENTRY_DSN is set.

let enabled = false;

export function initErrorTracking(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn || enabled) return;
  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? "development" : "production"),
    sendDefaultPii: false,
    attachScreenshot: false,
    attachViewHierarchy: false,
    maxBreadcrumbs: 0,
    beforeBreadcrumb: () => null,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend: scrubEvent,
  });
  enabled = true;
  setCaughtErrorReporter(reportError);
  setCallEventReporter(reportCall);
}

/** Reports an unexpected error. A no-op without a DSN. */
export function reportError(error: unknown, source: string): void {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    scope.setTag("source", source);
    Sentry.captureException(error instanceof Error ? error : new Error(`Non-error thrown: ${typeof error}`));
  });
}

/**
 * Reports a call-quality event: joined, dropped, recovered, failed to join.
 * Only the name and coarse labels are sent, so the failed-join rate can be
 * alerted on in Sentry without any patient or appointment detail. A no-op
 * without a DSN.
 */
function reportCall(name: CallEventName, labels: Record<string, string>): void {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    scope.setTag("source", "video-call");
    for (const [key, value] of Object.entries(labels)) scope.setTag(key, value);
    Sentry.captureMessage(name, name === "call.join_failed" ? "warning" : "info");
  });
}
