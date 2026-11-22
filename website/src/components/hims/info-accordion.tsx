import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InfoAccordionItem = {
  title: string;
  content: ReactNode;
};

/**
 * Hims information accordion: plain rows with a hairline between them, a 15.67px/500 label on the left and a
 * chevron on the right. Used for FAQ answers, "Meet the treatment", "How it works", "Ingredients" and "Shipping"
 * style blocks, and for after-care notes.
 *
 * Hims reference: `/hair-loss/minoxidil.html` and `/weight-loss/wegovy-pill.html` side rail, and the FAQ column of
 * `/testosterone.html`: native `<details>` rows 64px tall (18px vertical padding, 20px between label and icon),
 * a 21px icon, 1px divider (65px pitch), no card, no circle around the icon. Closed answers are not in the capture,
 * so the open body uses the kit's body style (text-body, muted).
 *
 * It is built from native `<details>`, so every answer stays in the server HTML (crawlers read it) and works
 * with no script. Each label is an H3 (`headingLevel` 3) inside the `<summary>`, which keeps question headings
 * in the page outline. `exclusive` opens one row at a time (the `name` attribute). `defaultOpen` is the index of the
 * row that starts open (none by default, as on Hims).
 *
 * Props: `items` (`{ title, content }`), `defaultOpen`, `exclusive`, `headingLevel` (3 or 4), `className`.
 */
export function InfoAccordion({
  items,
  defaultOpen = null,
  exclusive = false,
  headingLevel = 3,
  className,
}: {
  items: readonly InfoAccordionItem[];
  defaultOpen?: number | null;
  exclusive?: boolean;
  headingLevel?: 3 | 4;
  className?: string;
}) {
  const group = useId();
  const Heading = headingLevel === 4 ? "h4" : "h3";

  return (
    <div className={cn("border-t border-border", className)}>
      {items.map((item, index) => (
        <details
          key={item.title}
          name={exclusive ? group : undefined}
          open={defaultOpen === index ? true : undefined}
          className="group border-b border-border"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-md py-[18px] t-colors hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
            <Heading className="text-pretty text-label">{item.title}</Heading>
            <ChevronDown
              aria-hidden
              className="size-[21px] shrink-0 transition-transform duration-300 ease-smooth group-open:rotate-180"
            />
          </summary>
          <div className="max-w-3xl pb-6 text-body text-muted">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
