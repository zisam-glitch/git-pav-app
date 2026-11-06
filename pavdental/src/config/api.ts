/**
 * Centralized API configuration.
 * Single source of truth for the backend API base URL across the mobile app.
 */
import { resolveApiUrl } from "./api-url";

declare const __DEV__: boolean | undefined;

export const API_URL = resolveApiUrl(
  { url: process.env.EXPO_PUBLIC_API_URL, appEnv: process.env.EXPO_PUBLIC_APP_ENV },
  // Outside React Native (tests, scripts) __DEV__ is undefined: treat as development.
  typeof __DEV__ === "undefined" ? true : Boolean(__DEV__),
);

/** Full URL for an API path, for links opened outside the app (e.g. a PDF). */
export const apiUrl = (path: string) => `${API_URL}${path}`;
