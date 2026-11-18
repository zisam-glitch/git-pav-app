import { useCartStore } from "@/lib/cart-store";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const FREE_SHIPPING_THRESHOLD = 40;

export function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    appliedDiscount,
    applyDiscount,
    removeDiscount,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    syncCart,
  } = useCartStore();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync cart with API on mount
  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : 3.99;
  const total = getTotal(shippingCost);

  const amountNeededForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const res = await applyDiscount(promoCodeInput.trim());
    if (res.success) {
      setPromoMessage({ type: "success", text: res.message });
      setPromoCodeInput("");
    } else {
      setPromoMessage({ type: "error", text: res.message });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-20 rounded-full bg-[#faf6f0] border border-[#e2d4c0] flex items-center justify-center mb-4 text-muted">
          <ShoppingBag className="size-10" />
        </div>
        <h1 className="font-display text-3xl font-bold text-fg">Your Shopping Bag is Empty</h1>
        <p className="mt-2 text-sm text-muted max-w-sm">
          Explore our clinician-curated dental care solutions.
        </p>
        <Button asChild className="mt-6 accent-gradient text-white px-8 h-11">
          <a href="/shop">Start Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] text-fg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-[#e2d4c0] pb-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-fg">Shopping Bag</h1>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-muted hover:text-destructive transition-colors font-semibold"
          >
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="bg-white rounded-xl border border-[#e2d4c0] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-fg">
              {isFreeShipping ? "🎉 You've unlocked FREE UK Delivery!" : `Add £${amountNeededForFree.toFixed(2)} more for FREE UK Delivery`}
            </span>
            <span className="text-muted font-medium">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-[#faf6f0] rounded-full overflow-hidden border border-[#e2d4c0]">
            <div
              className="h-full accent-gradient transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Items Table Left */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#e2d4c0] p-6 shadow-xs divide-y divide-[#e2d4c0]">
            {items.map((it) => (
              <div key={it.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="size-16 rounded-xl object-cover bg-[#faf6f0] border border-[#e2d4c0] shrink-0"
                  />
                  <div className="min-w-0">
                    <a href={`/shop/${it.slug}`} className="text-sm font-semibold text-fg hover:text-primary transition-colors line-clamp-1">
                      {it.name}
                    </a>
                    <p className="text-xs font-bold text-[#844d1e] mt-0.5">£{it.unitPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
                  {/* Quantity selector */}
                  <div className="flex items-center rounded-xl border border-[#e2d4c0] bg-[#faf8f5] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="size-7 flex items-center justify-center text-muted hover:text-fg"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold">{it.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="size-7 flex items-center justify-center text-muted hover:text-fg"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-fg w-16 text-right">
                    £{it.itemTotal.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="text-muted hover:text-destructive transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-[#e2d4c0] p-6 shadow-xs space-y-5">
              <h2 className="font-display text-lg font-bold text-fg">Summary</h2>

              {/* Promo Code Input */}
              <div>
                {!appliedDiscount ? (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="flex-1 rounded-xl border border-border/70 bg-[#faf8f5] px-3 py-2 text-xs uppercase focus:border-[#844d1e] focus:outline-none"
                    />
                    <Button type="submit" variant="outline" size="sm" className="rounded-xl">
                      Apply
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs">
                    <span>Coupon {appliedDiscount.code} applied</span>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="text-xs text-muted hover:text-fg font-semibold underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoMessage && !appliedDiscount && (
                  <p className={`text-[11px] mt-1.5 ${promoMessage.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2 border-t border-[#e2d4c0] pt-4 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-fg">£{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-£{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Delivery Estimate</span>
                  <span className="font-semibold text-fg">
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-fg pt-3 border-t border-[#e2d4c0]">
                  <span>Total</span>
                  <span className="text-[#844d1e]">£{total.toFixed(2)}</span>
                </div>
              </div>

              <Button asChild className="w-full h-12 accent-gradient text-white text-sm font-semibold rounded-xl shadow-md gap-2">
                <a href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 text-xs flex items-center gap-3">
              <ShieldCheck className="size-6 text-emerald-700 shrink-0" />
              <div>
                <p className="font-semibold">Clinical Guarantee</p>
                <p className="text-[11px] text-emerald-800/80">30-day returns and free advice from registered dentists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

