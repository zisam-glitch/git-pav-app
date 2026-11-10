/**
 * Paging for lists the server returns a page at a time with `limit` and
 * `offset`. A page shorter than the page size is the last one, so there is no
 * need for the server to count the rows.
 */

/** The offset to ask for next, or undefined when the last page was the end. */
export function nextOffset(lastPage: unknown, loadedSoFar: number, pageSize: number): number | undefined {
  if (!Array.isArray(lastPage) || lastPage.length < pageSize) return undefined;
  return loadedSoFar;
}

/** Every loaded page as one list. Safe if a page came back as something else. */
export function flattenPages<T>(pages: readonly unknown[] | undefined): T[] {
  if (!pages) return [];
  return pages.flatMap((p) => (Array.isArray(p) ? (p as T[]) : []));
}

/** Adds each item only once (a new row at the top shifts later pages by one). */
export function uniqueById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}
