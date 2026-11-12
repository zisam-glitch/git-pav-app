/**
 * One Idempotency-Key per attempt at something that must happen once (cancel a booking and refund it).
 * The same key is sent on every retry until the attempt succeeds, so if a reply is lost the server answers the
 * retry with the first result instead of doing it twice (checklist D3). The key lives in memory only.
 */
const pending = new Map<string, string>();

export function attemptKey(scope: string): string {
  let key = pending.get(scope);
  if (!key) {
    key = `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    pending.set(scope, key);
  }
  return key;
}

/** The attempt worked: the next one is a new attempt with a new key. */
export function finishAttempt(scope: string): void {
  pending.delete(scope);
}
