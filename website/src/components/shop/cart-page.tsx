import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { ButtonLink } from "@/components/hims";
import { CONTAINER, MUTED_TITLE, SOFT_CARD, TITLE } from "@/components/pricing/tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { CheckoutSteps } from "./checkout-steps";

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
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyPromo = async (e: FormEvent) => {
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
      <section className="min-h-[65vh] bg-[#f7f5f2] py-16 md:py-24">
        <div className={`${CONTAINER} flex flex-col items-center text-center`}>
          <div className="grid size-20 place-items-center rounded-full bg-white shadow-[0_10px_36px_rgba(20,20,40,0.07)]">
            <ShoppingBag aria-hidden strokeWidth={1.3} className="size-9 text-[#1b1b1b]" />
          </div>
          <h1 className={`mt-6 ${TITLE}`}>
            Your bag <span className={MUTED_TITLE}>is empty</span>
          </h1>
          <p className="mt-3 max-w-sm text-[17px] leading-[1.45] text-[#55565a]">
            Oops! You have nothing here. Explore our Happy Tooth oral care.
          </p>
          <div className="mt-8">
            <ButtonLink to="/shop">Shop all</ButtonLink>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f7f5f2] pt-10 pb-20 md:pt-16 md:pb-28">
      <div className={CONTAINER}>
        <CheckoutSteps current="cart" />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <h1 className={TITLE}>
            Your <span className={MUTED_TITLE}>bag</span>
          </h1>
          <button
            type="button"
            onClick={clearCart}
            className="text-small text-[#6d6e72] underline underline-offset-4 t-colors hover:text-danger"
          >
            Clear bag
          </button>
        </div>

        <div className={`${SOFT_CARD} mt-8 p-5`}>
          <div className="mb-2.5 flex items-center justify-between gap-2 text-[14px]">
            <span className="text-[#1b1b1b]">
              {isFreeShipping
                ? "You've unlocked FREE UK Delivery!"
                : `Add £${amountNeededForFree.toFixed(2)} more for FREE UK Delivery`}
            </span>
            <span className="text-[#6d6e72] tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ece8de]">
            <div
              className="h-full rounded-full bg-[#5b3fc4] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.5fr_1fr] lg:gap-6">
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="relative flex overflow-hidden rounded-[20px] bg-white shadow-[0_10px_36px_rgba(20,20,40,0.06)]">
                <div className="size-[112px] shrink-0 bg-[#f4f3e0] sm:size-[140px]">
                  <img
                    src={it.image}
                    alt={it.name}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                  <div className="pr-8">
                    <Link
                      to="/shop/$productSlug"
                      params={{ productSlug: it.slug }}
                      className="line-clamp-2 text-[17px] leading-[1.2] text-[#1b1b1b] t-colors hover:text-[#5b3fc4]"
                    >
                      {it.name}
                    </Link>
                    <p className="mt-1 text-[14px] text-[#6d6e72] tabular-nums">
                      £{it.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded-full border border-[#d6d2c8] px-1.5 py-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(it.id, it.quantity - 1)}
                        className="grid size-8 place-items-center rounded-full text-[#6d6e72] t-colors hover:text-[#1b1b1b]"
                        aria-label="Decrease quantity"
                      >
                        <Minus aria-hidden className="size-3.5" />
                      </button>
                      <span className="w-7 text-center text-[15px] tabular-nums text-[#1b1b1b]">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(it.id, it.quantity + 1)}
                        className="grid size-8 place-items-center rounded-full text-[#6d6e72] t-colors hover:text-[#1b1b1b]"
                        aria-label="Increase quantity"
                      >
                        <Plus aria-hidden className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-[17px] tabular-nums text-[#1b1b1b]">
                      £{it.itemTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-[#8b8d92] t-colors hover:bg-[#f4f1ea] hover:text-danger"
                  aria-label={`Remove ${it.name}`}
                >
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <aside className="space-y-3 lg:sticky lg:top-24">
            <div className={`${SOFT_CARD} space-y-6 p-6 md:p-8`}>
              <h2 className="text-[clamp(22px,2vw,28px)] leading-[1.1] text-[#1b1b1b]">Summary</h2>

              <div>
                {!appliedDiscount ? (
                  <form onSubmit={handleApplyPromo} className="flex items-end gap-3">
                    <Input
                      type="text"
                      aria-label="Promo code"
                      placeholder="Promo code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="h-11 flex-1 rounded-none border-0 border-b border-[#bdb8ad] bg-transparent px-0 uppercase focus-visible:ring-0"
                    />
                    <Button type="submit" variant="outline" className="h-11 rounded-full px-6">
                      Apply
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between rounded-xl bg-[#dff1e4] px-3.5 py-2.5 text-small text-[#256b3b]">
                    <span>Coupon {appliedDiscount.code} applied</span>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="text-caption underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoMessage && !appliedDiscount ? (
                  <p
                    className={cn(
                      "mt-2 text-caption",
                      promoMessage.type === "success" ? "text-[#256b3b]" : "text-danger",
                    )}
                  >
                    {promoMessage.text}
                  </p>
                ) : null}
              </div>

              <dl className="text-[15px]">
                <div className="flex justify-between border-t border-[#e4ded2] py-3.5 text-[#6d6e72]">
                  <dt>Order sub-total</dt>
                  <dd className="text-[#1b1b1b] tabular-nums">£{subtotal.toFixed(2)}</dd>
                </div>
                {discountAmount > 0 ? (
                  <div className="flex justify-between border-t border-[#e4ded2] py-3.5 text-[#6d6e72]">
                    <dt>Discount</dt>
                    <dd className="text-[#1b1b1b] tabular-nums">-£{discountAmount.toFixed(2)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-[#e4ded2] py-3.5 text-[#6d6e72]">
                  <dt>Shipping</dt>
                  <dd className="text-[#1b1b1b] tabular-nums">
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </dd>
                </div>
                <div className="flex justify-between border-t-2 border-[#1b1b1b] pt-4 text-[20px] text-[#1b1b1b]">
                  <dt>Total</dt>
                  <dd className="tabular-nums">£{total.toFixed(2)}</dd>
                </div>
              </dl>

              <ButtonLink to="/checkout" className="h-14 w-full rounded-full text-[16px]">
                <span>Next</span>
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>

            <div className="flex items-start gap-3 rounded-[20px] bg-[#f4f3e0] p-5">
              <ShieldCheck aria-hidden strokeWidth={1.4} className="mt-0.5 size-6 shrink-0 text-[#1b1b1b]" />
              <div>
                <p className="text-[16px] text-[#1b1b1b]">Happy Tooth, our sister company</p>
                <p className="mt-1 text-[14px] leading-[1.45] text-[#55565a]">
                  Free UK tracked delivery over £40 and 14-day returns on unopened items.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
