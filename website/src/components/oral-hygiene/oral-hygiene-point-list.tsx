import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Section, type SectionTheme } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";

/**
 * `IncludedList` (Hims "Everything beyond your medication comes with Care+", `/testosterone.html` y7277) with one
 * difference: each row text is an H3, so the page keeps the point headings it had before pass 2 (SEO).
 */
export function OralHygienePointList({
  id,
  theme,
  title,
  accent,
  lead,
  items,
  note,
}: {
  id?: string;
  theme: SectionTheme;
  title: ReactNode;
  accent: ReactNode;
  lead: ReactNode;
  items: readonly string[];
  note: ReactNode;
}) {
  return (
    <Section id={id} theme={theme} width="prose">
      <SectionHeader align="center" title={title} accent={accent} lead={lead} size="h3" />
      <ul className="mx-auto mt-10 grid max-w-[43rem] gap-5 md:mt-12">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center justify-between gap-6 rounded-xl bg-black/3 p-6 md:p-[30px]"
          >
            <h3 className="text-lead font-medium">{item}</h3>
            <Check aria-hidden className="size-6 shrink-0 text-terracotta" />
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-6 max-w-[43rem] text-body text-muted">{note}</p>
    </Section>
  );
}
