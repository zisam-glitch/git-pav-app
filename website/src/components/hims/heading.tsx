import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ACCENT_TEXT, type AccentTone } from "./tones";

const SIZES = {
  display: "text-display",
  hero: "text-hero",
  h2: "text-h2",
  "h2-md": "text-h2-md",
  h3: "text-h3",
  "h3-md": "text-h3-md",
  h4: "text-h4",
} as const;

export type HeadingSize = keyof typeof SIZES;

/**
 * Hims headline: black (or white on dark) first line, accent-coloured second line.
 *   <Heading as="h1" size="hero" accent="starts here" tone="terracotta">Your best</Heading>
 * `size` picks the fluid type step; `inline` keeps the accent on the same line.
 */
export function Heading({
  as: Tag = "h2",
  size = "h2",
  accent,
  tone = "clay",
  inline = false,
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
  size?: HeadingSize;
  accent?: ReactNode;
  tone?: AccentTone;
  inline?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cn(SIZES[size], className)}>
      {children}
      {accent ? (
        inline ? (
          <>
            {" "}
            <span className={ACCENT_TEXT[tone]}>{accent}</span>
          </>
        ) : (
          <>
            {" "}
            <span className={cn("block", ACCENT_TEXT[tone])}>{accent}</span>
          </>
        )
      ) : null}
    </Tag>
  );
}
