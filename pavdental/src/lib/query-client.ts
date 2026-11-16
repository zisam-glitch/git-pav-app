import { QueryClient } from "@tanstack/react-query";

export const MAX_QUERY_RETRIES = 2;
export const BASE_RETRY_DELAY_MS = 1000;
export const MAX_RETRY_DELAY_MS = 30_000;

/**
 * Exponential backoff with equal jitter so retries against a struggling
 * server spread out instead of firing in lockstep (D5).
 */
export function retryDelay(
  attemptIndex: number,
  random: () => number = Math.random,
): number {
  const attempt = Math.max(0, attemptIndex);
  const exponential = Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
  const half = exponential / 2;
  const jitter = Math.min(1, Math.max(0, random()));
  return Math.round(half + jitter * half);
}

function extractHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const record = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const candidate = record.status ?? record.statusCode ?? record.response?.status;
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : undefined;
}

/**
 * Retries transient query failures up to MAX_QUERY_RETRIES times,
 * skipping 4xx client errors that will not succeed on retry.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  const status = extractHttpStatus(error);
  if (status !== undefined && status >= 400 && status < 500) return false;
  return true;
}

/**
 * Shared React Query client instance.
 * Allows signOut() and session-expiry recovery to clear cache across the entire app.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds: coming back to a screen shows fresh data
      retry: shouldRetryQuery,
      retryDelay: (attemptIndex) => retryDelay(attemptIndex),
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    },
    mutations: {
      // Non-idempotent mutations must not blindly retry on failure.
      retry: false,
    },
  },
});
