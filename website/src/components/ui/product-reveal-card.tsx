import { Link } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import type { Product } from "@/components/shop/shop-data";
import { cn } from "@/lib/utils";

interface ProductRevealCardProps {
  product: Product;
  isFavorite?: boolean;
  isJustAdded?: boolean;
  onAdd?: () => void;
  onFavorite?: () => void;
  onQuickView?: () => void;
  enableAnimations?: boolean;
  className?: string;
}

/**
 * A product card in the Hims "Popular" style (Mobbin): a light grey rounded card with the name
 * and price on top, the product centred, and a black pill beside an outlined "Learn more".
 */
export function ProductRevealCard({
  product,
  isJustAdded = false,
  onAdd,
  onQuickView,
  className,
}: ProductRevealCardProps) {
  const link = (children: React.ReactNode, label: string, extra?: string) =>
    onQuickView ? (
      <button type="button" onClick={onQuickView} aria-label={label} className={cn("block w-full text-left", extra)}>
        {children}
      </button>
    ) : (
      <Link
        to="/shop/$productSlug"
        params={{ productSlug: product.slug }}
        aria-label={label}
        className={cn("block w-full text-left", extra)}
      >
        {children}
      </Link>
    );

  return (
    <article
      data-slot="product-reveal-card"
      className={cn(
        "group relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#f4f3e0] p-5",
        className,
      )}
    >
      {/* The packshot runs to the card's edges and fades into the card colour under the text. */}
      <div className="absolute inset-x-0 top-28 bottom-0">
        {link(
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-[50%_55%] t-zoom"
          />,
          `View ${product.name}`,
          "size-full",
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#f4f3e0] to-[#f4f3e0]/0"
        />
      </div>

      <div className="pointer-events-none relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] text-[#6d6e72]">{product.categoryLabel}</p>
          <h3 className="mt-0.5 text-[18px] leading-[1.2] text-[#1b1b1b]">{product.name}</h3>
          <p className="mt-1 flex items-baseline gap-2 text-[15px] text-[#1b1b1b] tabular-nums">
            £{product.price.toFixed(2)}
            {product.originalPrice ? (
              <span className="text-[13px] text-[#8b8d92] line-through">
                £{product.originalPrice.toFixed(2)}
              </span>
            ) : null}
          </p>
        </div>
        {product.badge ? (
          <span className="shrink-0 rounded-full bg-[#dff1e4] px-2.5 py-0.5 text-[12px] text-[#256b3b]">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!product.inStock}
          onClick={onAdd}
          aria-label={
            !product.inStock
              ? `${product.name} out of stock`
              : isJustAdded
                ? `${product.name} added to bag`
                : `Add ${product.name} to bag`
          }
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-black px-5 text-[14px] text-white t-colors hover:bg-black/85 disabled:opacity-50"
        >
          {isJustAdded ? (
            <>
              <Check aria-hidden className="size-4" />
              Added
            </>
          ) : !product.inStock ? (
            "Out of Stock"
          ) : (
            <>
              <Plus aria-hidden className="size-4" />
              Add to Bag
            </>
          )}
        </button>
        {link(
          <span className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[14px] text-[#1b1b1b] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] t-colors hover:bg-[#faf9f6]">
            Learn more
          </span>,
          `Learn more about ${product.name}`,
          "w-auto",
        )}
      </div>
    </article>
  );
}
