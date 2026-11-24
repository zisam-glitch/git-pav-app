import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BookButton } from "./button-link";
import { Heading } from "./heading";
import { Section, type SectionTheme } from "./section";

export type FeeTier = {
  id: string;
  label: string;
  price: string;
  description: string;
};

/**
 * Hims-style fee table panel: a clean white rounded-xl card with 1px hairline
 * dividers (border-border), tier descriptions, and tabular-nums right-aligned prices.
 */
export function FeeTable({
  id,
  theme = "white",
  title,
  accent,
  tiers,
  ctaLabel = "Book Appointment",
  className,
}: {
  id?: string;
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  tiers: readonly FeeTier[];
  ctaLabel?: string;
  className?: string;
}) {
  return (
    <Section id={id} theme={theme} className={className}>
      <div className="max-w-2xl">
        <Heading size="h2-md" accent={accent} tone="terracotta" inline>
          {title}
        </Heading>
      </div>

      <div
        className={cn(
          "mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-white",
        )}
      >
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="grid gap-4 px-5 py-6 md:grid-cols-[1fr_auto] md:items-start md:gap-8 md:px-8 md:py-7"
          >
            <div>
              <h3 className="text-h4 text-fg">
                {tier.label} <span className="font-normal text-muted">{`(${tier.price})`}</span>
              </h3>
              <p className="mt-2 max-w-2xl text-body text-muted">{tier.description}</p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 md:flex-col md:items-end md:justify-start">
              <span className="text-h3-md font-medium text-fg tabular-nums">{tier.price}</span>
              <BookButton variant="outline" size="sm">
                {ctaLabel}
              </BookButton>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
