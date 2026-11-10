/**
 * Titled groups as one flat array of rows (a heading, then its items), so a
 * list of groups can be given to a virtualised list: only the rows on screen
 * are drawn. Groups with no items are left out.
 */
export type GroupedRow<T> =
  | { kind: "heading"; key: string; title: string }
  | { kind: "item"; key: string; item: T };

export function buildGroupedRows<T extends { id: string }>(
  groups: Array<{ key: string; title: string; items: T[] }>
): GroupedRow<T>[] {
  const rows: GroupedRow<T>[] = [];
  for (const group of groups) {
    if (group.items.length === 0) continue;
    rows.push({ kind: "heading", key: `heading-${group.key}`, title: group.title });
    for (const item of group.items) rows.push({ kind: "item", key: `${group.key}-${item.id}`, item });
  }
  return rows;
}
