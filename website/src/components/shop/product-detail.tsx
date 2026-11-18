import { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "./shop-data";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";

interface ProductDetailProps {
  productSlug: string;
  onAddToCart: (product: Product, quantity: number, variant?: any) => void;
}

const FALLBACK_IMAGE =
  "/media/hims/bento-whitening.jpg";

export function ProductDetail({ productSlug, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>("highlights");

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: () => api.products.getBySlug(productSlug),
    enabled: !!productSlug,
  });

  const variants = product?.variants || [];

  const images = useMemo(() => {
    const urls: string[] = [];
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      const sorted = [...product.images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      for (const img of sorted) {
        if (img.url && !urls.includes(img.url)) urls.push(img.url);
      }
    }
    if (product?.image && !urls.includes(product.image)) {
      urls.unshift(product.image);
    }
    if (urls.length === 0) {
      urls.push(FALLBACK_IMAGE);
    }
    return urls;
  }, [product]);

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
      : product?.in_stock ?? true;

  const currentStockQty = activeVariant ? activeVariant.stock_qty : product?.total_stock ?? 50;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF8F5] pt-28 pb-20 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[87rem] grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="aspect-square rounded-[1.5rem] bg-[#F2EDE5] animate-pulse" />
          <div className="space-y-5 pt-4">
            <div className="h-6 w-28 rounded-full bg-black/8 animate-pulse" />
            <div className="h-12 w-3/4 rounded-xl bg-black/8 animate-pulse" />
            <div className="h-5 w-full rounded-lg bg-black/6 animate-pulse" />
            <div className="h-12 w-full rounded-full bg-black/10 animate-pulse mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[75vh] bg-[#FBF8F5] pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[1.5rem] border border-black/8 bg-white p-10 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Pav Dental Shop
          </p>
          <h1 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black">
            Product Not Found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-black/65">
            The product you&apos;re looking for doesn&apos;t exist or is currently unavailable.
          </p>
          <Button asChild className="mt-7 h-11 px-7">
            <a href="/shop">Back to Shop</a>
          </Button>
        </div>
      </div>
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
    image: images[selectedImageIndex] || images[0],
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
    onAddToCart(productData, quantity, activeVariant);
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

  const accordionSections = [
    ...(productData.features.length > 0
      ? [
          {
            id: "highlights",
            title: "What you get & clinical highlights",
            content: (
              <ul className="space-y-2 text-sm leading-relaxed text-black/75">
                {productData.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-black/70" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(productData.fullDesc
      ? [
          {
            id: "overview",
            title: `About ${productData.name}`,
            content: (
              <p className="text-sm leading-relaxed text-black/70">{productData.fullDesc}</p>
            ),
          },
        ]
      : []),
    ...(productData.howToUse
      ? [
          {
            id: "directions",
            title: "How to use",
            content: (
              <p className="text-sm leading-relaxed text-black/70">{productData.howToUse}</p>
            ),
          },
        ]
      : []),
    {
      id: "delivery",
      title: "Delivery & clinical guarantee",
      content: (
        <ul className="space-y-2 text-sm leading-relaxed text-black/70">
          <li>Free UK tracked delivery on orders over £40 (Royal Mail 24/48 Tracked).</li>
          <li>Same-day dispatch on orders placed before 2 PM Monday–Friday.</li>
          <li>Clinic Click &amp; Collect available at 786 Leeds Road, Bradford BD3 9TY.</li>
          <li>30-day money-back guarantee on unopened oral care items.</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-fg pt-24 pb-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[108rem] px-3 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[87rem]">
          {/* Breadcrumb */}
          <div className="mb-6">
            <a
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-medium text-black/60 transition-colors hover:text-black"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Shop</span>
            </a>
          </div>

          {/* 2-Column Hims Product Split */}
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
            {/* Left: Warm Beige Gallery + Circular Thumbnails */}
            <div className="lg:sticky lg:top-28">
              <div
                className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-black/6 p-8 sm:p-12"
                style={{
                  background:
                    "linear-gradient(167deg, #EDE1C4 0%, #F7F1E3 45%, #EBE0C3 100%)",
                }}
              >
                {productData.badge && (
                  <span className="absolute top-5 left-5 z-10 rounded-full bg-[#1B3745] px-3.5 py-1 text-xs font-medium text-white">
                    {productData.badge}
                  </span>
                )}

                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={productData.name}
                  className="max-h-[78%] w-auto max-w-[85%] rounded-2xl object-contain transition-all duration-300 drop-shadow-[0_20px_35px_rgba(0,0,0,0.14)]"
                />

                {/* Circular Thumbnails overlaid at bottom center */}
                {images.length > 1 && (
                  <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-white/75 px-3 py-1.5 backdrop-blur-md">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        aria-label={`View image ${idx + 1}`}
                        className={`relative size-10 shrink-0 overflow-hidden rounded-full border-2 bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                          selectedImageIndex === idx
                            ? "border-black ring-2 ring-black/15 scale-105"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${productData.name} thumbnail ${idx + 1}`}
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Pill Badge, Title, Price, Full-width Pill CTAs, Hairline Accordions */}
            <div className="space-y-6">
              {/* Pill Badge Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#F2EDE5] px-3 py-1 text-xs font-medium text-black/75">
                  {productData.categoryLabel}
                </span>
                {isCurrentInStock ? (
                  <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[#1B3745]">
                    {currentStockQty < 10
                      ? `Low Stock · Only ${currentStockQty} left`
                      : "In Stock"}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-[#8A3A34]/10 px-3 py-1 text-xs font-medium text-[#8A3A34]">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* CareSans Display Title & Short Copy */}
              <div>
                <h1 className="font-display text-3xl font-normal leading-[1.08] tracking-[-0.04em] text-black sm:text-5xl">
                  {productData.name}
                </h1>
                {(productData.shortDesc || productData.fullDesc) && (
                  <p className="mt-4 text-base leading-relaxed text-black/65">
                    {productData.shortDesc || productData.fullDesc}
                  </p>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl font-normal tracking-[-0.02em] tabular-nums text-black sm:text-3xl">
                  £{currentPrice.toFixed(2)}
                </span>
                {productData.originalPrice && productData.originalPrice > currentPrice && (
                  <span className="text-base tabular-nums text-black/45 line-through">
                    £{productData.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div className="space-y-2.5 border-t border-black/10 pt-5">
                  <span className="block text-xs font-medium uppercase tracking-wider text-black/55">
                    Select Option
                  </span>
                  {variantError && (
                    <div className="rounded-xl bg-[#8A3A34]/10 px-3.5 py-2 text-xs text-[#8A3A34]">
                      {variantError}
                    </div>
                  )}
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
                          className={`rounded-full px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745] ${
                            isSelected
                              ? "bg-black text-white"
                              : outOfStock
                                ? "border border-black/10 bg-[#F2EDE5] text-black/40 line-through cursor-not-allowed"
                                : "border border-black/12 bg-white text-black hover:bg-[#F2EDE5]"
                          }`}
                        >
                          {label}{" "}
                          {v.price_override
                            ? `(+£${(
                                parseFloat(String(v.price_override)) -
                                parseFloat(String(product.price))
                              ).toFixed(2)})`
                            : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + Full-width Black Pill CTA + White Bordered Pill CTA */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 items-center rounded-full border border-black/12 bg-white px-2">
                    <button
                      type="button"
                      disabled={!isCurrentInStock}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex size-8 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-[#F2EDE5] hover:text-black disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums text-black">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={!isCurrentInStock}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex size-8 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-[#F2EDE5] hover:text-black disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <Button
                    onClick={handleAdd}
                    disabled={!isCurrentInStock}
                    className="h-12 flex-1 text-sm font-medium"
                  >
                    {added ? (
                      <>
                        <Check className="size-4" />
                        <span>Added to bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="size-4" />
                        <span>
                          {!isCurrentInStock
                            ? "Out of stock"
                            : `Add to bag · £${(currentPrice * quantity).toFixed(2)}`}
                        </span>
                      </>
                    )}
                  </Button>
                </div>

                <Button asChild variant="outline" className="h-12 w-full text-sm font-medium">
                  <a href={BOOKING_URL}>Book a clinical consultation</a>
                </Button>

                {added && (
                  <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-[#FAF8F2] px-4 py-2.5 text-xs text-black/80">
                    <span>Item added to your shopping bag.</span>
                    <a
                      href="/cart"
                      className="font-medium text-black underline underline-offset-4 hover:text-[#1B3745]"
                    >
                      View bag →
                    </a>
                  </div>
                )}

                <p className="text-xs leading-relaxed text-black/50 pt-1">
                  Free UK tracked delivery on orders over £40 · Dispatched from our Bradford clinic
                  at 786 Leeds Road.
                </p>
              </div>

              {/* Clean Hairline Accordions */}
              <div className="border-t border-b border-black/10 divide-y divide-black/10">
                {accordionSections.map((sec) => {
                  const isOpen = openAccordion === sec.id;
                  return (
                    <div key={sec.id}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenAccordion(isOpen ? null : sec.id)}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-[#1B3745] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745]"
                      >
                        <span className="text-sm font-medium text-black">{sec.title}</span>
                        <ChevronDown
                          className={`size-4 shrink-0 text-black/60 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && <div className="pb-5">{sec.content}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <div className="mt-20 border-t border-black/10 pt-14">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Complete your routine
              </p>
              <h2 className="mt-2 font-display text-2xl font-normal tracking-[-0.04em] text-black sm:text-3xl">
                Complementary Oral Care
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {product.relatedProducts.map((rel: any) => (
                  <a
                    key={rel.id}
                    href={`/shop/${rel.slug}`}
                    className="group flex flex-col justify-between rounded-[1.5rem] border border-black/8 bg-[#F7F6F3] p-5 transition-all hover:border-black/15 hover:bg-[#FAF8F2]"
                  >
                    <div>
                      <p className="text-xs font-medium text-[#754B3D]">
                        {rel.category_label || "Dental Care"}
                      </p>
                      <h3 className="mt-1.5 font-display text-lg font-normal leading-snug tracking-[-0.02em] text-black line-clamp-2">
                        {rel.name}
                      </h3>
                      <p className="mt-1.5 text-sm font-medium tabular-nums text-black">
                        £{parseFloat(rel.price).toFixed(2)}
                      </p>
                    </div>

                    <div className="my-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-white/80 p-3">
                      <img
                        src={rel.image || FALLBACK_IMAGE}
                        alt={rel.name}
                        className="h-full w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <span className="inline-flex h-10 w-full items-center justify-center rounded-full border border-black/12 bg-white text-xs font-medium text-black transition-colors group-hover:bg-black group-hover:text-white">
                      Learn more
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
