import type { ReactNode } from "react";

/**
 * One piece of a page's text in reading order, as captured from the live site
 * (scripts/seo-snapshot.mjs --content-dir) and ported word for word.
 */
/** Words inside a text that are a link, in the order they appear. */
export type InlineLink = { text: string; href: string };
/** A list item, or other short text, with links inside it. */
export type RichText = { text: string; links?: InlineLink[] };

export type ContentBlock =
  | { kind: "heading"; text: string; level?: 2 | 3 }
  | { kind: "paragraph"; text: string; links?: InlineLink[] }
  | { kind: "list"; items: Array<string | RichText> }
  | { kind: "quote"; text: string }
  | { kind: "table"; header?: boolean; rows: string[][] }
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

const TEXT_LINK_CLASS = "font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b]";

/**
 * The text with the words of each link turned into that link. Links are matched
 * in order, so a phrase that appears twice links where the page linked it. Words
 * that are not found stay plain text.
 */
function renderText(text: string, links?: InlineLink[]): ReactNode {
  if (!links?.length) return text;
  const parts: ReactNode[] = [];
  let cursor = 0;
  links.forEach((link, index) => {
    const at = text.indexOf(link.text, cursor);
    if (at === -1) return;
    if (at > cursor) parts.push(text.slice(cursor, at));
    parts.push(
      <a
        key={index}
        href={link.href}
        className={TEXT_LINK_CLASS}
        {...(isExternal(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {link.text}
      </a>,
    );
    cursor = at + link.text.length;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
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
      return (
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4a3b2f]">{renderText(block.text, block.links)}</p>
      );
    case "list":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm sm:text-base leading-relaxed text-[#4a3b2f]">
          {block.items.map((item) => {
            const rich = typeof item === "string" ? { text: item } : item;
            return <li key={rich.text}>{renderText(rich.text, "links" in rich ? rich.links : undefined)}</li>;
          })}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="mt-10 border-l-4  bg-[#faf6f0] px-6 py-5 font-display text-lg leading-relaxed text-[#2a1c12]">
          {block.text}
        </blockquote>
      );
    case "table": {
      const head = block.header ? block.rows[0] : undefined;
      const body = block.header ? block.rows.slice(1) : block.rows;
      return (
        <div className="mt-6 overflow-x-auto rounded-xl   bg-white">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm leading-relaxed text-[#4a3b2f]">
            {head && (
              <thead className="bg-[#faf6f0] text-[#2a1c12]">
                <tr>
                  {head.map((cell, index) => (
                    <th key={index} scope="col" className="  px-4 py-3 font-bold">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex} className="  last:border-b-0">
                  {row.map((cell, index) => (
                    <td key={index} className="px-4 py-3 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
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
                className="flex items-center justify-between gap-3 rounded-lg   bg-white px-4 py-3 text-sm font-semibold text-[#2a1c12] hover:border-[#925a27]"
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
                className="block h-full rounded-xl   bg-white p-5 shadow-sm hover:border-[#925a27]"
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
      return <img src={block.src} alt={block.alt} loading="lazy" className="mt-6 w-full rounded-xl  " />;
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow && (
            <span className="inline-block rounded-full   bg-white px-4 py-1.5 text-xs font-bold uppercase text-[#925a27]">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">{title}</h1>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
