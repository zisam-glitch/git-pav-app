import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink, FaqList, Heading, Section, type FaqItem } from "@/components/hims";
import { CONTAINER, MUTED_TITLE, SOFT_CARD, TITLE } from "@/components/pricing/tokens";
import { Button } from "@/components/ui/button";
import { api, HAS_API_BASE, type ProductVariant } from "@/lib/api";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";
import {
  FREE_UK_DELIVERY_THRESHOLD,
  getCatalogProductBySlug,
  getRelatedCatalogProducts,
  mapApiProduct,
  SHOP_DISPATCH_ADDRESS,
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

  const currentStockQty = activeVariant
    ? activeVariant.stock_qty
    : (resolvedProduct.totalStock ?? 25);

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

  const qualifiesFreeDelivery = currentPrice * quantity >= FREE_UK_DELIVERY_THRESHOLD;

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
        <div className="space-y-3 text-small leading-relaxed text-muted">
          <p>
            <strong className="font-medium text-fg">UK Tracked Delivery:</strong> Free on orders
            over £{FREE_UK_DELIVERY_THRESHOLD}. Orders under £{FREE_UK_DELIVERY_THRESHOLD} ship via
            Royal Mail Tracked for £{STANDARD_UK_DELIVERY_FEE.toFixed(2)}. Orders placed before 2 PM
            Monday–Friday are dispatched the same working day from {SHOP_DISPATCH_ADDRESS}.
          </p>
          <p>
            <strong className="font-medium text-fg">Clinic Click &amp; Collect:</strong> Free
            collection directly from Pav Dental Bradford, 786 Leeds Road, BD3 9TY.
          </p>
          <p>
            <strong className="font-medium text-fg">14-Day UK Returns:</strong> Return any unopened,
            sealed oral hygiene product or unused device within 14 days of delivery for a full
            refund in line with UK distance-selling regulations.
          </p>
        </div>
      ),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productData.name,
    image: images.map((img) =>
      img.startsWith("/") ? `https://www.pavdental.com${img}` : img,
    ),
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
      <div className={`${CONTAINER} py-5`} aria-label="Breadcrumb">
        <nav className="flex flex-wrap items-center gap-2 text-small text-[#6d6e72]">
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
      </div>

      {/* Hims Split PDP Stage (Mobbin 43693059 + 16099344) */}
      <section className="pb-14 md:pb-24">
        <div className={`${CONTAINER} grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14`}>
          {/* Left: Full-bleed Warm Cream Product Stage with Bottom-Centered Circular Thumbnails */}
          <div className="lg:sticky lg:top-24 lg:col-span-6">
            <div className="relative overflow-hidden rounded-[24px] bg-[#f4f3e0]">
              <div className="relative aspect-square w-full overflow-hidden">
                <ShopMedia
                  src={images[selectedImageIndex]}
                  alt={productData.name}
                  tone="cream"
                  priority
                  className="size-full rounded-none bg-transparent"
                />
                {productData.badge ? (
                  <span className="absolute top-4 left-4 rounded-full bg-[#dff1e4] px-3.5 py-1 text-[12px] text-[#256b3b]">
                    {productData.badge}
                  </span>
                ) : null}
              </div>

              {images.length > 1 ? (
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <div
                    role="tablist"
                    aria-label="Product views"
                    className="inline-flex items-center gap-2.5 rounded-full bg-white/90 px-3 py-2 shadow-[0_8px_24px_rgba(20,20,40,0.1)]"
                  >
                    {images.map((img, idx) => {
                      const active = selectedImageIndex === idx;
                      return (
                        <button
                          key={img + idx}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setSelectedImageIndex(idx)}
                          aria-label={`View image ${idx + 1} of ${images.length}`}
                          className={cn(
                            "relative size-11 shrink-0 overflow-hidden rounded-full border-2 t-colors",
                            active
                              ? "border-black ring-2 ring-black/15"
                              : "border-border opacity-70 hover:opacity-100",
                          )}
                        >
                          <img
                            src={img}
                            alt={`${productData.name} view ${idx + 1}`}
                            className="size-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: Editorial Details, Option Cards, Full-Width Black Pill CTA, Clinical Callout & Hairline Accordions */}
          <div className="space-y-6 lg:col-span-6">
            <div>
              <Link
                to="/category/$slug"
                params={{ slug: productData.category }}
                className="inline-flex items-center rounded-full bg-[#efefec] px-3 py-1 text-[12px] text-[#1b1b1b] t-colors hover:bg-[#e6e6e2]"
              >
                {productData.categoryLabel}
              </Link>
              <h1 className="mt-3 text-[clamp(30px,3.2vw,44px)] leading-[1.06] font-normal tracking-[-0.02em] text-[#1b1b1b]">
                {productData.name}
              </h1>
            </div>

            {/* Price & Stock Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[26px] text-[#1b1b1b] tabular-nums">£{currentPrice.toFixed(2)}</span>
              {productData.originalPrice ? (
                <span className="text-lead text-muted line-through tabular-nums">
                  £{productData.originalPrice.toFixed(2)}
                </span>
              ) : null}
              {isCurrentInStock ? (
                <span className="rounded-full bg-[#dff1e4] px-3 py-1 text-[12px] text-[#256b3b]">
                  {currentStockQty < 10
                    ? `Low Stock · Only ${currentStockQty} left`
                    : "In Stock · Ready to Dispatch"}
                </span>
              ) : (
                <span className="rounded-full bg-[#f4e3df] px-3 py-1 text-[12px] text-[#8a4242]">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Clinical Description */}
            <p className="text-[16px] leading-[1.55] text-[#55565a]">
              {productData.fullDesc || productData.shortDesc}
            </p>

            {/* Hims Selectable Option / Variant Cards (Mobbin 43693059) */}
            {variants.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-small font-medium text-fg">Choose Option</p>
                  {activeVariant?.sku ? (
                    <span className="font-mono text-caption text-subtle">{activeVariant.sku}</span>
                  ) : null}
                </div>
                {variantError ? (
                  <p role="alert" className="rounded-lg bg-sand px-3.5 py-2 text-small text-danger">
                    {variantError}
                  </p>
                ) : null}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {variants.map((v) => {
                    const isSelected = activeVariant?.id === v.id;
                    const label =
                      Object.values(v.attributes || {}).join(" · ") || v.sku;
                    const attrKey = Object.keys(v.attributes || {})[0];
                    const optionPrice = v.price_override
                      ? parseFloat(String(v.price_override))
                      : resolvedProduct.price;
                    const outOfStock = v.stock_qty <= 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v.id)}
                        disabled={outOfStock}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex items-start justify-between gap-3 rounded-2xl border p-4 text-left t-colors",
                          isSelected
                            ? "border-black bg-white shadow-[0_8px_24px_rgba(20,20,40,0.08)]"
                            : outOfStock
                              ? "cursor-not-allowed border-[#e4e1da] bg-[#f6f6f4] text-subtle opacity-60"
                              : "border-[#e4e1da] bg-white hover:border-[#bdb8ad]",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 t-colors",
                              isSelected
                                ? "border-black bg-black text-white"
                                : "border-border-strong bg-white",
                            )}
                          >
                            {isSelected ? <Check className="size-3" /> : null}
                          </span>
                          <div>
                            {attrKey ? (
                              <span className="block text-caption text-subtle">{attrKey}</span>
                            ) : null}
                            <span className="block text-small font-medium text-fg">{label}</span>
                            <span className="mt-0.5 block text-caption text-muted">
                              {outOfStock ? "Out of stock" : "In stock"}
                            </span>
                          </div>
                        </div>
                        <span className="text-small font-medium text-fg tabular-nums">
                          £{optionPrice.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Clean Delivery & Dispatch Summary Strip */}
            <div className="rounded-2xl bg-[#f6f6f4] p-4">
              <div className="grid grid-cols-1 gap-3 text-small sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-terracotta" />
                  <div>
                    <p className="font-medium text-fg">
                      {qualifiesFreeDelivery
                        ? "Qualifies for Free UK Delivery"
                        : `Free UK Delivery over £${FREE_UK_DELIVERY_THRESHOLD}`}
                    </p>
                    <p className="text-caption text-muted">
                      £{STANDARD_UK_DELIVERY_FEE.toFixed(2)} standard Royal Mail Tracked
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <RotateCcw aria-hidden className="mt-0.5 size-4 shrink-0 text-terracotta" />
                  <div>
                    <p className="font-medium text-fg">14-Day UK Returns</p>
                    <p className="text-caption text-muted">On unopened hygiene items</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & Full-Width Black Pill CTA */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-small font-medium text-fg">Quantity</span>
                <div className="inline-flex h-11 items-center rounded-full border border-[#d6d2c8] bg-white px-2">
                  <button
                    type="button"
                    disabled={!isCurrentInStock || quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid size-8 place-items-center rounded-pill text-muted t-colors hover:text-fg disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus aria-hidden className="size-4" />
                  </button>
                  <span className="w-10 text-center text-label tabular-nums text-fg">
                    {quantity}
                  </span>
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
              </div>

              <Button
                type="button"
                onClick={handleAdd}
                disabled={!isCurrentInStock}
                className="h-14 w-full rounded-full bg-black text-[16px] text-white hover:bg-black/85"
              >
                <ShoppingBag aria-hidden className="size-4" />
                <span>
                  {!isCurrentInStock
                    ? "Out of Stock"
                    : added
                      ? "Added to Bag"
                      : `Add to Bag · £${(currentPrice * quantity).toFixed(2)}`}
                </span>
              </Button>
            </div>

            {/* Clinical Care Callout Card (Mobbin 43693059) */}
            <div className={`${SOFT_CARD} p-5`}>
              <div className="flex items-start gap-3.5">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f4f1ea] text-[#1b1b1b]">
                  <ShieldCheck aria-hidden className="size-5" />
                </div>
                <div className="text-small">
                  <p className="font-medium text-fg">Made by Happy Tooth, our sister company</p>
                  <p className="mt-1 leading-relaxed text-muted">
                    Unsure whether this suits your teeth or gums? Call{" "}
                    <a
                      href={PRACTICE_PHONE_HREF}
                      className="font-medium text-fg underline underline-offset-4 hover:text-terracotta"
                    >
                      {PRACTICE_PHONE}
                    </a>{" "}
                    or book a{" "}
                    <Link
                      to="/services/virtual-dentistry"
                      className="font-medium text-fg underline underline-offset-4 hover:text-terracotta"
                    >
                      virtual dental consultation
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Stacked Hims Hairline Accordions (Mobbin 16099344) */}
            <div className="pt-2">
              <FaqList items={accordionItems} defaultOpen={0} />
            </div>
          </div>
        </div>
      </section>

      {/* Hims Clinical Spec Summary Card on Warm Sand (Mobbin fceeec4f) */}
      {productData.clinicalSpec ? (
        <section aria-label="Clinical specification summary" className="bg-[#f7f5f2] py-14 md:py-24">
          <div className={`${CONTAINER} grid items-start gap-8 lg:grid-cols-12 lg:gap-12`}>
            <div className="lg:col-span-4">
              <p className="text-small text-[#55565a]">Clinical Specification</p>
              <h2 className="mt-3 text-[clamp(28px,3vw,44px)] leading-[1.05] font-normal tracking-[-0.02em] text-[#1b1b1b]">
                Product details <span className={MUTED_TITLE}>at a glance</span>
              </h2>
              <p className="mt-3 text-small leading-relaxed text-muted">
                Key formulation, suitability, and Bradford dispensary details reviewed by our
                dental team.
              </p>
            </div>

            <div className={`${SOFT_CARD} p-6 md:p-8 lg:col-span-8`}>
              <dl className="divide-y divide-border">
                <div className="grid grid-cols-1 gap-1 py-4 first:pt-0 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-small font-medium text-subtle">Key Ingredients / Build</dt>
                  <dd className="text-small text-fg sm:col-span-2">
                    {productData.clinicalSpec.activeIngredient}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-small font-medium text-subtle">Format</dt>
                  <dd className="text-small text-fg sm:col-span-2">
                    {productData.clinicalSpec.format}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-small font-medium text-subtle">Pack Contents</dt>
                  <dd className="text-small text-fg sm:col-span-2">
                    {productData.clinicalSpec.packSize}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-small font-medium text-subtle">Clinical Suitability</dt>
                  <dd className="text-small text-fg sm:col-span-2">
                    {productData.clinicalSpec.suitability}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-4 last:pb-0 sm:grid-cols-3 sm:gap-4">
                  <dt className="flex items-center gap-1.5 text-small font-medium text-subtle">
                    <MapPin aria-hidden className="size-3.5 text-terracotta" />
                    <span>Dispatched From</span>
                  </dt>
                  <dd className="text-small text-fg sm:col-span-2">
                    Pav Dental Clinic, {productData.clinicalSpec.dispatchOrigin}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      ) : null}

      {/* Complementary Oral Care Related Products Strip */}
      {relatedProducts.length > 0 ? (
        <section aria-label="Complementary oral care products" className="bg-white py-14 md:py-24">
          <div className={CONTAINER}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className={TITLE}>
              Complementary <span className={MUTED_TITLE}>Oral Care</span>
            </h2>
            <Link
              to="/shop"
              className="text-small font-medium text-fg underline underline-offset-4 t-colors hover:text-terracotta"
            >
              View all products
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                to="/shop/$productSlug"
                params={{ productSlug: rel.slug }}
                className="group flex flex-col justify-between rounded-[20px] bg-[#f4f3e0] p-4 t-colors hover:bg-[#eeedd6]"
              >
                <div>
                  <ShopMedia
                    src={rel.image}
                    alt={rel.name}
                    ratio="4 / 3"
                    tone="cream"
                    className="rounded-lg"
                    imgClassName="t-zoom"
                  />
                  <p className="mt-3 text-caption text-subtle">{rel.categoryLabel}</p>
                  <h3 className="mt-1 line-clamp-2 text-label text-fg">{rel.name}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-label text-fg tabular-nums">
                    £{parseFloat(String(rel.price)).toFixed(2)}
                  </span>
                  <span className="text-caption font-medium text-muted group-hover:text-terracotta">
                    View details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
