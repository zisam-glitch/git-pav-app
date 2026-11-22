import type { ReactNode } from "react";
import { BookButton } from "@/components/hims";
import { Section, type SectionTheme } from "@/components/hims/section";
import { SectionHeader } from "@/components/hims/section-header";
import { cn } from "@/lib/utils";

export type TierCard = { id: string; label: string; price: string; description: string };

/**
 * Price tiers as warm cards under a header row with one pill (Hims PDP "GLP-1 power in a pill" band,
 * `/weight-loss/wegovy-pill.html` y920: 16px radius sand cards, 25px padding, 22px/500 title, 15.67px text).
 * Each card title is an H3 that keeps the live wording, "Basic Root Canal (£195)".
 */
export function GeneralDentistryTierCards({
  id,
  theme,
  title,
  accent,
  tiers,
  action,
}: {
  id?: string;
  theme: Extract<SectionTheme, "white" | "cream">;
  title: ReactNode;
  accent?: ReactNode;
  tiers: readonly TierCard[];
  action?: ReactNode;
}) {
  return (
    <Section id={id} theme={theme}>
      <SectionHeader
        title={title}
        accent={accent}
        action={action ?? <BookButton>Book Appointment</BookButton>}
      />
      <ul className="mt-10 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-4">
        {tiers.map((tier) => (
          <li key={tier.id}>
            <article
              className={cn(
                "flex h-full flex-col gap-4 rounded-md p-5 md:gap-5 md:p-[25px]",
                theme === "white" ? "bg-sand" : "bg-white",
              )}
            >
              <h3 className="text-[1.125rem] leading-[1.16] font-medium md:text-[1.385rem]">
                {tier.label} <span className="text-muted">{`(${tier.price})`}</span>
              </h3>
              <p className="text-body text-muted">{tier.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
