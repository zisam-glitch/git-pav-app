"use client";

import { Check, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/components/shop/shop-data";

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

export function ProductRevealCard({
  product,
  isJustAdded = false,
  onAdd,
  onQuickView,
  className,
}: ProductRevealCardProps) {
  const isOutOfStock = product.inStock === false;

  return (
    <article
      data-slot="product-reveal-card"
      className={cn(
        "group relative flex flex-col justify-between rounded-[1.5rem] border border-black/8 bg-[#F7F6F3] p-6 transition-all duration-300 hover:border-black/15 hover:bg-[#FAF8F2] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      {/* Top header: Category eyebrow + badge + CareSans title + price */}
      <div>
        <div className="flex items-center justify-between gap-2 min-h-[24px]">
          <span className="text-xs font-medium text-[#754B3D] tracking-tight">
            {product.categoryLabel || "Dental Care"}
          </span>
          {product.badge && (
            <span className="inline-flex items-center rounded-full bg-[#1B3745] px-2.5 py-0.5 text-[11px] font-medium text-white">
              {product.badge}
            </span>
          )}
        </div>

        <h3 className="mt-2 font-display text-[1.35rem] font-normal leading-[1.18] tracking-[-0.03em] text-black">
          <button
            type="button"
            onClick={onQuickView}
            className="text-left transition-colors hover:text-[#1B3745] focus-visible:outline-none focus-visible:underline"
          >
            {product.name}
          </button>
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-medium tabular-nums text-black">
            £{product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs tabular-nums text-black/45 line-through">
              £{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Centered product image stage */}
      <button
        type="button"
        onClick={onQuickView}
        aria-label={`View ${product.name}`}
        className="my-6 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-white/80 p-4 focus-visible:outline-none"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full rounded-xl object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
      </button>

      {/* Paired Hims pill CTAs: Black primary + White bordered secondary */}
      <div className="space-y-2">
        {product.shortDesc && (
          <p className="line-clamp-2 text-xs leading-relaxed text-black/55 mb-3">
            {product.shortDesc}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.();
            }}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
              isJustAdded
                ? "bg-[#1B3745] text-white"
                : "bg-black text-white hover:bg-[#1B3745]",
            )}
          >
            {isOutOfStock ? (
              "Out of stock"
            ) : isJustAdded ? (
              <>
                <Check className="size-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="size-3.5" />
                <span>Add to bag</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/12 bg-white px-4 text-xs font-medium text-black transition-colors duration-200 hover:bg-[#F2EDE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745] focus-visible:ring-offset-2"
          >
            Learn more
          </button>
        </div>
      </div>
    </article>
  );
}
