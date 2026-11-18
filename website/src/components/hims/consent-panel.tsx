import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";
import { Section, type SectionTheme } from "./section";

export type ConsentItem = {
  title: string;
  desc: string;
  icon: LucideIcon;
};

/**
 * Hims-style prose/panel callout for clinical informed consent statements.
 * Renders consent headings, intro, and items verbatim inside wrap-prose.
 */
export function ConsentPanel({
  theme = "cream",
  title,
  accent,
  intro,
  items,
}: {
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  intro: string;
  items: readonly ConsentItem[];
}) {
  const panelSurface = theme === "cream" ? "border border-border bg-white" : "bg-cream";

  return (
    <Section theme={theme} width="prose">
      <div className={cn("rounded-xl p-6 md:p-10", panelSurface)}>
        <Heading size="h3-md" accent={accent} tone="terracotta" inline>
          {title}
        </Heading>
        <p className="mt-3 text-body text-muted">{intro}</p>

        <ul className="mt-6 divide-y divide-border border-t border-border">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="flex items-start gap-4 py-5 last:pb-0">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-cream text-terracotta"
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <h3 className="text-label text-fg">{item.title}</h3>
                  <p className="mt-1 text-body text-muted">{item.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
