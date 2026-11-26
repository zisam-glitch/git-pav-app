import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ACCENT_TEXT, type AccentTone } from "./tones";

const TONES = {
  cream: "bg-tile-cream text-fg",
  sage: "bg-tile-sage text-fg",
  white: "border border-border bg-white text-fg",
  grey: "bg-[#f7f7f7] text-fg !border-transparent !shadow-none",
  brown: "bg-brown text-white",
  navy: "bg-navy text-white",
  glass: "bg-white/7 text-white",
} as const;

export type TileTone = keyof typeof TONES;

/** Hims tile: 24px radius, 18px padding, cream gradient (or a dark/glass tone). `lift` adds the hover grow and shadow. */
export function Tile({
  tone = "cream",
  lift = false,
  as: Tag = "div",
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  tone?: TileTone;
  lift?: boolean;
  as?: "div" | "li" | "article" | "section" | "aside";
  children?: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "relative overflow-hidden rounded-xl p-[18px]",
        TONES[tone],
        lift && "t-lift",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * The Hims category tile as a link: a title with one accent word, a chevron, a short line and an image
 * underneath that zooms to 1.03 on hover. Use it for service tiles and "related" tiles.
 */
export function TileLink({
  to,
  href,
  tone = "cream",
  title,
  accent,
  accentTone = "clay",
  description,
  media,
  className,
}: {
  to?: LinkProps["to"];
  href?: string;
  tone?: TileTone;
  title: ReactNode;
  accent?: ReactNode;
  accentTone?: AccentTone;
  description?: ReactNode;
  media?: ReactNode;
  className?: string;
}) {
  const classes = cn(
    "group relative flex flex-col overflow-hidden rounded-xl p-4 md:p-[18px] t-lift",
    TONES[tone],
    className,
  );
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-h4">
          {title}
          {accent ? (
            <>
              {" "}
              <span className={ACCENT_TEXT[accentTone]}>{accent}</span>
            </>
          ) : null}
        </span>
        <ChevronRight aria-hidden className="mt-1 size-5 shrink-0" />
      </span>
      {description ? <span className="mt-2 block text-small text-muted">{description}</span> : null}
      {media ? <span className="t-zoom mt-4 block">{media}</span> : null}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={classes}>
        {body}
      </Link>
    );
  }
  return (
    <a href={href} className={classes}>
      {body}
    </a>
  );
}
