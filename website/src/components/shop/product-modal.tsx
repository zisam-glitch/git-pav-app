import { useState } from "react";
import { X, CheckCircle2, ShoppingBag, Truck, ShieldCheck, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "./shop-data";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-slate-100 text-muted hover:bg-slate-200 hover:text-fg"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          {/* Product Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#faf6f0] border border-border/60">
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 rounded-full bg-[#844d1e] text-white text-[11px] font-bold px-3 py-0.5 shadow-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                {product.categoryLabel}
              </span>
              <h2 className="font-display text-2xl font-bold text-fg mt-1">
                {product.name}
              </h2>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-2xl font-bold text-[#844d1e]">
                £{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted line-through">
                  £{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                In Stock & Ready to Dispatch
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {product.fullDesc}
            </p>

            {/* Clinical Features */}
            <div className="border-t border-border/50 pt-3 space-y-1.5">
              <p className="text-xs font-bold text-fg">Clinical Highlights:</p>
              {product.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-muted">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* How to use */}
            <div className="bg-[#faf6f0] rounded-xl p-3 text-xs text-muted">
              <span className="font-bold text-fg block mb-0.5">Directions for Use:</span>
              <span>{product.howToUse}</span>
            </div>

            {/* Quantity and Add to Bag */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-border/70 bg-[#faf8f5] px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-7 flex items-center justify-center text-muted hover:text-fg"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-7 flex items-center justify-center text-muted hover:text-fg"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <Button
                onClick={handleAdd}
                size="lg"
                className="flex-1 accent-gradient text-white text-xs sm:text-sm font-semibold shadow-xs gap-2"
              >
                <ShoppingBag className="size-4" />
                <span>{added ? "Added to Bag!" : `Add to Bag · £${(product.price * quantity).toFixed(2)}`}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

