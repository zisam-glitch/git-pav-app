import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { ShopMedia } from "./shop-media";

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
      <Section theme="white" className="min-h-[65vh]">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="grid size-20 place-items-center rounded-pill bg-cream text-muted">
            <ShoppingBag aria-hidden className="size-9" />
          </div>
          <Heading as="h1" size="h2-md" accent="is Empty" tone="terracotta" inline className="mt-6">
            Your Shopping Bag
          </Heading>
          <p className="mt-3 max-w-sm text-body text-muted">
            Add a product from the shop to get started.
          </p>
          <div className="mt-8">
            <ButtonLink to="/shop">Start Shopping</ButtonLink>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section theme="white">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <Heading as="h1" size="h2-md">
            Shopping Bag
          </Heading>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex min-h-11 items-center px-2 text-small font-medium text-muted underline underline-offset-4 t-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <Tile tone="cream" className="p-5">
          <div className="mb-2.5 flex items-center justify-between gap-2 text-small">
            <span className="font-medium text-fg">
              {isFreeShipping
                ? "You've unlocked free UK delivery"
                : `Add £${amountNeededForFree.toFixed(2)} more for free UK delivery`}
            </span>
            <span className="font-medium text-muted tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-pill bg-black/10">
            <div
              className="h-full rounded-pill bg-brown transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Tile>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Items Table Left */}
          <Tile tone="white" className="divide-y divide-border p-6 lg:col-span-8">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex flex-col items-start justify-between gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <ShopMedia
                    src={it.image}
                    alt={it.name}
                    tone="cream"
                    className="size-16 shrink-0 rounded-lg border border-border"
                  />
                  <div className="min-w-0">
                    <Link
                      to="/shop/$productSlug"
                      params={{ productSlug: it.slug }}
                      className="line-clamp-1 text-label text-fg t-colors hover:text-terracotta"
                    >
                      {it.name}
                    </Link>
                    <p className="mt-1 text-small font-medium text-muted tabular-nums">
                      £{it.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-end">
                  <div className="inline-flex items-center rounded-pill border border-border-strong bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="grid size-11 place-items-center rounded-pill text-muted t-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-fg"
                      aria-label="Decrease quantity"
                    >
                      <Minus aria-hidden className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-small font-medium tabular-nums text-fg">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="grid size-11 place-items-center rounded-pill text-muted t-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-fg"
                      aria-label="Increase quantity"
                    >
                      <Plus aria-hidden className="size-3.5" />
                    </button>
                  </div>

                  <span className="w-20 text-right text-label tabular-nums text-fg">
                    £{it.itemTotal.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="grid size-11 place-items-center rounded-pill text-muted t-colors hover:bg-cream hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-fg"
                    aria-label={`Remove ${it.name}`}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </Tile>

          {/* Right Summary Column */}
          <div className="space-y-4 lg:col-span-4">
            <Tile tone="cream" className="space-y-6 p-6 md:p-8">
              <h2 className="text-h4 text-fg">Summary</h2>

              <div>
                {!appliedDiscount ? (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <Input
                      type="text"
                      aria-label="Promo code"
                      placeholder="Promo code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="h-12 flex-1 uppercase"
                    />
                    <Button type="submit" variant="outline" className="px-5">
                      Apply
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-sage px-3.5 py-2.5 text-small text-fg">
                    <span>Coupon {appliedDiscount.code} applied</span>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="inline-flex min-h-11 items-center px-2 text-small font-medium text-fg underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoMessage && !appliedDiscount ? (
                  <p
                    className={cn(
                      "mt-2 text-caption",
                      promoMessage.type === "success" ? "text-fg" : "text-danger",
                    )}
                  >
                    {promoMessage.text}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2.5 border-t border-border pt-4 text-small">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-fg tabular-nums">£{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 ? (
                  <div className="flex justify-between text-fg">
                    <span>Discount</span>
                    <span className="tabular-nums">-£{discountAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span className="font-medium text-fg tabular-nums">
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-h4 text-fg">
                  <span>Total</span>
                  <span className="tabular-nums">£{total.toFixed(2)}</span>
                </div>
              </div>

              <ButtonLink to="/checkout" className="w-full">
                <span>Proceed to Checkout</span>
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </Tile>
          </div>
        </div>
      </div>
    </Section>
  );
}
