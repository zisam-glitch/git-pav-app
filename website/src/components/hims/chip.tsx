import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  gold: "bg-gold text-brown",
  rust: "bg-rust text-white",
  white: "bg-white text-fg",
  cream: "border border-border bg-cream text-fg",
  sand: "bg-sand text-fg",
  dark: "bg-black text-white",
} as const;

export type ChipTone = keyof typeof TONES;

/**
 * Hims chip: the small label pill that sits above a heading or on a picture ("New", a category, a status).
 *
 * Hims reference: `/hair-loss.html` product cards, `/weight-loss/membership.html` eyebrow chips and
 * `/hair-loss/minoxidil.html` side rail. Measured: inline-flex, padding 5.5px 8px, radius 46px, label 12.83px / 500
 * with line-height 1 (24px tall); fills `#8a3a34` (our `rust`, white text), gold `#ffc671` (ink text) and white
 * (ink text) on pictures.
 *
 * Props: `tone` (gold, rust, white, cream, sand, dark), `as` (span by default), `className`, children.
 */
export function Chip({
  tone = "gold",
  as: Tag = "span",
  className,
  children,
}: {
  tone?: ChipTone;
  as?: "span" | "p" | "div";
  className?: string;
  children: ReactNode;
}) {
  /* token-request: chip vertical padding 5.5px (py-[5.5px]); the nearest token is py-1.5 (6px) */
  return (
    <Tag
      className={cn(
        "inline-flex items-center rounded-pill px-2 py-[5.5px] text-caption leading-none font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
