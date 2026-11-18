import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionTheme = "white" | "cream" | "sand" | "sage" | "brown" | "navy" | "ink";

/** Background and text colour of each Hims section theme. White and cream are the light pair; brown, navy and ink are dark. */
const THEMES: Record<SectionTheme, string> = {
  white: "bg-white text-fg",
  cream: "bg-cream text-fg",
  sand: "bg-sand text-fg",
  sage: "bg-sage-light text-fg",
  brown: "bg-brown text-white",
  navy: "bg-navy text-white",
  ink: "bg-black text-white",
};

/** Content width: wide 1392, inner 1328, bento 1132, prose 736, max 1728, full (no wrapper). */
const WIDTHS = {
  wide: "wrap",
  inner: "wrap-inner",
  bento: "wrap-bento",
  prose: "wrap-prose",
  max: "wrap-max",
  full: "",
} as const;

/** Vertical padding: none, sm 32/48, default 40/80, lg 56/120 (phone/desktop). */
const SPACE = {
  none: "",
  sm: "py-8 md:py-12",
  default: "section-y",
  lg: "py-14 md:py-[7.5rem]",
} as const;

export type SectionProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  theme?: SectionTheme;
  width?: keyof typeof WIDTHS;
  space?: keyof typeof SPACE;
  as?: "section" | "div" | "article" | "aside" | "header" | "footer" | "main" | "nav";
  innerClassName?: string;
  children?: ReactNode;
};

/** A full-width page band with a Hims theme, vertical rhythm and a width-limited inner wrapper. */
export function Section({
  theme = "white",
  width = "wide",
  space = "default",
  as: Tag = "section",
  className,
  innerClassName,
  children,
  ...rest
}: SectionProps) {
  const inner = WIDTHS[width];
  return (
    <Tag className={cn(THEMES[theme], SPACE[space], className)} {...rest}>
      {inner ? <div className={cn(inner, innerClassName)}>{children}</div> : children}
    </Tag>
  );
}
