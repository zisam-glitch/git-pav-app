import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { BookButton, CallButton } from "@/components/hims/button-link";
import { Heading } from "@/components/hims";
import { PRACTICE_EMAIL, PRACTICE_PHONE } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

export interface LegalTocItem {
  id: string;
  label: string;
  meta?: string;
}

export const LEGAL_LINK_CLASS =
  "font-medium text-terracotta underline underline-offset-4 t-colors hover:text-rust";

const LEGAL_POLICY_LINKS = [
  { to: "/privacy-policy", label: "Privacy", blurb: "How we collect, protect and use your records." },
  { to: "/terms-and-condition", label: "Terms & Conditions", blurb: "The terms for using our website and services." },
  { to: "/cookie-policy", label: "Cookies", blurb: "Which cookies we use and how to change them." },
  { to: "/complaints-policy", label: "Complaints", blurb: "How to raise a concern and how we respond." },
  { to: "/cctv-policy", label: "CCTV", blurb: "Why we use CCTV and how footage is handled." },
  { to: "/practice-policy", label: "Practice", blurb: "How the practice runs day to day." },
] as const;

export type LegalPolicyPath = (typeof LEGAL_POLICY_LINKS)[number]["to"];

const CARD = "rounded-[24px] border border-[#ece8dd] bg-white";

