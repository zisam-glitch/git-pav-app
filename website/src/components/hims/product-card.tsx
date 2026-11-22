import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Hims product card: a rounded picture frame with chips on it, the product name, a price line, a short
 * description and the buttons. No card fill: the picture frame carries the tint.
 *
 * Hims reference: product cards of `/hair-loss.html` (band y3750, 1440 wide). Measured: `article` flex column
 * with 20px gaps, 438px wide; picture frame 438 x 246 (16:9), radius 16px, fill rgba(0,0,0,.03); chips at 20px
 * from the top left of the frame; title 26.67px / 500 / 30px (our `text-h4`); price line 15.67px / 600 at 50%
 * black (ours `text-small font-semibold`); description 15.67px / 400 / 20px at 50% (ours `text-body text-muted`);
 * then the buttons: two 48px pills side by side with an 8px gap.
 *
 * The caller passes the finished nodes (a link around the picture, a link in the title), so one card works for a
 * catalogue, a category page and a related-products row. Keep the title a heading (`as`), one level below the
 * section heading above the grid.
 *
 * Props: `media` (the picture, for example a `Media` or `ShopMedia` inside a link; it is cropped to a 16px radius
 * on a tinted frame), `chips` (a row of `Chip`s over the picture), `title`, `as` (h3 by default), `meta` (price
 * line), `description`, `actions` (buttons), `className`.
 */
export function ProductCard({
  media,
  chips,
  title,
  as: Title = "h3",
  meta,
  description,
  actions,
  className,
}: {
  media: ReactNode;
  chips?: ReactNode;
  title: ReactNode;
  as?: "h2" | "h3" | "h4" | "p";
  meta?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <article data-slot="product-card" className={cn("flex h-full flex-col gap-5", className)}>
      <div className="relative overflow-hidden rounded-md bg-black/3">
        {media}
        {chips ? <div className="absolute top-5 left-5 flex flex-wrap gap-1.5">{chips}</div> : null}
      </div>
      <div className="flex flex-col gap-3">
        <Title className="text-h4">{title}</Title>
        {meta ? <div className="text-small font-semibold text-muted">{meta}</div> : null}
        {description ? <p className="text-body text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="mt-auto flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
}
