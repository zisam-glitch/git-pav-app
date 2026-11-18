import { useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "./shop-data";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

const FREE_SHIPPING_THRESHOLD = 40.0;

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLabel, setPromoLabel] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : 3.99;
  const total = subtotal + shippingCost;
  const amountNeededForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const shippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoError(null);
    try {
      const { api } = await import("@/lib/api");
      const res = await api.discounts.validate(promoCode.trim());
      if (res.valid && res.discount) {
        if (res.discount.type === "percentage") {
          setDiscountPercent(res.discount.value);
        } else {
          setDiscountPercent(
            Math.round((res.discount.value / (rawSubtotal || 1)) * 100),
          );
        }
        const code = String(res.discount.code ?? promoCode).trim().toUpperCase();
        const amount =
          res.discount.type === "percentage"
            ? `-${res.discount.value}%`
            : `-£${Number(res.discount.value).toFixed(2)}`;
        setPromoLabel(`Promo ${code} applied (${amount})`);
        setPromoApplied(true);
      } else {
        setPromoError(res.message || "Invalid promo code.");
      }
    } catch {
      setPromoError("Failed to validate promo code.");
    }
  };

  const handleCheckout = () => {
    onClose();
    window.location.href = "/checkout";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="relative flex h-full w-full max-w-md flex-col justify-between bg-[#FBF8F5] shadow-[0_24px_64px_rgba(0,0,0,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 text-black" />
            <h2 className="font-display text-lg font-normal tracking-[-0.02em] text-black">
              Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full border border-black/10 bg-white text-black/65 transition-colors hover:bg-[#F2EDE5] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745]"
            aria-label="Close cart"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="border-b border-black/10 bg-[#FAF8F2] px-6 py-3.5 text-xs">
            <div className="mb-2 flex items-center justify-between font-medium text-black">
              <span className="flex items-center gap-1.5">
                <Truck className="size-3.5 text-[#1B3745]" />
                {isFreeShipping ? (
                  <span className="text-[#1B3745]">
                    You&apos;ve unlocked Free UK Tracked Delivery
                  </span>
                ) : (
                  <span>
                    Add £{amountNeededForFreeShipping.toFixed(2)} more for Free UK Delivery
                  </span>
                )}
              </span>
              <span className="tabular-nums text-black/60">{shippingProgress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-black transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#F2EDE5] text-[#1B3745]">
                <ShoppingBag className="size-6 stroke-[1.5]" />
              </div>
              <p className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                Your bag is empty
              </p>
              <p className="mx-auto max-w-xs text-xs leading-relaxed text-black/60">
                Explore our clinical dental care products to begin your daily routine.
              </p>
              <Button onClick={onClose} variant="outline" size="sm" className="mt-4">
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-black/10 rounded-[1.5rem] border border-black/8 bg-white px-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-start gap-3.5 py-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="size-16 shrink-0 rounded-xl border border-black/6 bg-[#FAF8F2] object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-black">
                      {item.product.name}
                    </p>
                    <p className="mt-0.5 text-xs font-medium tabular-nums text-black/65">
                      £{item.product.price.toFixed(2)}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-black/12 bg-[#FBF8F5] px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="flex size-6 items-center justify-center rounded-full text-black/60 hover:bg-white hover:text-black"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="flex size-6 items-center justify-center rounded-full text-black/60 hover:bg-white hover:text-black"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="rounded-full p-1.5 text-black/45 transition-colors hover:bg-[#F2EDE5] hover:text-[#8A3A34]"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="space-y-4 border-t border-black/10 bg-white p-6">
            {!promoApplied ? (
              <div>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    aria-label="Discount code"
                    placeholder="Discount code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-10 flex-1 rounded-xl border border-black/12 bg-[#FBF8F5] px-3.5 text-xs text-black placeholder:text-black/45 focus:border-black focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-full border border-black/12 bg-white px-4 text-xs font-medium text-black transition-colors hover:bg-[#F2EDE5]"
                  >
                    Apply
                  </button>
                </form>
                {promoError && (
                  <p className="mt-1.5 text-[11px] text-[#8A3A34]">{promoError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-black/8 bg-[#FAF8F2] px-3.5 py-2 text-xs">
                <span className="font-medium text-[#1B3745]">{promoLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPromoApplied(false);
                    setPromoLabel("");
                    setDiscountPercent(0);
                    setPromoCode("");
                  }}
                  className="font-medium text-black/60 underline hover:text-black"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-black/65">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium tabular-nums text-black">
                  £{rawSubtotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between font-medium text-[#754B3D]">
                  <span>Discount</span>
                  <span className="tabular-nums">-£{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>UK Delivery</span>
                <span className="font-medium tabular-nums text-black">
                  {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between border-t border-black/10 pt-2.5 text-sm font-medium text-black">
                <span>Total</span>
                <span className="tabular-nums">£{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <Button variant="outline" asChild className="h-11 w-1/3 text-xs" onClick={onClose}>
                <a href="/cart">View Bag</a>
              </Button>
              <Button onClick={handleCheckout} className="h-11 flex-1 text-xs sm:text-sm">
                <span>Secure Checkout</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-black/50">
              <Shield className="size-3 text-[#1B3745]" />
              <span>256-bit SSL encrypted checkout · 30-day returns</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