/** The id of the section nearest the top of the screen, so the contents list can follow the reader. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");
  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);
  return active;
}

/**
 * Hims-style legal & policy page:
 * - Cream hero with a two-tone heading and small fact chips
 * - A sticky pill switcher between the six policies
 * - "On this page" list that follows the reader, white 24px section cards on cream
 * - A dark notice card, then a contact card and tiles for the other policies
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
  const active = useActiveSection(toc.map((item) => item.id));
  const others = LEGAL_POLICY_LINKS.filter((policy) => policy.to !== currentPath);

  return (
    <main className="min-h-screen bg-cream text-fg">
      <ScrollProgress />
      <Header />

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1392px] px-4 pt-10 pb-8 md:px-10 md:pt-16 md:pb-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-pill bg-black px-3.5 py-1 text-caption font-medium text-white">Policies</span>
          {category ? (
            <span className="rounded-pill bg-white px-3.5 py-1 text-caption font-medium text-fg ring-1 ring-[#ece8dd]">
              {category}
            </span>
          ) : null}
        </div>
        <Heading as="h1" size="hero" accent={titleAccent} tone="terracotta" inline className="mt-5 max-w-4xl">
          {title}
        </Heading>
        {subtitle ? <p className="mt-5 max-w-2xl text-lead leading-relaxed text-muted">{subtitle}</p> : null}
        {metaItems && metaItems.length > 0 ? (
          <ul className="mt-7 flex list-none flex-wrap gap-2">
            {metaItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-pill bg-white px-4 py-2 text-small text-fg ring-1 ring-[#ece8dd]"
              >
                <span className="size-1.5 rounded-full bg-[#cf9358]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* Policy switcher */}
      <nav aria-label="Policies" className="sticky top-[49px] z-30 border-y md:top-[62px] border-[#ece8dd] bg-cream/95 backdrop-blur">
        <ul className="mx-auto flex max-w-[1392px] list-none gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:px-10">
          {LEGAL_POLICY_LINKS.map((policy) => {
            const current = policy.to === currentPath;
            return (
              <li key={policy.to} className="shrink-0">
                <Link
                  to={policy.to}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-pill px-5 text-small font-medium t-colors",
                    current ? "bg-black text-white" : "bg-white text-fg ring-1 ring-[#ece8dd] hover:bg-[#f1ede2]",
                  )}
                >
                  {policy.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Body */}
      <div className="mx-auto w-full max-w-[1392px] px-4 py-10 md:px-10 md:py-16">
        <div className="grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[17rem_minmax(0,52rem)]">
          <aside aria-label="On this page" className="min-w-0 lg:sticky lg:top-36">
            {/* Phone: collapsed jump list */}
            <details className={cn("group lg:hidden", CARD)}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-label text-fg">
                <span>On this page ({toc.length})</span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 text-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <nav aria-label="Section jump links" className="px-5 pb-3">
                <ol className="divide-y divide-[#f0ede4]">
                  {toc.map((item, index) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="flex items-baseline gap-3 py-2.5 text-small text-fg">
                        <span className="text-caption font-medium text-[#b9805b]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>

            {/* Desktop: list that follows the reader */}
            <nav aria-label="Section navigation" className="hidden lg:block">
              <p className="text-caption font-medium tracking-[0.14em] uppercase text-muted">On this page</p>
              <ol className="mt-4 list-none border-l border-[#e4dfd0]">
                {toc.map((item, index) => {
                  const on = item.id === active;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        aria-current={on ? "location" : undefined}
                        className={cn(
                          "-ml-px flex items-baseline gap-3 border-l-2 py-2 pl-4 text-small leading-snug t-colors",
                          on ? "border-[#cf9358] font-medium text-fg" : "border-transparent text-muted hover:text-fg",
                        )}
                      >
                        <span className="text-caption font-medium text-[#b9805b]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{item.label}</span>
                        {item.meta ? <span className="ml-auto shrink-0 text-caption text-muted">{item.meta}</span> : null}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0">
            {notice ? (
              <aside className="mb-5 rounded-[24px] bg-[#1b1b1b] p-6 text-small leading-relaxed text-white/85 md:p-8">
                <p className="mb-2 text-caption font-medium tracking-[0.14em] uppercase text-[#eac57d]">Please note</p>
                <div className="[&_strong]:font-medium [&_strong]:text-white">{notice}</div>
              </aside>
            ) : null}

            <div className="space-y-5">{children}</div>

            {/* Questions */}
            <div className={cn("mt-10 p-6 md:p-10", CARD)}>
              <h2 className="text-h3-md text-fg">Questions about this policy?</h2>
              <p className="mt-3 max-w-xl text-body leading-[1.7] text-muted">
                Call us on {PRACTICE_PHONE} or email{" "}
                <a href={`mailto:${PRACTICE_EMAIL}`} className={LEGAL_LINK_CLASS}>
                  {PRACTICE_EMAIL}
                </a>{" "}
                and we will help.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <CallButton variant="default">Call {PRACTICE_PHONE}</CallButton>
                <BookButton variant="outline">Book an appointment</BookButton>
              </div>
            </div>

            {/* Other policies */}
            <h2 className="mt-14 text-h3-md text-fg">Other policies</h2>
            <ul className="mt-5 grid list-none gap-3 sm:grid-cols-2 [&>li:last-child:nth-child(odd)]:sm:col-span-2">
              {others.map((policy) => (
                <li key={policy.to}>
                  <Link
                    to={policy.to}
                    className="block h-full rounded-[24px] bg-[#f1ede2] p-6 t-colors hover:bg-[#e9e4d6]"
                  >
                    <span className="block text-label font-medium text-fg">{policy.label}</span>
                    <span className="mt-1.5 block text-small leading-relaxed text-muted">{policy.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>

      <Footer />
    </main>
  );
}

/** A numbered legal section: a white card with a gold number chip and a clear heading. */
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
    <section id={id} className={cn("min-w-0 scroll-mt-36 p-6 md:p-10", CARD)}>
      <div className="flex items-center gap-4">
        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-pill bg-[#f6e7c9] px-3 text-caption font-medium text-[#7a5520]">
          {number}
        </span>
        <h2 className="text-h3-md text-fg">{title}</h2>
      </div>
      <div className="mt-5 min-w-0 space-y-4 text-body leading-[1.75] text-muted">{children}</div>
    </section>
  );
}

/** A legal table: rounded, cream header row, hairline dividers; scrolls sideways on a phone. */
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
    <div className="mt-5 w-full overflow-x-auto rounded-[20px] border border-[#ece8dd] bg-white">
      <table className={cn("w-full border-collapse text-left text-body text-fg", minWidthClass)}>
        <thead className="bg-cream text-fg">
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
        <tbody className="divide-y divide-[#f0ede4]">
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
