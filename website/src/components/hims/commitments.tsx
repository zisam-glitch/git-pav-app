import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Commitment = { label: ReactNode; children: ReactNode };

const TONES = {
  dark: { card: "bg-white/7", label: "text-gold", text: "text-white/80" },
  light: { card: "bg-cream", label: "text-terracotta", text: "text-muted" },
} as const;

/**
 * A short list of labelled commitments as rounded cards: a label line and the text under it.
 *
 * Hims reference: the stat grid and value rows of the "Clinical excellence" capture (page script, see
 * `docs/redesign/website/hims-patterns/clinical-excellence.md`): a 2-column grid with a 5px gap, cells with a 20px
 * radius, 20px padding and a 6px gap between the figure and its caption; value rows are 20px-radius rows. We use a
 * 16px gap, 24 to 32px padding and a heading-size label so full sentences stay readable; the dark cards are
 * translucent white (`bg-white/7`) like the Hims glass tile.
 *
 * Props: `items` (`{ label, children }`: the label comes first in the HTML, then its text), `tone` ("dark" on a
 * brown or navy band, "light" on white or cream), `columns` (1 or 2 on a desktop, default 2), `className`.
 * Labels are paragraphs, not headings.
 */
export function Commitments({
  items,
  tone = "dark",
  columns = 2,
  className,
}: {
  items: readonly Commitment[];
  tone?: keyof typeof TONES;
  columns?: 1 | 2;
  className?: string;
}) {
  const look = TONES[tone];
  return (
    <ul className={cn("grid gap-4", columns === 2 && "md:grid-cols-2", className)}>
      {items.map((item, index) => (
        <li key={index} className={cn("rounded-lg p-6 md:p-8", look.card)}>
          <p className={cn("text-h4", look.label)}>{item.label}</p>
          <p className={cn("mt-3 text-body", look.text)}>{item.children}</p>
        </li>
      ))}
    </ul>
  );
}
