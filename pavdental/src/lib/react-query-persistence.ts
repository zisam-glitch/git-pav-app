import * as SecureStore from 'expo-secure-store';
import { reportCaughtError } from "@/lib/caught-errors";

/**
 * React Query Persistence Configuration
 * 
 * Provides utilities for safe React Query cache persistence using encrypted storage.
 * Only persists safe data (not clinical/health data) and implements cache TTL.
 * 
 * Note: Due to dependency conflicts with React 19 in Expo SDK 57, this module
 * provides the persistence utilities but does not integrate them with the
 * QueryClientProvider. When dependencies are resolved, integrate with
 * @tanstack/react-query-persist-client.
 * 
 * Usage:
 * - Use shouldPersistQuery() to check if a query key should be persisted
 * - Use getCacheTTL() to get appropriate cache time for a query
 * - Use clearPersistedCache() to clear all persisted data on logout
 */

const PERSIST_KEY = 'pavdental-query-cache';

/**
 * Data that is safe to persist (non-clinical, non-sensitive)
 */
const SAFE_TO_PERSIST: Set<string> = new Set([
  'serviceCatalog',
  'clinicianList',
  'clinicList',
  'userProfile',
  'preferences',
]);

/**
 * Data that should NOT be persisted (clinical/health data)
 */
const NEVER_PERSIST: Set<string> = new Set([
  'appointments',
  'medicalHistory',
  'clinicalRecords',
  'odontogram',
  'treatmentPlans',
  'prescriptions',
  'triageData',
  'patientDocuments',
  'healthData',
]);

/**
 * Cache TTL for different data types (in milliseconds)
 */
const CACHE_TTL: Record<string, number> = {
  serviceCatalog: 24 * 60 * 60 * 1000, // 24 hours
  clinicianList: 60 * 60 * 1000, // 1 hour
  clinicList: 24 * 60 * 60 * 1000, // 24 hours
  userProfile: 30 * 60 * 1000, // 30 minutes
  preferences: 7 * 24 * 60 * 60 * 1000, // 7 days
  default: 5 * 60 * 1000, // 5 minutes
};

/**
 * Determine if a query should be persisted
 */
export function shouldPersistQuery(queryKey: unknown[]): boolean {
  if (!Array.isArray(queryKey) || queryKey.length === 0) {
    return false;
  }

  const key = queryKey[0] as string;

  // Never persist clinical/health data
  if (NEVER_PERSIST.has(key)) {
    return false;
  }

  // Only persist explicitly whitelisted data
  return SAFE_TO_PERSIST.has(key);
}

/**
 * Get cache TTL for a query
 */
export function getCacheTTL(queryKey: unknown[]): number {
  if (!Array.isArray(queryKey) || queryKey.length === 0) {
    return CACHE_TTL.default;
  }

  const key = queryKey[0] as string;
  return CACHE_TTL[key] || CACHE_TTL.default;
}

/**
 * Clear all persisted cache
 */
export async function clearPersistedCache(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PERSIST_KEY);
  } catch (error) {
    reportCaughtError(error, "persist failed to clear cache");
  }
}

/**
 * Query de-duplication options to prevent unnecessary refetches
 */
export const queryDeduplicationOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes default
  gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
};

/**
 * Mutation cache configuration
 */
export const mutationCacheOptions = {
  gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
};
