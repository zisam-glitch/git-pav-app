import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ChevronRight, Minus, Package, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink, FaqList, Heading, Section, type FaqItem } from "@/components/hims";
import { Chip } from "@/components/hims/chip";
import { ChoiceCards } from "@/components/hims/choice-cards";
import { ProductCard } from "@/components/hims/product-card";
import { ProductGallery } from "@/components/hims/product-gallery";
import { Button } from "@/components/ui/button";
import { api, HAS_API_BASE, type ProductVariant } from "@/lib/api";
import {
  FREE_UK_DELIVERY_THRESHOLD,
  getCatalogProductBySlug,
  getRelatedCatalogProducts,
  mapApiProduct,
  STANDARD_UK_DELIVERY_FEE,
} from "./shop-catalog-data";
import type { Product } from "./shop-data";
import { ShopMedia } from "./shop-media";

interface ProductDetailProps {
  productSlug: string;
  onAddToCart: (product: Product, quantity: number, variant?: ProductVariant | null) => void;
}

function hasUsableImage(src?: string): src is string {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname !== "images.unsplash.com"
    );
  } catch {
    return false;
  }
}

export function ProductDetail({ productSlug, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  const fallbackProduct = useMemo(() => getCatalogProductBySlug(productSlug), [productSlug]);

  const { data: apiProduct, isLoading } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: () => api.products.getBySlug(productSlug),
    enabled: HAS_API_BASE && !!productSlug,
    retry: false,
  });

  const resolvedProduct: Product | null = useMemo(() => {
    if (apiProduct) return mapApiProduct(apiProduct);
    return fallbackProduct ?? null;
  }, [apiProduct, fallbackProduct]);

  useEffect(() => {
    setQuantity(1);
    setSelectedImageIndex(0);
    setSelectedVariantId(null);
    setVariantError(null);
    setAdded(false);
  }, [productSlug]);

  const variants = useMemo(() => resolvedProduct?.variants ?? [], [resolvedProduct?.variants]);

  const images = useMemo(() => {
    const gallery = (resolvedProduct?.images ?? []).filter((url): url is string =>
      hasUsableImage(url),
    );
    if (gallery.length > 0) return gallery;
    if (hasUsableImage(resolvedProduct?.image)) return [resolvedProduct.image];
    return [];
  }, [resolvedProduct?.images, resolvedProduct?.image]);

  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      const firstAvailable = variants.find((v) => v.stock_qty > 0) || variants[0];
      setSelectedVariantId(firstAvailable.id);
    }
  }, [variants, selectedVariantId]);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  const handleVariantSelect = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) {
      setVariantError("Selected option is not available.");
      return;
    }
    if (variant.stock_qty <= 0) {
      setVariantError("This option is currently out of stock.");
      return;
    }
    setSelectedVariantId(variantId);
    setVariantError(null);
  };

  const relatedProducts = useMemo(() => {
    if (!resolvedProduct) return [];
    if (resolvedProduct.relatedProducts && resolvedProduct.relatedProducts.length > 0) {
      return resolvedProduct.relatedProducts;
    }
    return getRelatedCatalogProducts(resolvedProduct.slug, resolvedProduct.category, 4);
  }, [resolvedProduct]);

  if (isLoading && !resolvedProduct) {
    return (
      <Section theme="white" className="min-h-[60vh]">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-fg border-t-transparent" />
          <p className="mt-4 text-small text-muted">Loading product details...</p>
        </div>
      </Section>
    );
  }

  if (!resolvedProduct) {
    return (
      <Section theme="white" className="min-h-[60vh]">
        <div className="mx-auto max-w-md py-20 text-center">
          <Heading as="h1" size="h2-md">
            Product Not Found
          </Heading>
          <p className="mt-3 text-body text-muted">
            The product you&apos;re looking for doesn&apos;t exist or is no longer listed.
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

  const currentPrice = activeVariant?.price_override
    ? typeof activeVariant.price_override === "string"
      ? parseFloat(activeVariant.price_override)
      : activeVariant.price_override
    : resolvedProduct.price;

  const isCurrentInStock =
    variants.length > 0
      ? activeVariant
        ? activeVariant.stock_qty > 0
        : false
      : resolvedProduct.inStock;

  const productData: Product = {
    ...resolvedProduct,
    price: currentPrice,
    image: images[selectedImageIndex] || images[0] || resolvedProduct.image,
    inStock: isCurrentInStock,
  };

  const handleAdd = () => {
    onAddToCart(productData, quantity, activeVariant);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const accordionItems: FaqItem[] = [
    ...(productData.features.length > 0 || (productData.whatsIncluded?.length ?? 0) > 0
      ? [
          {
            q: "Clinical Highlights & What's Included",
            a: (
              <div className="space-y-4">
                {productData.features.length > 0 ? (
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
                ) : null}
                {productData.whatsIncluded && productData.whatsIncluded.length > 0 ? (
                  <div className="rounded-lg border border-border bg-cream p-4">
                    <p className="flex items-center gap-2 text-small font-medium text-fg">
                      <Package aria-hidden className="size-4 text-terracotta" />
                      <span>In the box</span>
                    </p>
                    <ul className="mt-2 space-y-1.5 text-small text-muted">
                      {productData.whatsIncluded.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
    ...(productData.howToUse
      ? [
          {
            q: "Directions for Use",
            a: <p className="text-small leading-relaxed text-muted">{productData.howToUse}</p>,
          },
        ]
      : []),
    {
      q: "UK Delivery & Returns",
      a: (
        <p className="text-small leading-relaxed text-muted">
          <strong className="font-medium text-fg">UK Tracked Delivery:</strong> Free on orders over
          £{FREE_UK_DELIVERY_THRESHOLD}. Orders under £{FREE_UK_DELIVERY_THRESHOLD} ship via Royal
          Mail Tracked for £{STANDARD_UK_DELIVERY_FEE.toFixed(2)}.
        </p>
      ),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productData.name,
    image: images.map((img) => (img.startsWith("/") ? `https://www.pavdental.com${img}` : img)),
    description: productData.shortDesc || productData.fullDesc,
    brand: {
      "@type": "Brand",
      name: "Pav Dental",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.pavdental.com/shop/${productData.slug}`,
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

      {/* Clean Hims Breadcrumb Bar */}
      <Section
        theme="white"
        space="none"
        className="border-b border-border py-4"
        aria-label="Breadcrumb"
      >
        <nav className="flex flex-wrap items-center gap-2 text-small text-muted">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 font-medium text-muted t-colors hover:text-fg"
          >
            <ArrowLeft aria-hidden className="size-4" />
            <span>Shop</span>
          </Link>
          <ChevronRight aria-hidden className="size-3.5 text-subtle" />
          <Link
            to="/category/$slug"
            params={{ slug: productData.category }}
            className="t-colors hover:text-fg"
          >
            {productData.categoryLabel}
          </Link>
          <ChevronRight aria-hidden className="size-3.5 text-subtle" />
          <span className="truncate text-fg">{productData.name}</span>
        </nav>
      </Section>

      {/* Hims PDP hero (shop-pdp-notes.md): gallery 889 left, side rail 389 right, 66px gutter */}
      <Section theme="white" space="none" className="py-8 md:py-[60px]">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,889fr)_minmax(0,389fr)] lg:gap-[66px]">
          <ProductGallery
            images={images}
            alt={productData.name}
            badge={productData.badge ? <Chip tone="rust">{productData.badge}</Chip> : undefined}
          />

          <div className="flex min-w-0 flex-col gap-5">
            <div>
              <Link
                to="/category/$slug"
                params={{ slug: productData.category }}
                className="inline-flex rounded-pill"
              >
                <Chip tone="gold">{productData.categoryLabel}</Chip>
              </Link>
              <Heading as="h1" size="h2-md" className="mt-3">
                {productData.name}
              </Heading>
            </div>

            <p className="text-lead text-muted">{productData.fullDesc || productData.shortDesc}</p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-h3 text-fg tabular-nums">£{currentPrice.toFixed(2)}</span>
              {productData.originalPrice ? (
                <span className="text-lead text-muted line-through tabular-nums">
                  £{productData.originalPrice.toFixed(2)}
                </span>
              ) : null}
              {!isCurrentInStock ? <Chip tone="sand">Out of Stock</Chip> : null}
            </div>

            {variants.length > 0 ? (
              <ChoiceCards
                legend="Choose Option"
                name="product-option"
                value={activeVariant?.id ?? null}
                onChange={handleVariantSelect}
                error={variantError}
                options={variants.map((v) => {
                  const optionPrice = v.price_override
                    ? parseFloat(String(v.price_override))
                    : resolvedProduct.price;
                  return {
                    value: v.id,
                    title: Object.values(v.attributes || {}).join(" · ") || v.sku,
                    detail: `£${optionPrice.toFixed(2)}${v.stock_qty <= 0 ? " · Out of stock" : ""}`,
                    disabled: v.stock_qty <= 0,
                  };
                })}
              />
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <span className="text-label">Quantity</span>
              <div className="inline-flex h-12 items-center rounded-pill border border-black/19 bg-white px-2">
                <button
                  type="button"
                  disabled={!isCurrentInStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid size-10 place-items-center rounded-pill text-muted t-colors hover:text-fg disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus aria-hidden className="size-4" />
                </button>
                <span className="w-10 text-center text-label tabular-nums text-fg">{quantity}</span>
                <button
                  type="button"
                  disabled={!isCurrentInStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="grid size-10 place-items-center rounded-pill text-muted t-colors hover:text-fg disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus aria-hidden className="size-4" />
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAdd}
              disabled={!isCurrentInStock}
              className="h-12 w-full rounded-pill text-body"
            >
              {!isCurrentInStock
                ? "Out of Stock"
                : added
                  ? "Added to Bag"
                  : `Add to Bag · £${(currentPrice * quantity).toFixed(2)}`}
            </Button>

            <FaqList items={accordionItems} defaultOpen={0} />
          </div>
        </div>
      </Section>

      {productData.clinicalSpec ? (
        <Section
          theme="cream"
          space="none"
          className="py-8 md:py-[60px]"
          aria-label="Product specification"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-28">
            <Heading as="h2" size="h3-md" accent="at a glance" tone="terracotta">
              Product details
            </Heading>
            <dl className="m-0">
              {[
                ["Key Ingredients / Build", productData.clinicalSpec.activeIngredient],
                ["Format", productData.clinicalSpec.format],
                ["Pack Contents", productData.clinicalSpec.packSize],
                ["Clinical Suitability", productData.clinicalSpec.suitability],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 border-b border-border py-[18px] first:pt-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6"
                >
                  <dt className="text-label">{label}</dt>
                  <dd className="m-0 text-body text-muted">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>
      ) : null}

      {relatedProducts.length > 0 ? (
        <Section
          theme="white"
          space="none"
          className="py-8 md:py-[60px]"
          aria-label="Complementary oral care products"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading as="h2" size="h3-md" accent="Oral Care" tone="terracotta" inline>
              Complementary
            </Heading>
            <Link
              to="/shop"
              className="text-small font-medium text-fg underline underline-offset-4 t-colors hover:text-terracotta"
            >
              View all products
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                media={
                  <Link
                    to="/shop/$productSlug"
                    params={{ productSlug: rel.slug }}
                    aria-label={`View ${rel.name}`}
                    className="block"
                  >
                    <ShopMedia
                      src={rel.image}
                      alt={rel.name}
                      ratio="4 / 3"
                      tone="sand"
                      className="rounded-md"
                    />
                  </Link>
                }
                title={
                  <Link
                    to="/shop/$productSlug"
                    params={{ productSlug: rel.slug }}
                    className="t-colors hover:text-terracotta"
                  >
                    {rel.name}
                  </Link>
                }
                meta={
                  <span className="tabular-nums">£{parseFloat(String(rel.price)).toFixed(2)}</span>
                }
              />
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
