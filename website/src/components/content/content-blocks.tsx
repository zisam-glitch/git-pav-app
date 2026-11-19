import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Heading, Media, Section, Tile } from "@/components/hims";

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
  "font-medium text-terracotta underline underline-offset-4 t-colors hover:text-rust";

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
        <h3 className="mt-8 text-h4 text-fg">{block.text}</h3>
      ) : (
        <h2 className="mt-10 text-h3-md text-fg">{block.text}</h2>
      );
    case "paragraph":
      return (
        <p className="mt-4 text-body leading-relaxed text-fg">
          {renderText(block.text, block.links)}
        </p>
      );
    case "list":
      return (
        <ul className="mt-4 list-disc space-y-2.5 pl-5 text-body leading-relaxed text-fg">
          {block.items.map((item) => {
            const rich = typeof item === "string" ? { text: item } : item;
            return (
              <li key={rich.text}>
                {renderText(rich.text, "links" in rich ? rich.links : undefined)}
              </li>
            );
          })}
        </ul>
      );
    case "quote":
      return (
        <Tile tone="cream" as="aside" className="mt-8 p-6 md:p-8">
          <blockquote className="text-h4 text-fg">{block.text}</blockquote>
        </Tile>
      );
    case "table": {
      const head = block.header ? block.rows[0] : undefined;
      const body = block.header ? block.rows.slice(1) : block.rows;
      return (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[32rem] border-collapse text-left text-body text-fg">
            {head && (
              <thead className="bg-cream text-fg">
                <tr>
                  {head.map((cell, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="border-b border-border px-4 py-3 text-label"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border last:border-b-0">
                  {row.map((cell, index) => (
                    <td key={index} className="px-4 py-3 align-top text-small text-muted">
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
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {block.items.map((item) => {
            const typeLabel = fileType(item.href);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex h-full items-center justify-between gap-3 rounded-xl border border-transparent bg-tile-cream px-4 py-3.5 text-label text-fg t-lift hover:border-border hover:bg-white"
                >
                  <span>{item.text}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {typeLabel ? (
                      <span className="rounded-pill border border-border bg-white px-2.5 py-0.5 text-caption font-medium text-terracotta">
                        {typeLabel}
                      </span>
                    ) : null}
                    <ChevronRight aria-hidden className="size-4 text-muted" />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      );
    case "cards":
      return (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {block.items.map((card) => (
            <li key={card.href}>
              <Link
                to={card.href as LinkProps["to"]}
                className="group flex h-full flex-col justify-between rounded-xl border border-transparent bg-tile-cream p-5 t-lift hover:border-border hover:bg-white"
              >
                <div>
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-h4 text-fg">{card.title}</span>
                    <ChevronRight aria-hidden className="mt-1 size-5 shrink-0 text-fg" />
                  </span>
                  <span className="mt-2 block text-small text-muted">{card.text}</span>
                </div>
                {card.badge ? (
                  <span className="mt-3 inline-flex w-fit rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-fg">
                    {card.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <div className="mt-6">
          <Media src={block.src} alt={block.alt} ratio="16 / 9" tone="cream" />
        </div>
      );
  }
}

/** A page's ported content, in the site's type styles. */
export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="[&>*:first-child]:mt-0">
      {/* Blocks are static text in a fixed order, so the position is a stable key. */}
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

/** The frame for a text page: a cream heading band and a readable prose column, between header and footer. */
export function ContentPageBody({
  eyebrow,
  title,
  subtitle,
  notice,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  notice?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Section theme="cream" width="prose" space="sm">
        {eyebrow ? (
          <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
            {eyebrow}
          </span>
        ) : null}
        <Heading as="h1" size="hero" className={eyebrow ? "mt-4" : undefined}>
          {title}
        </Heading>
        {subtitle ? <p className="mt-3 text-lead text-muted">{subtitle}</p> : null}
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </Section>

      <Section theme="white" width="prose" space="default">
        {notice ? (
          <Tile
            tone="cream"
            as="aside"
            className="mb-8 p-5 text-small leading-relaxed text-fg md:p-6"
          >
            {notice}
          </Tile>
        ) : null}
        {children}
      </Section>
    </>
  );
}
