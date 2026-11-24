import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight, Download, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { Heading, Media, Section, Tile } from "@/components/hims";
import { headingIds } from "./heading-ids";

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
  | { kind: "list"; items: Array<string | RichText>; ordered?: boolean }
  | { kind: "quote"; text: string }
  | { kind: "table"; header?: boolean; rows: string[][] }
  | { kind: "link"; text: string; href: string }
  | { kind: "documents"; items: Array<{ text: string; href: string }> }
  | { kind: "cards"; items: Array<{ title: string; text: string; href: string; badge?: string }> }
  | { kind: "image"; src: string; alt: string };

const FILE_TYPES: Record<string, string> = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOCX",
  png: "PNG",
  jpg: "JPG",
  jpeg: "JPG",
};

/** "PDF", "DOCX" or "JPG", from the file name, so people know what a download opens. */
export function documentFileType(href: string): string | null {
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

export const CONTENT_LINK_CLASS =
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
        className={CONTENT_LINK_CLASS}
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

function Block({ block, id }: { block: ContentBlock; id?: string }): ReactNode {
  switch (block.kind) {
    case "heading":
      return block.level === 3 ? (
        <h3 id={id} className="mt-8 scroll-mt-28 text-h4 text-fg">
          {block.text}
        </h3>
      ) : (
        <h2
          id={id}
          className="mt-10 scroll-mt-28 border-t border-border pt-8 text-h3-md text-fg first:border-t-0 first:pt-0"
        >
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="mt-4 text-body leading-[1.7] text-fg/90">
          {renderText(block.text, block.links)}
        </p>
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={`mt-4 space-y-2.5 pl-5 text-body leading-[1.68] text-fg/90 marker:text-terracotta ${block.ordered ? "list-decimal" : "list-disc"}`}
        >
          {block.items.map((item, itemIndex) => {
            const rich = typeof item === "string" ? { text: item } : item;
            return (
              <li key={`${itemIndex}-${rich.text}`}>
                {renderText(rich.text, "links" in rich ? rich.links : undefined)}
              </li>
            );
          })}
        </ListTag>
      );
    }
    case "quote":
      return (
        <Tile tone="cream" as="aside" className="mt-8 border-l-2 border-terracotta p-6 md:p-8">
          <blockquote className="text-h4 leading-snug text-fg">{block.text}</blockquote>
        </Tile>
      );
    case "table": {
      const head = block.header ? block.rows[0] : undefined;
      const body = block.header ? block.rows.slice(1) : block.rows;
      return (
        <div className="mt-6 w-full overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[30rem] border-collapse text-left text-body text-fg">
            {head && (
              <thead className="bg-sand text-fg">
                <tr>
                  {head.map((cell, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="border-b border-border px-5 py-3.5 text-caption font-medium tracking-[0.06em] uppercase text-fg"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-border">
              {body.map((row, rowIndex) => (
                <tr key={rowIndex} className="t-colors hover:bg-cream/60">
                  {row.map((cell, index) => (
                    <td
                      key={index}
                      className={
                        index === 0
                          ? "px-5 py-4 align-top text-small font-medium leading-relaxed text-fg"
                          : "px-5 py-4 align-top text-small leading-relaxed text-muted"
                      }
                    >
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
            className={CONTENT_LINK_CLASS}
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
            const typeLabel = documentFileType(item.href);
            return (
              <li key={item.href} className="min-w-0">
                <a
                  href={item.href}
                  className="group flex h-full items-center justify-between gap-3 rounded-xl border border-transparent bg-tile-cream px-4 py-4 text-label text-fg t-lift hover:border-border hover:bg-white"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-terracotta t-colors group-hover:bg-cream">
                      <FileText aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 leading-snug text-fg t-colors group-hover:text-terracotta">
                      {item.text}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {typeLabel ? (
                      <span className="rounded-pill border border-border bg-white px-2.5 py-0.5 text-caption font-medium tracking-[0.04em] text-terracotta">
                        {typeLabel}
                      </span>
                    ) : null}
                    <Download
                      aria-hidden="true"
                      className="size-4 text-muted t-colors group-hover:text-fg"
                    />
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
            <li key={card.href} className="min-w-0">
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
  const ids = headingIds(blocks);
  return (
    <div className="min-w-0 [&>*:first-child]:mt-0">
      {/* Blocks are static text in a fixed order, so the position is a stable key. */}
      {blocks.map((block, index) => (
        <Block key={index} block={block} id={ids[index]} />
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
      <Section theme="cream" width="prose" space="sm" className="border-b border-border">
        <p className="text-caption font-medium tracking-[0.14em] uppercase text-muted">
          Pav Dental · Bradford
        </p>
        {eyebrow ? (
          <span className="mt-3 inline-block rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-fg">
            {eyebrow}
          </span>
        ) : null}
        <Heading as="h1" size="hero" className="mt-4">
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
            className="mb-8 border-l-2 border-terracotta p-5 text-small leading-relaxed text-fg md:p-6"
          >
            {notice}
          </Tile>
        ) : null}
        {children}
      </Section>
    </>
  );
}
