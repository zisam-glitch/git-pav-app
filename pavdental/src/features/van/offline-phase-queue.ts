import type { KeyValueStore } from "./offline-notes-queue";
import type { VanStopPhase } from "./van-types";

export type QueueablePhase = VanStopPhase | "no_show";

export interface QueuedPhaseChange {
  stopId: string;
  phase: QueueablePhase;
  queuedAt: string;
  userId: string;
}

export const PHASE_QUEUE_KEY = "pav_offline_van_phases_queue";

export async function readPhaseQueue(store: KeyValueStore): Promise<QueuedPhaseChange[]> {
  try {
    const raw = await store.get(PHASE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writePhaseQueue(store: KeyValueStore, queue: QueuedPhaseChange[]): Promise<void> {
  if (queue.length === 0) {
    await store.remove(PHASE_QUEUE_KEY);
    return;
  }
  await store.set(PHASE_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Appends a phase change in FIFO order, skipping an exact duplicate of the
 * latest entry for the same stop.
 */
export async function enqueuePhaseChange(store: KeyValueStore, item: QueuedPhaseChange): Promise<number> {
  const queue = await readPhaseQueue(store);
  const lastForStop = [...queue].reverse().find((q) => q.stopId === item.stopId && q.userId === item.userId);
  if (lastForStop?.phase === item.phase) return queue.length;
  queue.push(item);
  await writePhaseQueue(store, queue);
  return queue.length;
}

export type PhaseSendResult = "sent" | "drop" | "retry";

/**
 * Flushes queued phase changes for the current operator in strict FIFO order.
 * Stops advancing for a stop on "retry" so later steps never overtake earlier ones.
 */
export async function flushPhaseQueue(
  store: KeyValueStore,
  userId: string,
  send: (item: QueuedPhaseChange) => Promise<PhaseSendResult>,
): Promise<number> {
  const queue = await readPhaseQueue(store);
  if (queue.length === 0) return 0;

  const remaining: QueuedPhaseChange[] = [];
  const blockedStops = new Set<string>();

  for (const item of queue) {
    if (item.userId && item.userId !== userId) {
      remaining.push(item);
      continue;
    }
    if (blockedStops.has(item.stopId)) {
      remaining.push(item);
      continue;
    }
    let result: PhaseSendResult = "retry";
    try {
      result = await send(item);
    } catch {
      result = "retry";
    }
    if (result === "retry") {
      blockedStops.add(item.stopId);
      remaining.push(item);
    }
  }

  if (remaining.length !== queue.length) {
    await writePhaseQueue(store, remaining);
  }
  return remaining.filter((i) => !i.userId || i.userId === userId).length;
}

/** True when an error looks like a transient connectivity failure worth queueing offline. */
export function isOfflinePhaseError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err && typeof err === "object" && "status" in err && typeof (err as { status?: unknown }).status === "number") {
    return (err as { status: number }).status >= 500;
  }
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /network|offline|timed out|failed to fetch|connection/i.test(msg);
}
