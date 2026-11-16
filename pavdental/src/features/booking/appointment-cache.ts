import { flattenPages } from "@/lib/paging";

/**
 * Looks for one appointment in the lists already in the query cache, so a
 * screen opened from the Bookings list can show it at once while the single
 * appointment is fetched. Returns the row and when that list was fetched.
 */
export function findInCachedLists<T = Record<string, unknown>>(
  entries: Array<[unknown, unknown]>,
  updatedAt: (queryKey: unknown) => number | undefined,
  id: string | undefined
): { row: T; updatedAt: number | undefined } | undefined {
  if (!id) return undefined;
  for (const [key, data] of entries) {
    const rows = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "pages" in data && Array.isArray((data as { pages?: unknown }).pages)
      ? flattenPages((data as { pages: unknown[] }).pages)
      : null;
    if (!rows) continue;
    const row = rows.find((r) => r && typeof r === "object" && (r as { id?: unknown }).id === id);
    if (row) return { row: row as T, updatedAt: updatedAt(key) };
  }
  return undefined;
}
