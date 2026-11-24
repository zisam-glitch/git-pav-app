import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import type { CartItem } from "./shop-data";
import { CheckoutSteps } from "./checkout-steps";
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

  const ROW = "flex items-center justify-between py-3 text-[15px] text-[#1b1b1b]";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 ease-smooth",
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
          "fixed inset-y-0 right-0 z-[71] flex w-full max-w-[520px] flex-col bg-[#f7f5f2] transition-transform duration-300 ease-smooth",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex shrink-0 items-center justify-center px-6 pt-6 pb-4">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="absolute top-5 left-5 grid size-10 place-items-center rounded-full bg-white text-[#1b1b1b] shadow-[0_2px_10px_rgba(20,20,40,0.08)] t-colors hover:bg-[#efece6]"
          >
            <X aria-hidden className="size-5" />
          </button>
          <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[#1b1b1b]">Cart</h2>
        </div>

        {items.length > 0 ? (
          <div className="shrink-0 px-6 pb-4">
            <CheckoutSteps current="cart" />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <p className="text-[26px] font-medium tracking-[-0.01em] text-[#1b1b1b]">
                Your cart is empty
              </p>
              <p className="mt-2 text-[16px] text-[#6b6b70]">Oops! You have nothing here</p>
            </div>
          ) : (
            <>
              <div className="rounded-[18px] bg-white px-4 py-3 text-[14px] text-[#1b1b1b] shadow-[0_10px_36px_rgba(20,20,40,0.05)]">
                <div className="flex items-center justify-between gap-2">
                  <span>
                    {isFreeShipping
                      ? "You've unlocked free UK delivery"
                      : `Add £${amountNeededForFreeShipping.toFixed(2)} more for free UK delivery`}
                  </span>
                  <span className="tabular-nums text-[#6b6b70]">{shippingProgress}%</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#ebe8e1]">
                  <div
                    className="h-full rounded-full bg-[#1b1b1b] transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {items.map((item) => {
                  const itemKey = item.id || item.product.id;
                  return (
                    <li
                      key={itemKey}
                      className="flex items-center gap-4 rounded-[18px] bg-white p-3 shadow-[0_10px_36px_rgba(20,20,40,0.05)]"
                    >
                      <ShopMedia
                        src={item.product.image}
                        alt={item.product.name}
                        tone="cream"
                        className="size-20 shrink-0 rounded-[14px] bg-[#fbfbee] brightness-[1.06]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[15px] font-medium text-[#1b1b1b]">
                          {item.product.name}
                        </p>
                        <p className="mt-0.5 text-[14px] text-[#6b6b70] tabular-nums">
                          £{item.product.price.toFixed(2)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-[#e4e0d8] px-1">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                              className="grid size-7 place-items-center rounded-full text-[#6b6b70] t-colors hover:text-[#1b1b1b]"
                              aria-label="Decrease quantity"
                            >
                              <Minus aria-hidden className="size-3.5" />
                            </button>
                            <span className="w-6 text-center text-[14px] tabular-nums text-[#1b1b1b]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                              className="grid size-7 place-items-center rounded-full text-[#6b6b70] t-colors hover:text-[#1b1b1b]"
                              aria-label="Increase quantity"
                            >
                              <Plus aria-hidden className="size-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(itemKey)}
                            className="grid size-8 place-items-center rounded-full text-[#9a9a9e] t-colors hover:text-[#8a4242]"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 aria-hidden className="size-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5">
                {!promoApplied ? (
                  <form onSubmit={handleApplyPromo} className="flex items-end gap-3">
                    <input
                      type="text"
                      aria-label="Discount code"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="h-11 flex-1 border-0 border-b border-[#cfcac0] bg-transparent text-[15px] text-[#1b1b1b] outline-none placeholder:text-[#9a9a9e] focus:border-[#1b1b1b]"
                    />
                    <button
                      type="submit"
                      className="h-10 rounded-full border border-[#1b1b1b] px-6 text-[14px] font-medium text-[#1b1b1b] t-colors hover:bg-[#1b1b1b] hover:text-white"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between text-[14px] text-[#1b1b1b]">
                    <span>{promoLabel}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoApplied(false);
                        setPromoLabel("");
                        setDiscountPercent(0);
                        setPromoCode("");
                      }}
                      className="underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoError ? (
                  <p className="mt-1.5 text-[13px] text-[#8a4242]">{promoError}</p>
                ) : null}
              </div>

              <div className="mt-3 divide-y divide-[#e4e0d8]">
                <div className={ROW}>
                  <span>Sub-total</span>
                  <span className="tabular-nums">£{rawSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 ? (
                  <div className={ROW}>
                    <span>Discount</span>
                    <span className="tabular-nums">-£{discountAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className={ROW}>
                  <span>UK delivery</span>
                  <span className="tabular-nums">
                    {shippingCost === 0 ? "Free" : `£${shippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between border-t-2 border-[#1b1b1b] py-3 text-[17px] font-medium text-[#1b1b1b]">
                <span>Total</span>
                <span className="tabular-nums">£{total.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={onClearCart}
                className="text-[13px] text-[#9a9a9e] underline underline-offset-4 t-colors hover:text-[#1b1b1b]"
              >
                Clear cart
              </button>
            </>
          )}
        </div>

        {items.length === 0 ? (
          <button
            type="button"
            onClick={onClose}
            className="h-16 w-full shrink-0 bg-[#1b1b1b] text-[15px] font-medium tracking-[0.12em] text-white uppercase t-colors hover:bg-black"
          >
            Shop all
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCheckout}
            className="h-16 w-full shrink-0 bg-[#1b1b1b] text-[16px] font-medium text-white t-colors hover:bg-black"
          >
            Next
          </button>
        )}
      </aside>
    </>
  );
}
