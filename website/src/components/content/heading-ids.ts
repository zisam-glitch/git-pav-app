import type { ContentBlock } from "./content-blocks";

/** "What Is Minoxidil?" becomes "what-is-minoxidil", the way Hims names its section anchors. */
export function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** One anchor id per heading block (undefined for other blocks), unique within the page. */
export function headingIds(blocks: ContentBlock[]): Array<string | undefined> {
  const seen = new Map<string, number>();
  return blocks.map((block) => {
    if (block.kind !== "heading") return undefined;
    const base = slugifyHeading(block.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

/** The main section headings of an article, for its table of contents. */
export function tocEntries(blocks: ContentBlock[]): Array<{ id: string; text: string }> {
  const ids = headingIds(blocks);
  const entries: Array<{ id: string; text: string }> = [];
  blocks.forEach((block, index) => {
    const id = ids[index];
    if (block.kind === "heading" && block.level !== 3 && id) entries.push({ id, text: block.text });
  });
  return entries;
}
