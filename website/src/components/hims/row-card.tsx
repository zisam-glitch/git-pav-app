import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A list row as a soft rounded card: content on the left, an action or a small picture on the right.
 *
 * Hims reference: the partner rows of `/benefits.html` (band y707, right column, 616px wide at 1440): `li` rows
 * 87px tall with 20px between them, fill `rgba(0,0,0,.03)`, padding 30px, radius 24px, flex with the text on the
 * left (18.5px / 600) and a 48x27 logo on the right. Rows are static (no lift on hover). On a phone the action
 * drops under the content.
 *
 * Props: `children` (the content), `action` (the right-hand node, for example a pill button), `as` (li, div or
 * article), `className`. Wrap several rows in a `ul className="grid gap-5"`.
 */
export function RowCard({
  children,
  action,
  as: Tag = "li",
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  as?: "li" | "div" | "article";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "flex flex-col gap-5 rounded-xl bg-black/3 p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-[30px]",
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div> : null}
    </Tag>
  );
}
