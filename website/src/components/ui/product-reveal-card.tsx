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
  return (
    <article
      data-slot="product-reveal-card"
      className={cn(
        "group flex flex-col justify-between rounded-xl bg-tile-cream p-5 md:p-6 t-lift hover:bg-white",
        className,
      )}
    >
      <div>
        <button
          type="button"
          onClick={onQuickView}
          aria-label={`View ${product.name}`}
          className="relative block w-full overflow-hidden rounded-lg bg-white text-left"
        >
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
        </button>

        <div className="mt-4">
          <p className="text-caption text-subtle">{product.categoryLabel}</p>
          <h3 className="mt-1 text-h4 text-fg">
            <button
              type="button"
              onClick={onQuickView}
              className="inline-flex items-start gap-1.5 text-left t-colors hover:text-terracotta"
            >
              <span>{product.name}</span>
              <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-subtle" />
            </button>
          </h3>
          {product.shortDesc ? (
            <p className="mt-2 line-clamp-2 text-small text-muted">{product.shortDesc}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-h4 text-fg tabular-nums">£{product.price.toFixed(2)}</span>
          {product.originalPrice ? (
            <span className="text-small text-muted line-through tabular-nums">
              £{product.originalPrice.toFixed(2)}
            </span>
          ) : null}
        </div>

        <Button
          type="button"
          size="icon"
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
          title={!product.inStock ? "Out of stock" : isJustAdded ? "Added" : "Add to bag"}
        >
          {isJustAdded ? (
            <Check aria-hidden className="size-4" />
          ) : (
            <Plus aria-hidden className="size-4" />
          )}
        </Button>
      </div>
    </article>
  );
}
