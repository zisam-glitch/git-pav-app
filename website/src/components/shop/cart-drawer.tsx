import { useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "./shop-data";

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
  onClearCart,
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLabel, setPromoLabel] = useState("");

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
    try {
      const { api } = await import("@/lib/api");
      const res = await api.discounts.validate(promoCode.trim());
      if (res.valid && res.discount) {
        if (res.discount.type === "percentage") {
          setDiscountPercent(res.discount.value);
        } else {
          setDiscountPercent(Math.round((res.discount.value / (rawSubtotal || 1)) * 100));
        }
        const code = String(res.discount.code ?? promoCode).trim().toUpperCase();
        const amount =
          res.discount.type === "percentage"
            ? `-${res.discount.value}%`
            : `-£${Number(res.discount.value).toFixed(2)}`;
        setPromoLabel(`Promo ${code} applied (${amount})`);
        setPromoApplied(true);
      } else {
        alert(res.message || "Invalid promo code.");
      }
    } catch {
      alert("Failed to validate promo code.");
    }
  };

  const handleCheckout = () => {
    onClose();
    window.location.href = "/checkout";
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50-xs">
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-fg">
              Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-muted hover:bg-slate-200 hover:text-fg"
            aria-label="Close cart"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="bg-[#faf6f0] px-5 py-3 border-b border-primary/15 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium text-fg">
              <span className="flex items-center gap-1.5">
                <Truck className="size-3.5 text-primary" />
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-bold">You've unlocked Free UK Tracked Delivery!</span>
                ) : (
                  <span>Add £{amountNeededForFreeShipping.toFixed(2)} more for Free UK Delivery</span>
                )}
              </span>
              <span className="font-bold">{shippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#cf9448] to-[#925a27] rounded-full transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="size-12 mx-auto text-muted/40 stroke-[1.2]" />
              <p className="font-display text-lg font-bold text-fg">Your bag is empty</p>
              <p className="text-xs text-muted max-w-xs mx-auto">
                Explore our clinical dental care products to begin your smile routine.
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/40 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="size-16 rounded-xl object-cover border border-border/60 bg-[#faf6f0] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-fg line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-primary font-bold mt-0.5">
                      £{item.product.price.toFixed(2)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg border border-border/70 bg-[#faf8f5] px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="size-5 flex items-center justify-center text-muted hover:text-fg"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="size-5 flex items-center justify-center text-muted hover:text-fg"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-muted hover:text-rose-600 transition-colors p-1"
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
          <div className="p-5 border-t border-border/60 bg-[#faf8f5] space-y-3">
            {/* Promo code */}
            {!promoApplied ? (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 h-9 rounded-lg border border-border/70 bg-white px-3 text-xs placeholder:text-muted/60 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-9 px-3 rounded-lg bg-white border border-border/70 text-xs font-semibold text-fg hover:bg-[#faf6f0]"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span>{promoLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPromoApplied(false);
                    setPromoLabel("");
                    setDiscountPercent(0);
                    setPromoCode("");
                  }}
                  className="text-muted hover:text-fg font-bold"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Price lines */}
            <div className="space-y-1.5 text-xs text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-fg">£{rawSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-£{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>UK Delivery</span>
                <span>{shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-fg pt-1.5 border-t border-border/40">
                <span>Total</span>
                <span className="text-[#844d1e]">£{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                asChild
                className="w-1/3 text-xs h-11 border-border/70"
                onClick={onClose}
              >
                <a href="/cart">View Bag</a>
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 accent-gradient text-white text-xs sm:text-sm font-semibold h-11 shadow-xs gap-2"
              >
                <span>Secure Checkout</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted text-center pt-1">
              <Shield className="size-3 text-emerald-600" />
              <span>256-bit SSL encrypted checkout · 30-day returns</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

