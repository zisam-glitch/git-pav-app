import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import type { Product } from "@/components/shop/shop-data";
import { ShopMedia } from "@/components/shop/shop-media";
import { Button } from "@/components/ui/button";
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

export function ProductRevealCard({
  product,
  isFavorite: _isFavorite = false,
  isJustAdded = false,
  onAdd,
  onFavorite: _onFavorite,
  onQuickView,
  enableAnimations: _enableAnimations = true,
  className,
}: ProductRevealCardProps) {
  const imageContent = (
    <div className="relative block w-full overflow-hidden rounded-lg bg-white text-left">
      <ShopMedia
        src={product.image}
        alt={product.name}
        ratio="4 / 3"
        tone="sand"
        className="rounded-lg bg-white"
        imgClassName="t-zoom"
      />

      {product.badge ? (
        <span className="absolute top-3 left-3 rounded-pill bg-brown px-3 py-1 text-caption font-medium text-white">
          {product.badge}
        </span>
      ) : null}
    </div>
  );

  return (
    <article
      data-slot="product-reveal-card"
      className={cn(
        "group flex flex-col justify-between rounded-xl border border-border/70 bg-tile-cream p-5 md:p-6 t-lift hover:bg-white",
        className,
      )}
    >
      <div>
        {onQuickView ? (
          <button
            type="button"
            onClick={onQuickView}
            aria-label={`View ${product.name}`}
            className="block w-full text-left"
          >
            {imageContent}
          </button>
        ) : (
          <Link
            to="/shop/$productSlug"
            params={{ productSlug: product.slug }}
            aria-label={`View ${product.name}`}
            className="block w-full text-left"
          >
            {imageContent}
          </Link>
        )}

        <div className="mt-4">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-2.5 py-0.5 text-caption text-subtle">
            {product.categoryLabel}
          </span>
          <h3 className="mt-2.5 text-h4 text-fg">
            {onQuickView ? (
              <button
                type="button"
                onClick={onQuickView}
                className="inline-flex items-start gap-1.5 text-left t-colors hover:text-terracotta"
              >
                <span>{product.name}</span>
                <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-subtle" />
              </button>
            ) : (
              <Link
                to="/shop/$productSlug"
                params={{ productSlug: product.slug }}
                className="inline-flex items-start gap-1.5 text-left t-colors hover:text-terracotta"
              >
                <span>{product.name}</span>
                <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-subtle" />
              </Link>
            )}
          </h3>
          {product.shortDesc ? (
            <p className="mt-2 line-clamp-2 text-small text-muted">{product.shortDesc}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-h4 text-fg tabular-nums">£{product.price.toFixed(2)}</span>
            {product.originalPrice ? (
              <span className="text-small text-muted line-through tabular-nums">
                £{product.originalPrice.toFixed(2)}
              </span>
            ) : null}
          </div>
          {product.variants && product.variants.length > 0 ? (
            <span className="mt-0.5 text-caption text-subtle">
              {product.variants.length} options available
            </span>
          ) : null}
        </div>

        <Button
          type="button"
          size="sm"
          variant={isJustAdded ? "gold" : "default"}
          disabled={!product.inStock}
          onClick={onAdd}
          aria-label={
            !product.inStock
              ? `${product.name} out of stock`
              : isJustAdded
                ? `${product.name} added to bag`
                : `Add ${product.name} to bag`
          }
          className="h-10 px-4"
        >
          {isJustAdded ? (
            <>
              <Check aria-hidden className="size-4" />
              <span>Added</span>
            </>
          ) : !product.inStock ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <Plus aria-hidden className="size-4" />
              <span>Add to Bag</span>
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
