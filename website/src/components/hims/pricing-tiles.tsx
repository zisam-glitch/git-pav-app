import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BookButton } from "./button-link";
import { Heading } from "./heading";
import { Section, type SectionTheme } from "./section";
import { Tile, type TileTone } from "./tile";

export type PricingTier = {
  id: string;
  eyebrow: string;
  price: string;
  name: string;
  description: string;
  bestFor?: string;
  tone?: TileTone;
};

/**
 * Hims-style treatment pricing tile grid: cream/sage rounded-xl cards with large
 * tabular-nums prices, tier copy, optional best-for footer line, and full-width BookButton.
 */
export function PricingTiles({
  id = "pricing",
  theme = "white",
  title,
  accent,
  lead,
  tiers,
  columns = 3,
  ctaLabel = "Make an Appointment",
  footer,
}: {
  id?: string;
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  lead?: ReactNode;
  tiers: readonly PricingTier[];
  columns?: 2 | 3 | 4;
  ctaLabel?: string;
  footer?: ReactNode;
}) {
  const gridCols =
    columns === 4
      ? "gap-4 sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
        ? "gap-6 md:grid-cols-2"
        : "gap-6 lg:grid-cols-3";

  return (
    <Section id={id} theme={theme} space="default">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent={accent} tone="terracotta" inline>
          {title}
        </Heading>
        {lead ? <p className="mt-4 text-lead text-muted">{lead}</p> : null}
      </div>

      <div className={cn("mt-10 grid", gridCols)}>
        {tiers.map((tier) => (
          <Tile
            key={tier.id}
            as="article"
            tone={tier.tone ?? "cream"}
            lift
            className={cn(
              "flex flex-col justify-between gap-6",
              columns === 4 ? "p-6" : "p-6 md:p-8",
            )}
          >
            <div>
              <p className="text-caption font-medium text-muted">{tier.eyebrow}</p>
              <p className="mt-2 text-h3 text-fg tabular-nums">{tier.price}</p>
              <h3 className="mt-3 text-h4 text-fg">{tier.name}</h3>
              <p className={cn("mt-3 text-muted", columns === 4 ? "text-small" : "text-body")}>
                {tier.description}
              </p>
              {tier.bestFor ? (
                <p className="mt-4 border-t border-border pt-4 text-small font-medium text-fg">
                  {tier.bestFor}
                </p>
              ) : null}
            </div>
            <BookButton className="w-full">{ctaLabel}</BookButton>
          </Tile>
        ))}
      </div>

      {footer ? <div className="mt-8">{footer}</div> : null}
    </Section>
  );
}
