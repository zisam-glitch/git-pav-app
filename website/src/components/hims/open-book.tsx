import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section, type SectionTheme } from "./section";

/**
 * A full-width band made of two leaves: a picture that runs to the band's edge and a leaf of text beside it.
 *
 * Hims reference: the "open book" band of `/benefits.html` (y3046, 1440 wide, 843 tall): cream (`#faf8f2`), two
 * leaves of 720px; the picture fills the whole left leaf; the right leaf has 60px top and bottom padding, 44px on
 * its left and is vertically centred; the band overlaps the previous one by 24px (see `Statement` `sheet`). On a
 * phone the leaves stack: picture on top at its own aspect ratio, 40px of padding around the text.
 *
 * Props: `media` (the picture node; give a `Media` `className="h-full rounded-none"` so it fills the leaf),
 * `children` (the text leaf), `reverse` (picture on the right), `theme` (default cream), `sheet` (24px overlap and
 * top radius), `id`, `headingId`, `className`.
 */
export function OpenBook({
  media,
  children,
  reverse = false,
  theme = "cream",
  sheet = false,
  id,
  headingId,
  className,
}: {
  media: ReactNode;
  children: ReactNode;
  reverse?: boolean;
  theme?: SectionTheme;
  sheet?: boolean;
  id?: string;
  headingId?: string;
  className?: string;
}) {
  return (
    <Section
      id={id}
      theme={theme}
      width="full"
      space="none"
      aria-labelledby={headingId}
      className={cn("overflow-hidden", sheet && "relative -mt-6 rounded-t-xl", className)}
    >
      <div className="grid md:grid-cols-2">
        <div className={cn("min-h-0", reverse && "md:order-2")}>{media}</div>
        <div
          className={cn(
            "flex flex-col justify-center px-4 py-10 md:px-12 md:py-[60px] lg:px-16",
            reverse && "md:order-1",
          )}
        >
          <div className="max-w-[40rem]">{children}</div>
        </div>
      </div>
    </Section>
  );
}
