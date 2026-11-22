import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Chip } from "@/components/hims/chip";
import { ProductCard } from "@/components/hims/product-card";
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
  const media = (
    <ShopMedia
      src={product.image}
      alt={product.name}
      ratio="4 / 3"
      tone="sand"
      className="rounded-md"
      imgClassName="t-zoom"
    />
  );

  const detailLink = (children: ReactNode, className?: string) =>
    onQuickView ? (
      <button type="button" onClick={onQuickView} className={className}>
        {children}
      </button>
    ) : (
      <Link to="/shop/$productSlug" params={{ productSlug: product.slug }} className={className}>
        {children}
      </Link>
    );

  const addLabel = !product.inStock ? "Out of Stock" : isJustAdded ? "Added" : "Add to Bag";

  return (
    <ProductCard
      className={cn("group", className)}
      media={
        onQuickView ? (
          <button
            type="button"
            onClick={onQuickView}
            aria-label={`View ${product.name}`}
            className="block w-full text-left"
          >
            {media}
          </button>
        ) : (
          <Link
            to="/shop/$productSlug"
            params={{ productSlug: product.slug }}
            aria-label={`View ${product.name}`}
            className="block w-full text-left"
          >
            {media}
          </Link>
        )
      }
      chips={
        <>
          <Chip tone="white">{product.categoryLabel}</Chip>
          {product.badge ? <Chip tone="rust">{product.badge}</Chip> : null}
        </>
      }
      title={detailLink(product.name, "t-colors hover:text-terracotta")}
      meta={
        <>
          <span className="tabular-nums">£{product.price.toFixed(2)}</span>
          {product.originalPrice ? (
            <span className="ml-2 font-normal line-through tabular-nums">
              £{product.originalPrice.toFixed(2)}
            </span>
          ) : null}
          {product.variants && product.variants.length > 0 ? (
            <span className="ml-2 font-normal">· {product.variants.length} options</span>
          ) : null}
        </>
      }
      description={
        product.shortDesc ? <span className="line-clamp-3">{product.shortDesc}</span> : null
      }
      actions={
        <>
          <Button
            type="button"
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
            className="h-12 flex-1 rounded-pill px-6"
          >
            {isJustAdded ? <Check aria-hidden className="size-4" /> : null}
            <span>{addLabel}</span>
          </Button>
          {detailLink(
            <span>View details</span>,
            "inline-flex h-12 flex-1 items-center justify-center rounded-pill border border-black/19 px-6 text-label text-fg t-colors hover:border-black",
          )}
        </>
      }
    />
  );
}
