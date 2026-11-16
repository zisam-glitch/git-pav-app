// MF-05: visit notes a van clinician saves while offline. Kept free of
// Expo/React Native so it can be tested on its own; offline-notes.ts wires
// it to SecureStore, the network and the app lifecycle.
//
// The queue is clinical data, so it stays in SecureStore (the Keychain or
// Keystore). SecureStore values over about 2 KB can be rejected on iOS, so the
// queue is split across several entries.

import { reportCaughtError } from "../../lib/caught-errors";

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface QueuedVanNote {
  stopId: string;
  notes: string;
  queuedAt: string;
  /** Only this operator's session sends it. */
  userId: string;
}

export const QUEUE_KEY = "pav_offline_van_notes_queue";
/** Characters per stored piece; well under SecureStore's 2,048-byte limit even for multi-byte text. */
export const CHUNK_CHARS = 500;

const chunkKey = (i: number) => `${QUEUE_KEY}_${i}`;

export async function readQueue(store: KeyValueStore): Promise<QueuedVanNote[]> {
  try {
    const count = Number(await store.get(`${QUEUE_KEY}_count`));
    let raw: string | null;
    if (Number.isInteger(count) && count > 0) {
      const parts = await Promise.all(Array.from({ length: count }, (_, i) => store.get(chunkKey(i))));
      if (parts.some((p) => p === null)) return [];
      raw = parts.join("");
    } else {
      // Queues written before MF-05 are a single value.
      raw = await store.get(QUEUE_KEY);
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    reportCaughtError(err, "offline-notes-queue readQueue");
    return [];
  }
}

export async function writeQueue(store: KeyValueStore, queue: QueuedVanNote[]): Promise<void> {
  const serialized = queue.length ? JSON.stringify(queue) : "";
  const previous = Number(await store.get(`${QUEUE_KEY}_count`)) || 0;
  const count = Math.ceil(serialized.length / CHUNK_CHARS);
  for (let i = 0; i < count; i++) {
    await store.set(chunkKey(i), serialized.slice(i * CHUNK_CHARS, (i + 1) * CHUNK_CHARS));
  }
  await store.set(`${QUEUE_KEY}_count`, String(count));
  for (let i = count; i < previous; i++) await store.remove(chunkKey(i));
  await store.remove(QUEUE_KEY);
}

/** Adds or replaces the note for a stop. */
export async function enqueueNote(store: KeyValueStore, note: QueuedVanNote): Promise<number> {
  const queue = (await readQueue(store)).filter((n) => n.stopId !== note.stopId);
  queue.push(note);
  await writeQueue(store, queue);
  return queue.length;
}

export type SendResult = "sent" | "retry";

/**
 * Sends the current operator's queued notes. Anything not sent stays queued;
 * notes from another operator's session are kept for them. Returns how many
 * are still waiting for this operator.
 */
export async function flushQueue(
  store: KeyValueStore,
  userId: string,
  send: (note: QueuedVanNote) => Promise<SendResult>,
): Promise<number> {
  const queue = await readQueue(store);
  if (queue.length === 0) return 0;
  const remaining: QueuedVanNote[] = [];
  for (const note of queue) {
    if (note.userId && note.userId !== userId) {
      remaining.push(note);
      continue;
    }
    let result: SendResult = "retry";
    try {
      result = await send(note);
    } catch (err) {
      // Network failure: keep it.
      reportCaughtError(err, "offline-notes-queue flushQueue");
    }
    if (result !== "sent") remaining.push(note);
  }
  if (remaining.length !== queue.length) await writeQueue(store, remaining);
  return remaining.filter((n) => !n.userId || n.userId === userId).length;
}
