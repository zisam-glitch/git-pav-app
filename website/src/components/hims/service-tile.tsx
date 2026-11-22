import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Picture-led listing card that links to one page (a service, a category, a plan). Use it in a grid of 2 to 3
 * columns; every card in the grid is the same height.
 *
 * Hims reference: the card bands of `/hair-loss.html` (bands y464 to y2950, 1440 wide). Measured: `article`
 * radius 16px, fill rgba(0,0,0,.03) (about #f7f7f7 on white), padding 25px, 20px between parts; the picture has
 * radius 16px; title 26.67px / 500 / 30px (our `text-h4`); body 15.67px / 400 / 20px at 50% black. Hover (ours,
 * the kit's tile hover): the card grows to 1.02 and turns white with a soft shadow over 0.2s, the picture zooms to
 * 1.03.
 *
 * The whole card is one link, so its accessible name is the title, the description and the chip read together.
 * The title is not a heading: put the tiles under a section that already has one.
 *
 * Props: `to` (a route), `title`, `description`, `media` (a `Media` node, which is cropped to a 16px radius),
 * `chip` (a `Chip` node: over the top left of the picture, or above the title when there is no picture, for
 * example "Coming soon"), `className`.
 */
export function ServiceTile({
  to,
  title,
  description,
  media,
  chip,
  className,
}: {
  to: LinkProps["to"];
  title: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  chip?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex h-full flex-col gap-5 rounded-md bg-black/3 p-6 text-fg t-lift hover:bg-white",
        className,
      )}
    >
      {media ? (
        <span className="relative block">
          <span className="block overflow-hidden rounded-md">
            <span className="block transition-transform duration-200 ease-in-out motion-safe:group-hover:scale-[1.03]">
              {media}
            </span>
          </span>
          {chip ? <span className="absolute top-4 left-4">{chip}</span> : null}
        </span>
      ) : chip ? (
        <span className="block">{chip}</span>
      ) : null}
      <span className="flex items-start justify-between gap-3">
        <span className="text-h4">{title}</span>
        <ChevronRight aria-hidden className="mt-1 size-5 shrink-0" />
      </span>
      {description ? <span className="block text-body text-muted">{description}</span> : null}
    </Link>
  );
}
