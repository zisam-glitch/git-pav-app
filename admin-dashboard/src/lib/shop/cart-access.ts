import type { QueryFn } from "@/lib/db/client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The browser's session id is a guest cart's only key, so every item change must present it. */
export async function cartItemBelongsToSession(query: QueryFn, itemId: unknown, sessionId: unknown): Promise<boolean> {
  if (typeof itemId !== "string" || !UUID.test(itemId) || typeof sessionId !== "string" || !sessionId) return false;
  const rows = await query(
    `SELECT 1 FROM cart_items ci
     JOIN carts c ON c.id = ci.cart_id
     WHERE ci.id = $1 AND c.session_id = $2`,
    [itemId, sessionId],
  );
  return rows.length > 0;
}
