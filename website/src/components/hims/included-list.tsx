import { Check, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Section, type SectionTheme } from "./section";
import { SectionHeader } from "./section-header";
import type { AccentTone } from "./tones";

export type IncludedItem = string | { text: ReactNode; icon?: LucideIcon };

/**
 * A "what is included" (or "good care helps to") list: a centred heading and a narrow column of soft grey rows,
 * each with its text on the left and a small icon on the right.
 *
 * Hims reference: "Everything beyond your medication comes with Care+" on `/testosterone.html` (y7277, 1440
 * wide) and "Get complete support in one membership" on `/weight-loss/wegovy-pill.html` (y1770): a 768px column
 * under a centred heading (52.83px/410 and 44.67px/418); the list is 445px (Care+) or 692px (membership) wide;
 * rows have 3% black fill, 24px radius, 30px padding, 30px between text and a 24px icon, 20px between rows; the
 * text is 18.5px/500 at 81% black. A 12.83px footnote sits under the list.
 *
 * Props: `title` + `accent` (the one H2), `tone`, `lead`, `items` (a string, or `{ text, icon }`), `note`
 * (footnote), `theme`, `id`. Items are list rows, not headings.
 */
export function IncludedList({
  id,
  theme = "white",
  title,
  accent,
  tone = "terracotta",
  lead,
  items,
  note,
}: {
  id?: string;
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  lead?: ReactNode;
  items: readonly IncludedItem[];
  note?: ReactNode;
}) {
  return (
    <Section id={id} theme={theme} width="prose">
      <SectionHeader
        align="center"
        title={title}
        accent={accent}
        tone={tone}
        lead={lead}
        size="h3"
      />
      <ul className="mx-auto mt-10 grid max-w-[43rem] gap-5 md:mt-12">
        {items.map((item, index) => {
          const text = typeof item === "string" ? item : item.text;
          const Icon = typeof item === "string" ? Check : (item.icon ?? Check);
          return (
            <li
              key={index}
              className="flex items-center justify-between gap-6 rounded-xl bg-black/3 p-6 md:p-[30px]"
            >
              <span className="text-lead font-medium">{text}</span>
              <Icon aria-hidden className="size-6 shrink-0 text-terracotta" />
            </li>
          );
        })}
      </ul>
      {note ? <p className="mx-auto mt-6 max-w-[43rem] text-caption text-subtle">{note}</p> : null}
    </Section>
  );
}
