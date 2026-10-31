/**
 * True when a provider credential is missing or still the template value from
 * `.env.example` (for example `sk_test_replace_with_stripe_secret_key`,
 * `pm_server_token_replace_me`, `replace_with_daily_api_key`).
 *
 * Services use this at runtime to fall back to their local, no-network mode
 * instead of calling the provider with a junk key. Deployed environments never
 * reach that fallback: `validateDeployedConfig` (config/env.ts) rejects these
 * values in staging and production.
 *
 * Kept free of imports and side effects so any module can use it.
 */
export function isPlaceholderCredential(value: string | undefined | null): boolean {
  if (!value || !value.trim()) return true;
  return /replace_?with|replace_?me|placeholder/i.test(value);
}
