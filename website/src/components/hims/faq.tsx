import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: ReactNode };

/**
 * Question-and-answer list in the Hims tile style: each row is a rounded cream (or glass) tile with a plus
 * that turns into a cross. Answers stay in the page HTML when closed (search engines read them) and are
 * made inert so keyboard users cannot tab into hidden links. One row is open at a time.
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
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${id}-panel-${index}`;
        const buttonId = `${id}-button-${index}`;
        return (
          <div
            key={item.q}
            className={cn(
              "rounded-xl t-colors",
              tone === "dark" ? "bg-white/7" : isOpen ? "bg-white shadow-card" : "bg-cream",
            )}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left text-lead font-medium md:px-6 md:py-5"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border transition-transform duration-300 ease-in-out",
                    tone === "dark" ? "border-white/30" : "border-border-strong",
                    isOpen && "rotate-45",
                  )}
                >
                  <Plus className="size-4" />
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
                    "px-5 pb-5 text-body md:px-6 md:pb-6",
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
