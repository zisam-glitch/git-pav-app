import { useState, useEffect } from "react";
import { CheckCircle2, ShoppingBag, Truck, ShieldCheck, Plus, Minus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "./shop-data";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ProductDetailProps {
  productSlug: string;
  onAddToCart: (product: Product, quantity: number, variant?: any) => void;
}

export function ProductDetail({ productSlug, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: () => api.products.getBySlug(productSlug),
    enabled: !!productSlug,
  });

  const variants = product?.variants || [];
  const images = (product?.image && product.image.length > 0)
    ? [product.image]
    : ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85"];

  // Auto-select first variant when product loads
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  const handleVariantSelect = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
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

  const isCurrentInStock = variants.length > 0
    ? (activeVariant ? activeVariant.stock_qty > 0 : false)
    : (product?.in_stock ?? true);

  const currentStockQty = activeVariant ? activeVariant.stock_qty : (product?.total_stock ?? 50);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 border-2  border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-bold text-fg">Product Not Found</h1>
          <p className="mt-2 text-sm text-muted">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild variant="outline" className="mt-4">
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
    onAddToCart(
      {
        ...productData,
        name: activeVariant
          ? `${productData.name} - ${Object.values(activeVariant.attributes).join(", ")}`
          : productData.name,
      },
      quantity,
      activeVariant
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  // Structured data for SEO
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
    <div className="min-h-screen bg-[#fffdf9] text-fg">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-[#faf6f0]  ">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <a 
            href="/shop" 
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Shop</span>
          </a>
        </div>
      </div>

      {/* Product Details */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#faf6f0]  ">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={productData.name}
                className="size-full object-cover transition-all duration-300"
              />
              {productData.badge && (
                <span className="absolute top-4 left-4 rounded-full bg-[#925a27] text-white text-xs font-bold px-4 py-1 shadow-sm">
                  {productData.badge}
                </span>
              )}
            </div>

            {/* Thumbnails if multiple images */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative size-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 ${
                      selectedImageIndex === idx
                        ? " ring-2 ring-[#925a27]/20"
                        : " opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-primary uppercase">
                {productData.categoryLabel}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-fg mt-2">
                {productData.name}
              </h1>
            </div>

            {/* Price & Stock Badge */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-3xl font-bold text-[#925a27]">
                £{currentPrice.toFixed(2)}
              </span>
              {productData.originalPrice && (
                <span className="text-lg text-muted line-through">
                  £{productData.originalPrice.toFixed(2)}
                </span>
              )}
              {isCurrentInStock ? (
                <span className="text-xs font-medium text-[#925a27] bg-[#faf6f0]   px-3 py-1 rounded-md">
                  {currentStockQty < 10
                    ? `Low Stock · Only ${currentStockQty} left`
                    : "In Stock & Ready to Dispatch"}
                </span>
              ) : (
                <span className="text-xs font-medium text-red-700 bg-red-50   px-3 py-1 rounded-md">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="space-y-2.5 pt-2  ">
                <span className="block text-xs font-bold text-fg uppercase">
                  Select Option:
                </span>
                {variantError && (
                  <div className="text-xs text-red-700 bg-red-50   px-3 py-2 rounded-md">
                    {variantError}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = (selectedVariantId ? selectedVariantId === v.id : variants[0]?.id === v.id);
                    const label = Object.entries(v.attributes || {})
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(" / ") || v.sku;
                    const outOfStock = v.stock_qty <= 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v.id)}
                        disabled={outOfStock}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold  transition-all focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 ${
                          isSelected
                            ? " bg-[#925a27] text-white shadow-sm"
                            : outOfStock
                            ? " bg-[#faf6f0] text-[#6b5848] line-through cursor-not-allowed"
                            : " bg-[#faf8f5] text-fg hover:border-[#925a27]"
                        }`}
                      >
                        {label} {v.price_override ? `(+£${(parseFloat(String(v.price_override)) - parseFloat(String(product.price))).toFixed(2)})` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-muted leading-relaxed">
              {productData.fullDesc || productData.shortDesc}
            </p>

            {/* Clinical Features */}
            {productData.features && productData.features.length > 0 && (
              <div className="  pt-6 space-y-3">
                <p className="text-sm font-bold text-fg">Clinical Highlights:</p>
                {productData.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-muted">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* How to use */}
            {productData.howToUse && (
              <div className="bg-[#faf6f0] rounded-xl p-4 text-sm text-muted  ">
                <span className="font-bold text-fg block mb-1">Directions for Use:</span>
                <span>{productData.howToUse}</span>
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-xs text-muted">
              <div className="flex items-center gap-2">
                <Truck className="size-5 text-primary" />
                <span>Free UK Delivery over £40</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <span>Clinical Guarantee</span>
              </div>
            </div>

            {/* Quantity and Add to Bag */}
            <div className="pt-4 flex items-center gap-4">
              <div className="flex items-center rounded-xl   bg-[#faf8f5] px-3 py-2">
                <button
                  type="button"
                  disabled={!isCurrentInStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-8 flex items-center justify-center text-muted hover:text-fg disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-base font-semibold">{quantity}</span>
                <button
                  type="button"
                  disabled={!isCurrentInStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-8 flex items-center justify-center text-muted hover:text-fg disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <Button
                onClick={handleAdd}
                size="lg"
                disabled={!isCurrentInStock}
                className="flex-1 bg-[#925a27] hover:bg-[#7a491e] text-white text-sm font-semibold shadow-sm gap-2 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2"
              >
                <ShoppingBag className="size-5" />
                <span>
                  {!isCurrentInStock
                    ? "Out of Stock"
                    : added
                    ? "Added to Bag!"
                    : `Add to Bag · £${(currentPrice * quantity).toFixed(2)}`}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-20 pt-12  ">
            <h2 className="font-display text-2xl font-bold text-fg mb-6">
              Complementary Oral Care
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((rel: any) => (
                <a
                  key={rel.id}
                  href={`/shop/${rel.slug}`}
                  className="group rounded-xl   bg-[#fffdf9] p-4 transition-all hover:shadow-md hover:border-[#925a27] focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#faf6f0] mb-3">
                    <img
                      src={rel.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"}
                      alt={rel.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-fg group-hover:text-primary transition-colors line-clamp-1">
                    {rel.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm text-[#925a27]">
                      £{parseFloat(rel.price).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-muted">View details →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}