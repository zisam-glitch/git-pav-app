import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocEntry = { id: string; text: string };

/**
 * The article's table of contents, as on a Hims article (`.toc-list-link-item`): a "Content" label over
 * a list of the section headings with a 2px rail on the left, each link `14px` / weight 500 in 54% black
 * that turns solid black, with a black bar on the rail, for the section being read.
 *
 * On wide screens it sits in the left margin beside the article and sticks while you scroll; on smaller
 * screens it is a collapsed list above the article. It is one list in the page either way.
 */
export function ArticleToc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string | undefined>(entries[0]?.id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const targets = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-112px 0px -65% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="my-6 xl:absolute xl:inset-y-0 xl:right-full xl:my-0 xl:w-60 xl:pr-6"
    >
      <div className="xl:sticky xl:top-28 xl:pt-10">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-[12px] bg-black/[0.04] px-4 py-3 text-left text-[14px] font-medium text-fg xl:pointer-events-none xl:cursor-default xl:bg-transparent xl:p-0"
        >
          Content
          <ChevronDown
            className={cn("size-4 transition-transform xl:hidden", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        <ol className={cn("mt-3 border-l-2 border-black/12", open ? "block" : "hidden", "xl:block")}>
          {entries.map((entry) => (
            <li key={entry.id} className="flex">
              <a
                href={`#${entry.id}`}
                aria-current={active === entry.id ? "location" : undefined}
                className="relative px-4 py-2 text-[14px] leading-snug font-medium text-black/54 transition-colors duration-300 after:absolute after:top-0 after:-left-0.5 after:h-full after:w-0.5 after:bg-black after:opacity-0 after:transition-opacity after:duration-300 hover:text-black/89 aria-[current=location]:text-black/89 aria-[current=location]:after:opacity-100"
              >
                {entry.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
