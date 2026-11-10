import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client instance.
 * Allows signOut() and session-expiry recovery to clear cache across the entire app.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds: coming back to a screen shows fresh data
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    },
  },
});
