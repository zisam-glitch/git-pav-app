import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckList, type CheckItem } from "./check-list";

/**
 * A membership plan as one card: plan name, price, the list of what is included and a button. Put three in a
 * grid; mark the featured one with `featured` (white, lifted and outlined) while the others stay on the soft grey
 * fill.
 *
 * Hims reference: the membership page (`/weight-loss/membership.html`) shows one plan, so this card borrows its
 * row list (fill rgba(0,0,0,.03), radius 24px, padding 30px) and tick list (18px rust discs, 20px row gap), and
 * the labs comparison table (`/labs.html`, y3710) for the featured column: white fill, shadow
 * `0 8px 16px rgba(0,0,0,.12)`, 16px corners. Price in `text-h3`, name in `text-h4`.
 *
 * The plan name is the card's heading (`h3`): put the cards under a section with an H2.
 *
 * Props: `name`, `price` (already formatted, for example "£9.47"), `period` ("/ month"), `features` (tick-list
 * items, `included: false` for a perk the plan lacks), `badge` (a node beside the name), `featured`, `action`
 * (a button node, shown full width at the foot), `className`.
 */
export function PlanCard({
  name,
  price,
  period = "/ month",
  features,
  badge,
  featured = false,
  action,
  className,
}: {
  name: ReactNode;
  price: ReactNode;
  period?: ReactNode;
  features: readonly (string | CheckItem)[];
  badge?: ReactNode;
  featured?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  /* token-request: featured card shadow 0 8px 16px rgba(0,0,0,.12) */
  return (
    <article
      data-slot="plan-card"
      className={cn(
        "flex h-full flex-col gap-8 rounded-xl p-6 md:p-[30px]",
        featured
          ? "bg-white shadow-[0_8px_16px_rgba(0,0,0,0.12)] ring-1 ring-black/15"
          : "bg-black/3",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-h4">{name}</h3>
          {badge}
        </div>
        <p className="mt-4 flex items-baseline gap-1.5 text-h3 tabular-nums">
          <span>{price}</span>
          <span className="text-small text-muted">{period}</span>
        </p>
      </div>
      <CheckList items={features} text="fg" className="gap-4 border-t border-border pt-6" />
      {action ? <div className="mt-auto [&>*]:w-full">{action}</div> : null}
    </article>
  );
}
