import { objectStorage } from "./object-storage";

/** At most this many photos on one message. */
export const MAX_MESSAGE_PHOTOS = 4;

/** Every photo of a conversation lives under its own prefix, so a key from another conversation is never accepted. */
export function photoKeyPrefix(threadId: string): string {
  return `messages/${threadId}/`;
}

/** The keys that belong to this conversation, at most four, with no repeats. */
export function keysForThread(threadId: string, keys: unknown): string[] {
  if (!Array.isArray(keys)) return [];
  const prefix = photoKeyPrefix(threadId);
  const ok = keys.filter(
    (k): k is string => typeof k === "string" && k.startsWith(prefix) && !k.includes("..") && k.length < 200
  );
  return Array.from(new Set(ok)).slice(0, MAX_MESSAGE_PHOTOS);
}

/** Fresh short-lived links for a message's photos. */
export async function signedAttachments(keys: string[] | null | undefined): Promise<{ url: string; expiresAt: string }[]> {
  if (!keys || keys.length === 0) return [];
  return Promise.all(
    keys.map(async (key) => {
      const signed = await objectStorage.getSignedUrl(key, 900);
      return { url: signed.url, expiresAt: signed.expiresAt.toISOString() };
    })
  );
}
