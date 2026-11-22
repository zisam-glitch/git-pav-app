import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KeyLine = { title: ReactNode; children?: ReactNode };

const TITLE = { lg: "text-h3-md", md: "text-h4" } as const;

/**
 * A list of points, each marked by a tall rounded bar on its left.
 *
 * Hims reference: the "key line" rows of `/benefits.html` (band y2390, 1440 wide): each row is a flex with a 20px
 * gap and 25px under it; the bullet is a 20px-wide slot holding an 8px-wide bar the full height of the row
 * (radius 10px, gradient `linear-gradient(221.78deg, #9e4952 28%, #b76d57 54%, #dc926e 80%)`); the title is
 * 31.17px / 500 / 34.4px, the text under it 15.67px at 50% black. The gradient here runs terracotta, clay, copper
 * (a bar is not text, so a gradient is allowed). Rows are static: no hover.
 *
 * Props: `items` (`{ title, children }`; `children` is the optional text under the title), `size` ("lg" titles are
 * `text-h3-md`, "md" are `text-h4` for a full sentence), `className`. Titles are paragraphs, not headings.
 */
export function KeyLineList({
  items,
  size = "lg",
  className,
}: {
  items: readonly KeyLine[];
  size?: keyof typeof TITLE;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-6", className)}>
      {items.map((item, index) => (
        <li key={index} className="flex gap-5">
          <span
            aria-hidden
            className="mx-1.5 w-2 shrink-0 rounded-[10px] bg-linear-to-b from-terracotta via-clay to-copper"
          />
          <div className="py-0.5">
            <p className={cn(TITLE[size], "text-fg")}>{item.title}</p>
            {item.children ? <p className="mt-2 text-body text-muted">{item.children}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
