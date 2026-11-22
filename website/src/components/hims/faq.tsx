import { Minus, Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: ReactNode };

/**
 * Question-and-answer accordion modelled on Hims web FAQ sections (Mobbin 2c994fe8 & 54b349fb):
 * clean 1px hairline divider rows with oversized question typography and circular cream +/- toggles.
 * Answers stay in the server-rendered HTML when closed (search engines read them) and are marked
 * inert so keyboard users cannot tab into hidden links.
 */
export function FaqList({
  items,
  tone = "light",
  defaultOpen = 0,
  className,
}: {
  items: FaqItem[];
  tone?: "light" | "dark";
  defaultOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const id = useId();

  return (
    <div
      className={cn(
        "divide-y border-y",
        tone === "dark" ? "divide-white/15 border-white/15" : "divide-border border-border",
        className,
      )}
    >
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${id}-panel-${index}`;
        const buttonId = `${id}-button-${index}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className={cn(
                  "group flex w-full items-center justify-between gap-6 py-5 text-left text-h4 font-normal t-colors md:py-6",
                  tone === "dark"
                    ? "text-white hover:text-gold"
                    : "text-fg hover:text-terracotta",
                )}
              >
                <span className="leading-snug">{item.q}</span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-pill t-colors",
                    tone === "dark"
                      ? isOpen
                        ? "bg-gold text-brown"
                        : "bg-white/11 text-white group-hover:bg-white/20"
                      : isOpen
                        ? "bg-black text-white"
                        : "bg-sand text-fg group-hover:bg-cream-deep",
                  )}
                >
                  {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "max-w-3xl pb-6 text-body leading-relaxed",
                    tone === "dark" ? "text-white/80" : "text-muted",
                  )}
                >
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
