import { useCartStore } from "@/lib/cart-store";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
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
  const [promoMessage, setPromoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : 3.99;
  const total = getTotal(shippingCost);

  const amountNeededForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

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
      <div className="min-h-[75vh] bg-[#FBF8F5] pt-28 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-[1.5rem] border border-black/8 bg-white p-10 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#F2EDE5] text-[#1B3745]">
            <ShoppingBag className="size-7 stroke-[1.5]" />
          </div>
          <h1 className="font-display text-3xl font-normal tracking-[-0.04em] text-black">
            Your Shopping Bag is Empty
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-black/65">
            Explore our clinician-curated dental care solutions.
          </p>
          <Button asChild className="mt-7 h-12 px-8">
            <a href="/shop">Start Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-fg pt-24 pb-20 px-4 sm:pt-28 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[87rem] space-y-8">
        <div className="flex items-end justify-between border-b border-black/10 pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Pav Dental Shop
            </p>
            <h1 className="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              Shopping Bag
            </h1>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-medium text-black/55 underline underline-offset-4 transition-colors hover:text-[#8A3A34]"
          >
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-black">
              <Truck className="size-4 text-[#1B3745]" />
              {isFreeShipping
                ? "You've unlocked FREE UK Delivery"
                : `Add £${amountNeededForFree.toFixed(2)} more for FREE UK Delivery`}
            </span>
            <span className="font-medium tabular-nums text-black/60">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2EDE5]">
            <div
              className="h-full rounded-full bg-black transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Items Left */}
          <div className="divide-y divide-black/10 rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] lg:col-span-8">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex flex-col items-start justify-between gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="size-20 shrink-0 rounded-2xl border border-black/6 bg-[#FAF8F2] object-contain p-1.5"
                  />
                  <div className="min-w-0">
                    <a
                      href={`/shop/${it.slug}`}
                      className="line-clamp-1 text-sm font-medium text-black transition-colors hover:text-[#1B3745]"
                    >
                      {it.name}
                    </a>
                    <p className="mt-1 text-xs tabular-nums text-black/60">
                      £{it.unitPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-end">
                  <div className="inline-flex items-center rounded-full border border-black/12 bg-[#FBF8F5] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="flex size-7 items-center justify-center rounded-full text-black/60 hover:bg-white hover:text-black"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-medium tabular-nums">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="flex size-7 items-center justify-center rounded-full text-black/60 hover:bg-white hover:text-black"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <span className="w-16 text-right text-sm font-medium tabular-nums text-black">
                    £{it.itemTotal.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="rounded-full p-1.5 text-black/45 transition-colors hover:bg-[#F2EDE5] hover:text-[#8A3A34]"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Summary Column */}
          <div className="space-y-4 lg:col-span-4">
            <div className="space-y-5 rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <h2 className="font-display text-xl font-normal tracking-[-0.03em] text-black">
                Order Summary
              </h2>

              <div>
                {!appliedDiscount ? (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      aria-label="Promo code"
                      placeholder="Promo code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="h-10 flex-1 rounded-xl border border-black/12 bg-[#FBF8F5] px-3.5 text-xs text-black uppercase placeholder:normal-case placeholder:text-black/40 focus:border-black focus:outline-none"
                    />
                    <Button type="submit" variant="outline" size="sm" className="h-10 px-4">
                      Apply
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-black/8 bg-[#FAF8F2] px-3.5 py-2.5 text-xs">
                    <span className="font-medium text-[#1B3745]">
                      Coupon {appliedDiscount.code} applied
                    </span>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="font-medium text-black/60 underline hover:text-black"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoMessage && !appliedDiscount && (
                  <p
                    className={`mt-1.5 text-[11px] ${
                      promoMessage.type === "success" ? "text-[#1B3745]" : "text-[#8A3A34]"
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 border-t border-black/10 pt-4 text-xs">
                <div className="flex justify-between text-black/65">
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums text-black">
                    £{subtotal.toFixed(2)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-medium text-[#754B3D]">
                    <span>Discount</span>
                    <span className="tabular-nums">-£{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-black/65">
                  <span>Delivery Estimate</span>
                  <span className="font-medium tabular-nums text-black">
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-3 text-base font-medium text-black">
                  <span>Total</span>
                  <span className="tabular-nums">£{total.toFixed(2)}</span>
                </div>
              </div>

              <Button asChild className="h-12 w-full text-sm">
                <a href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-3 rounded-[1.5rem] border border-black/8 bg-[#FAF8F2] p-4 text-xs">
              <ShieldCheck className="size-5 shrink-0 text-[#1B3745]" />
              <div>
                <p className="font-medium text-black">Clinical Guarantee</p>
                <p className="mt-0.5 text-[11px] text-black/60">
                  30-day returns and advice from registered dentists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
