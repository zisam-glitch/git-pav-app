import { Pause, Play } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TrustItem = {
  icon?: ReactNode;
  text: string;
  /** Hims colours each phrase differently: terracotta, copper, navy or sky. */
  tone?: "terracotta" | "copper" | "navy" | "sky";
};

const TONES = {
  terracotta: "text-terracotta",
  copper: "text-copper",
  navy: "text-navy",
  sky: "text-[#3f6f99]",
} as const;

/**
 * Hims benefits strip: a rounded cream bar of icon-and-phrase items that scrolls sideways. It has a pause
 * button (moving content must be stoppable) and stands still for visitors who ask for reduced motion.
 */
export function TrustStrip({ items, className }: { items: TrustItem[]; className?: string }) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={cn("flex items-center gap-3 rounded-xl bg-cream px-4 py-3", className)}>
      <div className="relative min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto">
        <ul
          className={cn(
            "flex w-max items-center gap-10 text-small motion-safe:animate-[marquee_40s_linear_infinite]",
            paused && "[animation-play-state:paused]",
          )}
        >
          {[0, 1].map((copy) =>
            items.map((item) => (
              <li
                key={`${copy}-${item.text}`}
                aria-hidden={copy === 1 ? true : undefined}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap",
                  TONES[item.tone ?? "terracotta"],
                )}
              >
                {item.icon}
                <span>{item.text}</span>
              </li>
            )),
          )}
        </ul>
      </div>
      <button
        type="button"
        aria-pressed={paused}
        aria-label={paused ? "Play scrolling benefits" : "Pause scrolling benefits"}
        onClick={() => setPaused((value) => !value)}
        className="grid size-8 shrink-0 place-items-center rounded-full border border-border-strong bg-white t-colors hover:border-black motion-reduce:hidden"
      >
        {paused ? (
          <Play aria-hidden className="size-3.5" />
        ) : (
          <Pause aria-hidden className="size-3.5" />
        )}
      </button>
    </div>
  );
}
