import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { Heading, Section, Tile } from "@/components/hims";
import { cn } from "@/lib/utils";

export interface LegalTocItem {
  id: string;
  label: string;
  meta?: string;
}

export const LEGAL_LINK_CLASS =
  "font-medium text-terracotta underline underline-offset-4 t-colors hover:text-rust";

const LEGAL_POLICY_LINKS = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-and-condition", label: "Terms & Conditions" },
  { to: "/cookie-policy", label: "Cookie Policy" },
  { to: "/complaints-policy", label: "Complaints Policy" },
  { to: "/cctv-policy", label: "CCTV Policy" },
  { to: "/practice-policy", label: "Practice Policy" },
] as const;

export type LegalPolicyPath = (typeof LEGAL_POLICY_LINKS)[number]["to"];

/**
 * Hims-style legal & policy page shell:
 * - Grey rounded hero panel with a two-tone heading, like the Hims product pages
 * - Sticky "On this page" sidebar in rounded grey tiles
 * - Each section is its own 24px rounded grey card
 */
export function LegalDocumentPage({
  currentPath,
  category,
  title,
  titleAccent,
  subtitle,
  metaItems,
  notice,
  toc,
  children,
}: {
  currentPath: LegalPolicyPath;
  category?: string;
  title: string;
  titleAccent?: string;
  subtitle?: ReactNode;
  metaItems?: string[];
  notice?: ReactNode;
  toc: LegalTocItem[];
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />

      {/* Grey rounded hero panel with a two-tone heading */}
      <Section theme="white" width="wide" space="none" className="pt-6 md:pt-10">
        <div className="max-w-3xl rounded-[24px] bg-[#f6f6f4] p-7 md:p-14">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-caption font-medium tracking-[0.14em] uppercase text-muted">
              Pav Dental · Bradford
            </p>
            {category ? (
              <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-fg">
                {category}
              </span>
            ) : null}
          </div>

          <Heading
            as="h1"
            size="hero"
            accent={titleAccent}
            tone="terracotta"
            inline
            className="mt-5"
          >
            {title}
          </Heading>

          {subtitle ? (
            <p className="mt-4 max-w-2xl text-lead leading-relaxed text-muted">{subtitle}</p>
          ) : null}

          {metaItems && metaItems.length > 0 ? (
            <dl className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-muted">
              {metaItems.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-terracotta" aria-hidden="true" />
                  <dd>{item}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </Section>

      {/* Body with a sticky "On this page" jump nav */}
      <Section theme="white" width="wide" space="default">
        <div className="grid items-start gap-10 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[18.5rem_minmax(0,48rem)] lg:gap-14">
          <aside aria-label="On this page" className="min-w-0 lg:sticky lg:top-24">
            {/* Mobile compact jump menu */}
            <details className="group rounded-[24px] bg-[#f6f6f4] lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-label text-fg">
                <span className="text-caption font-medium tracking-[0.12em] uppercase text-muted">
                  On this page ({toc.length})
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 text-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <nav aria-label="Section jump links" className="px-5 pb-3">
                <ol className="divide-y divide-[#e4e4df]">
                  {toc.map((item, index) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="flex items-baseline justify-between gap-3 py-2.5 text-small text-fg t-colors hover:text-terracotta"
                      >
                        <span className="flex items-baseline gap-2.5">
                          <span className="font-mono text-caption font-medium text-terracotta">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{item.label}</span>
                        </span>
                        {item.meta ? (
                          <span className="shrink-0 text-caption text-muted">{item.meta}</span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>

            {/* Desktop sticky sidebar */}
            <div className="hidden space-y-5 lg:block">
              <Tile tone="cream" className="rounded-[24px] bg-[#f6f6f4] p-6">
                <p className="text-caption font-medium tracking-[0.14em] uppercase text-muted">
                  On this page
                </p>
                <nav aria-label="Section navigation" className="mt-4">
                  <ol className="divide-y divide-[#e4e4df]">
                    {toc.map((item, index) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="group flex items-baseline justify-between gap-3 py-3 text-small text-fg t-colors first:pt-1 last:pb-1 hover:text-terracotta"
                        >
                          <span className="flex items-baseline gap-3">
                            <span className="font-mono text-caption font-medium text-terracotta">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="leading-snug">{item.label}</span>
                          </span>
                          {item.meta ? (
                            <span className="shrink-0 rounded-pill border border-border bg-white px-2 py-0.5 text-caption text-muted">
                              {item.meta}
                            </span>
                          ) : null}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </Tile>

              <div className="rounded-[24px] bg-[#f6f6f4] p-5">
                <p className="text-caption font-medium tracking-[0.14em] uppercase text-muted">
                  Practice Policies
                </p>
                <ul className="mt-3 space-y-1">
                  {LEGAL_POLICY_LINKS.map((policy) => {
                    const active = policy.to === currentPath;
                    return (
                      <li key={policy.to}>
                        <Link
                          to={policy.to}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-small t-colors",
                            active
                              ? "bg-white font-medium text-fg"
                              : "text-muted hover:bg-white/70 hover:text-fg",
                          )}
                        >
                          <span>{policy.label}</span>
                          <ChevronRight
                            aria-hidden="true"
                            className={cn(
                              "size-3.5 shrink-0",
                              active ? "text-terracotta" : "text-muted/60",
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>

          <article className="min-w-0">
            {notice ? (
              <Tile
                tone="cream"
                as="aside"
                className="mb-6 rounded-[24px] bg-[#f6f6f4] p-6 text-small leading-relaxed text-fg md:p-8"
              >
                {notice}
              </Tile>
            ) : null}

            <div className="space-y-4">{children}</div>
          </article>
        </div>
      </Section>

      <Footer />
    </main>
  );
}

/** A numbered editorial legal section with crisp spacing and anchor offset. */
export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="min-w-0 scroll-mt-28 rounded-[24px] bg-[#f6f6f4] p-6 md:p-10">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-caption font-medium text-terracotta">{number}</span>
        <h2 className="text-h3-md text-fg">{title}</h2>
      </div>
      <div className="mt-4 min-w-0 space-y-4 text-body leading-[1.7] text-muted">{children}</div>
    </section>
  );
}

/**
 * Structured Hims legal table (Mobbin d30bea96):
 * Soft sand header bar, crisp 1px horizontal dividers, readable 2+ column padding,
 * always wrapped in w-full overflow-x-auto for 0px overflow at 390px.
 */
export function LegalTable({
  headers,
  rows,
  minWidthClass = "min-w-[30rem]",
}: {
  headers: string[];
  rows: ReactNode[][];
  minWidthClass?: string;
}) {
  return (
    <div className="mt-5 w-full overflow-x-auto rounded-[24px] bg-white">
      <table className={cn("w-full border-collapse text-left text-body text-fg", minWidthClass)}>
        <thead className="bg-[#ebebe6] text-fg">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-5 py-3.5 text-caption font-medium tracking-[0.06em] uppercase text-fg"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f0ec]">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="t-colors hover:bg-cream/60">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "px-5 py-4 align-top text-small leading-relaxed",
                    cellIndex === 0 ? "font-medium text-fg" : "text-muted",
                  )}
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
