import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";
import type { AccentTone } from "./tones";

const BANDS = {
  brown: "bg-brown text-white",
  navy: "bg-navy text-white",
  ink: "bg-black text-white",
} as const;

/**
 * The closing call to action of a page: a rounded dark panel, a headline with an accent word, one line of
 * text and the buttons (pass `actions`, for example BookButton and CallButton with the dark-section variants:
 * gold + glass on brown, butter + glass on navy, light + glass on ink).
 */
export function CtaBand({
  theme = "brown",
  title,
  accent,
  tone = "gold",
  children,
  actions,
  className,
}: {
  theme?: keyof typeof BANDS;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  children?: ReactNode;
  actions: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("wrap section-y", className)}>
      <div
        className={cn(
          "grid items-center gap-8 rounded-xl px-6 py-12 md:grid-cols-[1.3fr_1fr] md:gap-12 md:px-14 md:py-16",
          BANDS[theme],
        )}
      >
        <div>
          <Heading size="h2-md" accent={accent} tone={tone}>
            {title}
          </Heading>
          {children ? <div className="mt-4 text-lead text-white/80">{children}</div> : null}
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">{actions}</div>
      </div>
    </section>
  );
}
