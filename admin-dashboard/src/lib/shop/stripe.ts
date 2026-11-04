import Stripe from "stripe";

let client: Stripe | undefined;

/**
 * The Stripe client, or null when no key is set. Callers refuse the request
 * instead of running against a placeholder key. Created on first use because
 * `next build` imports routes without the runtime environment.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  return client;
}
