import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, Shield, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ButtonLink } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CartItem } from "./shop-data";
import { ShopMedia } from "./shop-media";

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
  const navigate = useNavigate();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLabel, setPromoLabel] = useState("");
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const rawSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : 3.99;
  const total = subtotal + shippingCost;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const totalCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleApplyPromo = async (e: FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoError("");
    try {
      const { api } = await import("@/lib/api");
      const res = await api.discounts.validate(promoCode.trim());
      if (res.valid && res.discount) {
        if (res.discount.type === "percentage") {
          setDiscountPercent(res.discount.value);
        } else {
          setDiscountPercent(Math.round((res.discount.value / (rawSubtotal || 1)) * 100));
        }
        const code = String(res.discount.code ?? promoCode)
          .trim()
          .toUpperCase();
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
    navigate({ to: "/checkout" });
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-black/44 transition-opacity duration-300 ease-smooth",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-[71] flex w-full max-w-[547px] flex-col bg-white shadow-card transition-transform duration-300 ease-smooth md:rounded-l-xl",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag aria-hidden className="size-5 text-fg" />
            <h2 className="text-h4 text-fg">Your Shopping Bag ({totalCount})</h2>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 ? (
              <button
                type="button"
                onClick={onClearCart}
                className="text-caption font-medium text-subtle underline underline-offset-4 t-colors hover:text-fg"
              >
                Clear
              </button>
            ) : null}
            <Button
              ref={closeButtonRef}
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close cart"
            >
              <X aria-hidden className="size-5" />
            </Button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 ? (
          <div className="border-b border-border bg-cream px-6 py-3.5 text-small">
            <div className="mb-2 flex items-center justify-between gap-2 font-medium text-fg">
              <span className="flex items-center gap-2">
                <Truck aria-hidden className="size-4 text-terracotta" />
                {isFreeShipping ? (
                  <span>You&apos;ve unlocked Free UK Tracked Delivery!</span>
                ) : (
                  <span>
                    Add £{amountNeededForFreeShipping.toFixed(2)} more for Free UK Delivery
                  </span>
                )}
              </span>
              <span className="tabular-nums text-muted">{shippingProgress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-pill bg-black/10">
              <div
                className="h-full rounded-pill bg-brown transition-all duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="grid size-16 place-items-center rounded-pill bg-cream text-muted">
                <ShoppingBag aria-hidden className="size-7" />
              </div>
              <p className="mt-4 text-h4 text-fg">Your bag is empty</p>
              <p className="mt-2 max-w-xs text-small text-muted">
                Explore our clinical dental care products to begin your smile routine.
              </p>
              <Button type="button" onClick={onClose} variant="outline" className="mt-6">
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => {
                const itemKey = item.id || item.product.id;
                return (
                  <div
                    key={itemKey}
                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <ShopMedia
                      src={item.product.image}
                      alt={item.product.name}
                      tone="cream"
                      className="size-16 shrink-0 rounded-lg border border-border"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-label text-fg">{item.product.name}</p>
                      <p className="mt-1 text-small font-medium text-muted tabular-nums">
                        £{item.product.price.toFixed(2)}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-pill border border-border-strong bg-cream px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                            className="grid size-7 place-items-center rounded-pill text-muted t-colors hover:text-fg"
                            aria-label="Decrease quantity"
                          >
                            <Minus aria-hidden className="size-3.5" />
                          </button>
                          <span className="w-7 text-center text-small font-medium tabular-nums text-fg">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                            className="grid size-7 place-items-center rounded-pill text-muted t-colors hover:text-fg"
                            aria-label="Increase quantity"
                          >
                            <Plus aria-hidden className="size-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(itemKey)}
                          className="grid size-8 place-items-center rounded-pill text-subtle t-colors hover:bg-cream hover:text-danger"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {items.length > 0 ? (
          <div className="space-y-4 border-t border-border bg-cream px-6 py-5">
            {!promoApplied ? (
              <div>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <Input
                    type="text"
                    aria-label="Discount code"
                    placeholder="Discount code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-11 flex-1"
                  />
                  <Button type="submit" variant="outline" className="h-11 px-5">
                    Apply
                  </Button>
                </form>
                {promoError ? (
                  <p className="mt-1.5 text-caption text-danger">{promoError}</p>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg bg-sage px-3.5 py-2 text-small text-fg">
                <span>{promoLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPromoApplied(false);
                    setPromoLabel("");
                    setDiscountPercent(0);
                    setPromoCode("");
                  }}
                  className="text-caption font-medium text-fg underline underline-offset-4"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-2 text-small text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-fg tabular-nums">£{rawSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 ? (
                <div className="flex justify-between text-fg">
                  <span>Discount</span>
                  <span className="tabular-nums">-£{discountAmount.toFixed(2)}</span>
                </div>
              ) : null}

              <div className="flex justify-between">
                <span>UK Delivery</span>
                <span className="font-medium text-fg tabular-nums">
                  {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between border-t border-border pt-2.5 text-label text-fg">
                <span>Total</span>
                <span className="tabular-nums">£{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <ButtonLink to="/cart" variant="outline" onClick={onClose} className="px-5">
                View Bag
              </ButtonLink>
              <Button type="button" onClick={handleCheckout} className="flex-1">
                <span>Secure Checkout</span>
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-caption text-subtle">
              <Shield aria-hidden className="size-3.5" />
              <span>Encrypted checkout · Bradford clinic dispatch</span>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
