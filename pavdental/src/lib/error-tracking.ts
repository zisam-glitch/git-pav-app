import * as Sentry from "@sentry/react-native";
import { scrubEvent } from "./error-scrub";
import { setCaughtErrorReporter } from "./caught-errors";

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
}

/** Reports an unexpected error. A no-op without a DSN. */
export function reportError(error: unknown, source: string): void {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    scope.setTag("source", source);
    Sentry.captureException(error instanceof Error ? error : new Error(`Non-error thrown: ${typeof error}`));
  });
}
