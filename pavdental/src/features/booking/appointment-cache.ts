/**
 * Looks for one appointment in the lists already in the query cache, so a
 * screen opened from the Bookings list can show it at once while the single
 * appointment is fetched. Returns the row and when that list was fetched.
 */
export function findInCachedLists(
  entries: Array<[unknown, unknown]>,
  updatedAt: (queryKey: unknown) => number | undefined,
  id: string | undefined
): { row: Record<string, unknown>; updatedAt: number | undefined } | undefined {
  if (!id) return undefined;
  for (const [key, data] of entries) {
    if (!Array.isArray(data)) continue;
    const row = data.find((r) => r && typeof r === "object" && (r as { id?: unknown }).id === id);
    if (row) return { row: row as Record<string, unknown>, updatedAt: updatedAt(key) };
  }
  return undefined;
}
