import type { ReactNode } from "react";

/**
 * One piece of a page's text in reading order, as captured from the live site
 * (scripts/seo-snapshot.mjs --content-dir) and ported word for word.
 */
export type ContentBlock =
  | { kind: "heading"; text: string; level?: 2 | 3 }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "link"; text: string; href: string }
  | { kind: "documents"; items: Array<{ text: string; href: string }> }
  | { kind: "cards"; items: Array<{ title: string; text: string; href: string; badge?: string }> }
  | { kind: "image"; src: string; alt: string };

const FILE_TYPES: Record<string, string> = { pdf: "PDF", doc: "Word", docx: "Word", png: "Image", jpg: "Image", jpeg: "Image" };

/** "PDF", "Word" or "Image", from the file name, so people know what a download opens. */
function fileType(href: string): string | null {
  const extension = href.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return FILE_TYPES[extension] ?? null;
}

/** Whether a link leaves the site, so it opens in a new tab. Compares the parsed host, not a prefix. */
function isExternal(href: string): boolean {
  try {
    const url = new URL(href, "https://www.pavdental.com");
    return url.hostname !== "www.pavdental.com" && url.hostname !== "pavdental.com";
  } catch {
    return false;
  }
}

function Block({ block }: { block: ContentBlock }): ReactNode {
  switch (block.kind) {
    case "heading":
      return block.level === 3 ? (
        <h3 className="mt-8 font-display text-xl font-bold text-[#2a1c12]">{block.text}</h3>
      ) : (
        <h2 className="mt-10 font-display text-2xl sm:text-3xl font-bold text-[#2a1c12]">{block.text}</h2>
      );
    case "paragraph":
      return <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4a3b2f]">{block.text}</p>;
    case "list":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm sm:text-base leading-relaxed text-[#4a3b2f]">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "link":
      return (
        <p className="mt-4">
          <a
            href={block.href}
            className="font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b]"
            {...(isExternal(block.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {block.text}
          </a>
        </p>
      );
    case "documents":
      return (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {block.items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#e2d4c0] bg-white px-4 py-3 text-sm font-semibold text-[#2a1c12] hover:border-[#925a27]"
              >
                <span>{item.text}</span>
                {fileType(item.href) && (
                  <span className="shrink-0 rounded-full bg-[#faf6f0] px-2.5 py-0.5 text-xs font-bold text-[#925a27]">
                    {fileType(item.href)}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      );
    case "cards":
      return (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {block.items.map((card) => (
            <li key={card.href}>
              <a
                href={card.href}
                className="block h-full rounded-xl border border-[#e2d4c0] bg-white p-5 shadow-sm hover:border-[#925a27]"
              >
                {card.badge && (
                  <span className="mb-2 inline-block rounded-full bg-[#faf6f0] px-2.5 py-0.5 text-xs font-bold text-[#925a27]">
                    {card.badge}
                  </span>
                )}
                <span className="block font-display text-lg font-bold text-[#2a1c12]">{card.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-[#6b5848]">{card.text}</span>
              </a>
            </li>
          ))}
        </ul>
      );
    case "image":
      return <img src={block.src} alt={block.alt} loading="lazy" className="mt-6 w-full rounded-xl border border-[#e2d4c0]" />;
  }
}

/** A page's ported content, in the site's type styles. */
export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div>
      {/* Blocks are static text in a fixed order, so the position is a stable key. */}
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

/** The frame for a text page: a heading band and a readable column, between the site header and footer. */
export function ContentPageBody({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <div className="pt-24 pb-20 bg-[#fffdf9]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {eyebrow && (
          <span className="inline-block rounded-full border border-[#e2d4c0] bg-white px-4 py-1.5 text-xs font-bold uppercase text-[#925a27]">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
