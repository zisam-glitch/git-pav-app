/** Stripe says the object does not exist (already detached or deleted). */
export function isStripeMissingResource(err: unknown): boolean {
  const e = err as { code?: string; statusCode?: number } | null;
  return e?.code === "resource_missing" || e?.statusCode === 404;
}
