import { CheckCircle2, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import type { Product } from "./shop-data";
import { ShopMedia } from "./shop-media";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

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
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/44 p-4"
    >
      <div
        className="relative my-8 w-full max-w-2xl rounded-xl bg-white p-6 shadow-card sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
          aria-label="Close dialog"
        >
          <X aria-hidden className="size-5" />
        </Button>

        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-cream">
            <ShopMedia src={product.image} alt={product.name} tone="cream" />
            {product.badge ? (
              <span className="absolute top-3 left-3 rounded-pill bg-brown px-3 py-1 text-caption font-medium text-white">
                {product.badge}
              </span>
            ) : null}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-caption font-medium text-subtle">{product.categoryLabel}</span>
              <h2 className="mt-1 text-h3-md text-fg">{product.name}</h2>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-h3-md text-fg tabular-nums">£{product.price.toFixed(2)}</span>
              {product.originalPrice ? (
                <span className="text-small text-muted line-through tabular-nums">
                  £{product.originalPrice.toFixed(2)}
                </span>
              ) : null}
              <span className="rounded-pill bg-sage px-3 py-1 text-caption font-medium text-fg">
                In Stock &amp; Ready to Dispatch
              </span>
            </div>

            <p className="text-small text-muted">{product.fullDesc}</p>

            {product.features.length > 0 ? (
              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-small font-medium text-fg">Clinical Highlights:</p>
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-small text-muted">
                    <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-terracotta" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {product.howToUse ? (
              <Tile tone="cream" className="p-3.5 text-small text-muted">
                <span className="mb-1 block font-medium text-fg">Directions for Use:</span>
                <span>{product.howToUse}</span>
              </Tile>
            ) : null}

            {/* Quantity and Add to Bag */}
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex h-12 items-center rounded-pill border-2 border-border-strong bg-white px-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid size-8 place-items-center rounded-pill text-muted t-colors hover:text-fg"
                  aria-label="Decrease quantity"
                >
                  <Minus aria-hidden className="size-3.5" />
                </button>
                <span className="w-8 text-center text-label tabular-nums text-fg">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="grid size-8 place-items-center rounded-pill text-muted t-colors hover:text-fg"
                  aria-label="Increase quantity"
                >
                  <Plus aria-hidden className="size-3.5" />
                </button>
              </div>

              <Button type="button" onClick={handleAdd} className="flex-1">
                <ShoppingBag aria-hidden className="size-4" />
                <span>
                  {added
                    ? "Added to Bag!"
                    : `Add to Bag · £${(product.price * quantity).toFixed(2)}`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
