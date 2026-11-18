import { ArrowRight } from "lucide-react";
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

const FILE_TYPES: Record<string, string> = {
  pdf: "PDF",
  doc: "Word",
  docx: "Word",
  png: "Image",
  jpg: "Image",
  jpeg: "Image",
};

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

const TEXT_LINK_CLASS =
  "font-medium text-[#754B3D] underline decoration-black/25 underline-offset-4 transition-colors hover:text-[#1B3745]";

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
        <h3 className="mt-8 font-display text-xl font-normal tracking-[-0.03em] text-black sm:text-2xl">
          {block.text}
        </h3>
      ) : (
        <h2 className="mt-10 font-display text-2xl font-normal tracking-[-0.035em] text-black sm:text-3xl">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="mt-4 text-sm leading-relaxed text-black/70 sm:text-base">
          {renderText(block.text, block.links)}
        </p>
      );
    case "list":
      return (
        <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-black/70 sm:text-base marker:text-[#754B3D]">
          {block.items.map((item) => {
            const rich = typeof item === "string" ? { text: item } : item;
            return (
              <li key={rich.text}>{renderText(rich.text, "links" in rich ? rich.links : undefined)}</li>
            );
          })}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="mt-10 rounded-r-[1.5rem] border-l-2 border-[#1B3745] bg-[#FAF8F2] px-6 py-5 font-display text-lg font-normal leading-relaxed tracking-[-0.02em] text-black sm:text-xl">
          {block.text}
        </blockquote>
      );
    case "table": {
      const head = block.header ? block.rows[0] : undefined;
      const body = block.header ? block.rows.slice(1) : block.rows;
      return (
        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-black/6 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.03)]">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm leading-relaxed text-black/75">
            {head && (
              <thead className="border-b border-black/10 bg-[#FAF8F2] text-black">
                <tr>
                  {head.map((cell, index) => (
                    <th key={index} scope="col" className="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-black/60">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-black/8">
              {body.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition-colors hover:bg-[#FAF8F2]/60">
                  {row.map((cell, index) => (
                    <td key={index} className="px-5 py-3.5 align-top">
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
            className={TEXT_LINK_CLASS}
            {...(isExternal(block.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {block.text}
          </a>
        </p>
      );
    case "documents":
      return (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {block.items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="group flex items-center justify-between gap-3 rounded-[1.25rem] border border-black/6 bg-white px-5 py-4 text-sm font-medium text-black shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-black/15 hover:bg-[#FAF8F2]"
              >
                <span className="transition-colors group-hover:text-[#1B3745]">{item.text}</span>
                {fileType(item.href) && (
                  <span className="shrink-0 rounded-full bg-[#F2EDE5] px-3 py-1 text-xs font-medium text-[#1B3745]">
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
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((card) => (
            <li key={card.href}>
              <a
                href={card.href}
                className="group flex h-full flex-col justify-between rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_28px_rgba(0,0,0,0.05)]"
              >
                <div>
                  {card.badge && (
                    <span className="mb-3 inline-block rounded-full bg-[#F2EDE5] px-3 py-1 text-xs font-medium text-[#1B3745]">
                      {card.badge}
                    </span>
                  )}
                  <span className="block font-display text-xl font-normal tracking-[-0.03em] text-black group-hover:text-[#1B3745]">
                    {card.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-black/60">{card.text}</span>
                </div>
                <span className="mt-6 inline-flex size-9 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <img
          src={block.src}
          alt={block.alt}
          loading="lazy"
          className="mt-6 w-full rounded-[1.5rem] border border-black/6"
        />
      );
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
export function ContentPageBody({
  eyebrow,
  title,
  wide = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="bg-[#FBF8F5] pt-24 pb-20 sm:pt-28">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className={wide ? "w-full" : "max-w-3xl"}>
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">{eyebrow}</p>
          )}
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl">
            {title}
          </h1>
          <div className="mt-6 border-t border-black/10 pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
