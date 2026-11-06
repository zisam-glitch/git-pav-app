/**
 * Picks the backend URL. Kept free of React Native imports so tests can run it.
 *
 * Development builds fall back to a local backend. Any other build (preview,
 * production, TestFlight) must be given a URL, and it must not point at the
 * phone itself: a build that quietly talks to localhost looks like "the server
 * is down" to testers and hides the real mistake.
 */
export function resolveApiUrl(env: { url?: string; appEnv?: string }, isDev: boolean): string {
  const url = env.url?.trim().replace(/\/+$/, "");
  if (isDev) return url || "http://localhost:3000";

  if (!url) {
    throw new Error("EXPO_PUBLIC_API_URL is not set for this build. Set it in the EAS build profile.");
  }
  if (/^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:|\/|$)/i.test(url)) {
    throw new Error(`EXPO_PUBLIC_API_URL points at ${url}, which a release build on a phone cannot reach.`);
  }
  if (!/^https:\/\//i.test(url)) {
    throw new Error("EXPO_PUBLIC_API_URL must be an https address in a release build.");
  }
  return url;
}
