import { useState } from "react";
import { X, ShoppingBag, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "./shop-data";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative my-8 w-full max-w-2xl rounded-[1.5rem] border border-black/10 bg-[#FBF8F5] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.2)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/65 transition-colors hover:bg-[#F2EDE5] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745]"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-[1.25rem] bg-[#EFE4C8] p-6 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full w-full object-contain"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 rounded-full bg-[#1B3745] px-3 py-1 text-[11px] font-medium text-white">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium text-[#754B3D]">
                {product.categoryLabel}
              </span>
              <h2 className="mt-1 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                {product.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="font-display text-2xl font-normal tabular-nums text-black">
                £{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm tabular-nums text-black/45 line-through">
                  £{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="rounded-full bg-[#F2EDE5] px-2.5 py-0.5 text-[11px] font-medium text-black/75">
                In Stock
              </span>
            </div>

            <p className="text-xs leading-relaxed text-black/65 sm:text-sm">
              {product.fullDesc || product.shortDesc}
            </p>

            {product.features.length > 0 && (
              <div className="border-t border-black/10 pt-3 space-y-1.5">
                <p className="text-xs font-medium text-black">Clinical Highlights</p>
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-black/70">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-black/70" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {product.howToUse && (
              <div className="rounded-2xl border border-black/8 bg-white p-3 text-xs text-black/65">
                <span className="block font-medium text-black mb-0.5">Directions for Use</span>
                <span>{product.howToUse}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex h-11 items-center rounded-full border border-black/12 bg-white px-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex size-7 items-center justify-center rounded-full text-black/60 hover:bg-[#F2EDE5] hover:text-black"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex size-7 items-center justify-center rounded-full text-black/60 hover:bg-[#F2EDE5] hover:text-black"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <Button onClick={handleAdd} className="h-11 flex-1 text-xs sm:text-sm">
                {added ? (
                  <>
                    <Check className="size-4" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    <span>Add to bag · £{(product.price * quantity).toFixed(2)}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
