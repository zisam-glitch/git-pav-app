import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { api, type ProductVariant } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Product } from "./shop-data";
import { ShopMedia } from "./shop-media";

interface ProductDetailProps {
  productSlug: string;
  onAddToCart: (product: Product, quantity: number, variant?: ProductVariant | null) => void;
}

function hasUsableImage(src?: string): src is string {
  return Boolean(src && !src.includes("images.unsplash.com"));
}

export function ProductDetail({ productSlug, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: () => api.products.getBySlug(productSlug),
    enabled: !!productSlug,
  });

  const variants = useMemo(() => product?.variants ?? [], [product?.variants]);

  const images = useMemo(() => {
    const gallery = (product?.images ?? [])
      .map((img) => img.url)
      .filter((url): url is string => hasUsableImage(url));
    if (gallery.length > 0) return gallery;
    if (hasUsableImage(product?.image)) return [product.image];
    return [];
  }, [product?.images, product?.image]);

  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  const handleVariantSelect = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) {
      setVariantError("Selected variant not available");
      return;
    }
    if (variant.stock_qty <= 0) {
      setVariantError("This variant is out of stock");
      return;
    }
    setSelectedVariantId(variantId);
    setVariantError(null);
  };

  const currentPrice = activeVariant?.price_override
    ? typeof activeVariant.price_override === "string"
      ? parseFloat(activeVariant.price_override)
      : activeVariant.price_override
    : typeof product?.price === "string"
      ? parseFloat(product.price)
      : product?.price || 49.99;

  const isCurrentInStock =
    variants.length > 0
      ? activeVariant
        ? activeVariant.stock_qty > 0
        : false
      : (product?.in_stock ?? true);

  const currentStockQty = activeVariant ? activeVariant.stock_qty : (product?.total_stock ?? 50);

  if (isLoading) {
    return (
      <Section theme="white" className="min-h-[60vh]">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-fg border-t-transparent" />
          <p className="mt-4 text-small text-muted">Loading product details...</p>
        </div>
      </Section>
    );
  }

  if (error || !product) {
    return (
      <Section theme="white" className="min-h-[60vh]">
        <div className="mx-auto max-w-md py-20 text-center">
          <Heading as="h1" size="h2-md">
            Product Not Found
          </Heading>
          <p className="mt-3 text-body text-muted">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <div className="mt-6">
            <ButtonLink to="/shop" variant="outline">
              Back to Shop
            </ButtonLink>
          </div>
        </div>
      </Section>
    );
  }

  const productData: Product = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category || "dental-care",
    categoryLabel: product.category_label || "Dental Care",
    price: currentPrice,
    originalPrice: product.original_price
      ? typeof product.original_price === "string"
        ? parseFloat(product.original_price)
        : product.original_price
      : undefined,
    image: images[selectedImageIndex] || images[0] || "",
    variants: product.variants,
    relatedProducts: product.relatedProducts,
    shortDesc: product.short_desc || "",
    fullDesc: product.full_desc || "",
    features: Array.isArray(product.features) ? product.features : [],
    howToUse: product.how_to_use || "",
    badge: product.badge || undefined,
    inStock: isCurrentInStock,
  };

  const handleAdd = () => {
    onAddToCart(
      {
        ...productData,
        name: activeVariant
          ? `${productData.name} - ${Object.values(activeVariant.attributes).join(", ")}`
          : productData.name,
      },
      quantity,
      activeVariant,
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productData.name,
    image: images,
    description: productData.shortDesc || productData.fullDesc,
    brand: {
      "@type": "Brand",
      name: "PavDental",
    },
    offers: {
      "@type": "Offer",
      url: `https://pavdental.com/shop/${productData.slug}`,
      priceCurrency: "GBP",
      price: currentPrice.toFixed(2),
      availability: isCurrentInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="bg-white text-fg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Section theme="cream" space="sm" aria-label="Breadcrumb">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-small font-medium text-muted t-colors hover:text-fg"
        >
          <ArrowLeft aria-hidden className="size-4" />
          <span>Back to Shop</span>
        </Link>
      </Section>

      <Section theme="white">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-tile-cream">
              <ShopMedia
                src={images[selectedImageIndex]}
                alt={productData.name}
                tone="cream"
                priority
              />
              {productData.badge ? (
                <span className="absolute top-4 left-4 rounded-pill bg-brown px-4 py-1 text-caption font-medium text-white">
                  {productData.badge}
                </span>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={cn(
                      "relative size-20 shrink-0 overflow-hidden rounded-lg border-2 t-colors",
                      selectedImageIndex === idx
                        ? "border-black"
                        : "border-border opacity-70 hover:opacity-100",
                    )}
                  >
                    <img
                      src={img}
                      alt={`${productData.name} view ${idx + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-caption font-medium text-subtle">{productData.categoryLabel}</p>
              <Heading as="h1" size="h2-md" className="mt-2">
                {productData.name}
              </Heading>
            </div>

            {/* Price & Stock Badge */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-h3 text-fg tabular-nums">£{currentPrice.toFixed(2)}</span>
              {productData.originalPrice ? (
                <span className="text-lead text-muted line-through tabular-nums">
                  £{productData.originalPrice.toFixed(2)}
                </span>
              ) : null}
              {isCurrentInStock ? (
                <span className="rounded-pill bg-sage px-3.5 py-1 text-caption font-medium text-fg">
                  {currentStockQty < 10
                    ? `Low Stock · Only ${currentStockQty} left`
                    : "In Stock & Ready to Dispatch"}
                </span>
              ) : (
                <span className="rounded-pill bg-sand px-3.5 py-1 text-caption font-medium text-rust">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {variants.length > 0 ? (
              <div className="space-y-3 border-t border-border pt-5">
                <p className="text-small font-medium text-fg">Select Option</p>
                {variantError ? (
                  <p className="rounded-lg bg-sand px-3 py-2 text-small text-danger">
                    {variantError}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariantId
                      ? selectedVariantId === v.id
                      : variants[0]?.id === v.id;
                    const label =
                      Object.entries(v.attributes || {})
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(" / ") || v.sku;
                    const outOfStock = v.stock_qty <= 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v.id)}
                        disabled={outOfStock}
                        className={cn(
                          "rounded-pill border-2 px-4 py-2 text-small font-medium t-colors",
                          isSelected
                            ? "border-black bg-black text-white"
                            : outOfStock
                              ? "cursor-not-allowed border-border bg-cream text-subtle line-through"
                              : "border-border-strong bg-white text-fg hover:border-black",
                        )}
                      >
                        {label}
                        {v.price_override
                          ? ` (+£${(parseFloat(String(v.price_override)) - parseFloat(String(product.price))).toFixed(2)})`
                          : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Description */}
            <p className="text-body text-muted">{productData.fullDesc || productData.shortDesc}</p>

            {/* Quantity and Add to Bag */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex h-12 items-center rounded-pill border-2 border-border-strong bg-white px-2">
                <button
                  type="button"
                  disabled={!isCurrentInStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid size-8 place-items-center rounded-pill text-muted t-colors hover:text-fg disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus aria-hidden className="size-4" />
                </button>
                <span className="w-10 text-center text-label tabular-nums text-fg">{quantity}</span>
                <button
                  type="button"
                  disabled={!isCurrentInStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="grid size-8 place-items-center rounded-pill text-muted t-colors hover:text-fg disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus aria-hidden className="size-4" />
                </button>
              </div>

              <Button
                type="button"
                onClick={handleAdd}
                disabled={!isCurrentInStock}
                className="min-w-[200px] flex-1"
              >
                <ShoppingBag aria-hidden className="size-4" />
                <span>
                  {!isCurrentInStock
                    ? "Out of Stock"
                    : added
                      ? "Added to Bag!"
                      : `Add to Bag · £${(currentPrice * quantity).toFixed(2)}`}
                </span>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 border-t border-border pt-5 text-small text-muted">
              <div className="flex items-center gap-2">
                <Truck aria-hidden className="size-4 text-terracotta" />
                <span>Free UK Delivery over £40</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden className="size-4 text-terracotta" />
                <span>Bradford clinic dispatch</span>
              </div>
            </div>

            {/* Clinical Features */}
            {productData.features && productData.features.length > 0 ? (
              <Tile tone="cream" className="space-y-3 p-6">
                <p className="text-label text-fg">Clinical Highlights</p>
                <ul className="space-y-2.5">
                  {productData.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-small text-muted">
                      <CheckCircle2
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-terracotta"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </Tile>
            ) : null}

            {/* How to use */}
            {productData.howToUse ? (
              <Tile tone="sage" className="p-6">
                <p className="text-label text-fg">Directions for Use</p>
                <p className="mt-2 text-small text-muted">{productData.howToUse}</p>
              </Tile>
            ) : null}
          </div>
        </div>
      </Section>

      {/* Related Products Section */}
      {product.relatedProducts && product.relatedProducts.length > 0 ? (
        <Section theme="cream">
          <Heading as="h2" size="h3-md" accent="Oral Care" tone="terracotta" inline>
            Complementary
          </Heading>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                to="/shop/$productSlug"
                params={{ productSlug: rel.slug }}
                className="group flex flex-col justify-between rounded-xl bg-white p-4 t-lift"
              >
                <div>
                  <ShopMedia
                    src={rel.image}
                    alt={rel.name}
                    tone="cream"
                    className="rounded-lg"
                    imgClassName="t-zoom"
                  />
                  <h3 className="mt-3 line-clamp-1 text-label text-fg">{rel.name}</h3>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-label text-fg tabular-nums">
                    £{parseFloat(String(rel.price)).toFixed(2)}
                  </span>
                  <span className="text-caption text-subtle">View details →</span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
