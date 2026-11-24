import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { ButtonLink } from "@/components/hims";
import { CONTAINER, MUTED_TITLE, SOFT_CARD, TITLE } from "@/components/pricing/tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, HAS_API_BASE } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { CheckoutSteps } from "./checkout-steps";

const FIELD =
  "h-12 rounded-xl border border-[#e4ded2] bg-white px-4 text-[16px] text-[#1b1b1b] placeholder:text-[#9a9a9e]";
const STEP_CARD = `${SOFT_CARD} space-y-5 p-6 md:p-8`;

interface ShippingMethod {
  id: string;
  name: string;
  description?: string | null;
  base_price: string | number;
  free_shipping_threshold?: string | number | null;
}

export function CheckoutPage() {
  const {
    items,
    appliedDiscount,
    selectedShippingMethodId,
    setShippingMethodId,
    applyDiscount,
    removeDiscount,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    sessionId,
  } = useCartStore();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();

  useEffect(() => {
    if (!HAS_API_BASE || items.length === 0) {
      setLoadingShipping(false);
      return;
    }
    let active = true;
    async function loadShipping() {
      try {
        const methods = await api.shipping.list();
        if (!active) return;
        setShippingMethods(methods);
        if (methods.length > 0 && !useCartStore.getState().selectedShippingMethodId) {
          setShippingMethodId(methods[0].id);
        }
      } catch {
        // Fall back to standard UK delivery calculation when shipping API is unreachable.
      } finally {
        if (active) setLoadingShipping(false);
      }
    }
    loadShipping();
    return () => {
      active = false;
    };
  }, [items.length, setShippingMethodId]);

  const selectedMethod =
    shippingMethods.find((m) => m.id === selectedShippingMethodId) || shippingMethods[0];
  let shippingCost = 0;
  if (selectedMethod) {
    const base = parseFloat(String(selectedMethod.base_price));
    const threshold = selectedMethod.free_shipping_threshold
      ? parseFloat(String(selectedMethod.free_shipping_threshold))
      : null;
    shippingCost = threshold !== null && subtotal >= threshold ? 0 : base;
  } else {
    shippingCost = subtotal >= 40 ? 0 : 3.99;
  }

  const finalTotal = getTotal(shippingCost);

  const handleApplyDiscount = async (e: FormEvent) => {
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

  const handleProceedToPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (!email || !fullName || !address || !city || !zip) {
      setErrorMessage("Please complete all required shipping address fields.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId || undefined,
          quantity: it.quantity,
        })),
        customerEmail: email,
        customerPhone: phone || undefined,
        shippingAddress: {
          name: fullName,
          address,
          city,
          state: city,
          zip,
          country: "GB",
        },
        billingAddress: {
          name: fullName,
          address,
          city,
          state: city,
          zip,
          country: "GB",
        },
        shippingMethodId: selectedShippingMethodId || undefined,
        discountCode: appliedDiscount?.code || undefined,
        sessionId,
        expectedTotal: finalTotal,
      };

      const res = await api.checkout.createSession(payload);

      if (!res.url) {
        throw new Error(
          "We couldn't open the payment page. You haven't been charged. Please try again.",
        );
      }
      window.location.href = res.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initiate payment. Please try again.";
      setErrorMessage(message);
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="min-h-[65vh] bg-[#f7f5f2] py-16 md:py-24">
        <div className={`${CONTAINER} flex flex-col items-center text-center`}>
          <h1 className={TITLE}>
            Your bag <span className={MUTED_TITLE}>is empty</span>
          </h1>
          <p className="mt-3 text-[17px] text-[#55565a]">
            Add Happy Tooth products before checking out.
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
        <CheckoutSteps current="details" />
        <div className="mt-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-small text-[#6d6e72] t-colors hover:text-[#1b1b1b]"
          >
            <ArrowLeft aria-hidden className="size-4" />
            <span>Back to your bag</span>
          </Link>
          <h1 className={`mt-4 ${TITLE}`}>
            Checkout <span className={MUTED_TITLE}>details</span>
          </h1>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.3fr_1fr] lg:gap-6">
          <form onSubmit={handleProceedToPayment} className="space-y-4">
            {errorMessage ? (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-2xl bg-[#f8e8e4] p-4 text-small text-danger"
              >
                <AlertCircle aria-hidden className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <div className={STEP_CARD}>
              <h2 className="text-[clamp(22px,2vw,28px)] leading-[1.1] text-[#1b1b1b]">
                Contact <span className={MUTED_TITLE}>information</span>
              </h2>
              <div className="space-y-2">
                <Label htmlFor="checkout-email">Email Address *</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.co.uk"
                  className={FIELD}
                />
                <p className="text-caption text-[#6d6e72]">
                  We&apos;ll send your receipt and tracking updates here.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-phone">Phone Number (Optional)</Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7123 456789"
                  className={FIELD}
                />
              </div>
            </div>

            <div className={STEP_CARD}>
              <h2 className="text-[clamp(22px,2vw,28px)] leading-[1.1] text-[#1b1b1b]">
                Home shipping <span className={MUTED_TITLE}>address</span>
              </h2>
              <div className="space-y-2">
                <Label htmlFor="checkout-name">Full Name *</Label>
                <Input
                  id="checkout-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className={FIELD}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-address">Address Line 1 *</Label>
                <Input
                  id="checkout-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address or P.O. Box"
                  className={FIELD}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkout-city">Town / City *</Label>
                  <Input
                    id="checkout-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bradford, Leeds, London..."
                    className={FIELD}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-zip">Postcode *</Label>
                  <Input
                    id="checkout-zip"
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="e.g. BD1 1AA"
                    className={`${FIELD} uppercase`}
                  />
                </div>
              </div>
            </div>

            <div className={STEP_CARD}>
              <h2 className="text-[clamp(22px,2vw,28px)] leading-[1.1] text-[#1b1b1b]">
                Delivery <span className={MUTED_TITLE}>options</span>
              </h2>
              {loadingShipping ? (
                <p className="text-small text-[#6d6e72]">Loading delivery rates...</p>
              ) : shippingMethods.length === 0 ? (
                <p className="text-[16px] text-[#1b1b1b]">
                  Standard UK Tracked Delivery (
                  {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`})
                </p>
              ) : (
                <div className="space-y-3">
                  {shippingMethods.map((m) => {
                    const price = parseFloat(String(m.base_price));
                    const isFree =
                      m.free_shipping_threshold &&
                      subtotal >= parseFloat(String(m.free_shipping_threshold));
                    const isSelected = selectedShippingMethodId === m.id;

                    return (
                      <label
                        key={m.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 t-colors",
                          isSelected
                            ? "border-black bg-white shadow-[0_8px_24px_rgba(20,20,40,0.08)]"
                            : "border-[#e4ded2] bg-white hover:border-[#bdb8ad]",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={isSelected}
                            onChange={() => setShippingMethodId(m.id)}
                            className="size-4 accent-black"
                          />
                          <div>
                            <p className="text-[16px] text-[#1b1b1b]">{m.name}</p>
                            {m.description ? (
                              <p className="mt-0.5 text-caption text-[#6d6e72]">{m.description}</p>
                            ) : null}
                          </div>
                        </div>
                        <span className="text-[16px] tabular-nums text-[#1b1b1b]">
                          {isFree ? "FREE" : `£${price.toFixed(2)}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-14 w-full rounded-full bg-black text-[16px] text-white hover:bg-black/85"
            >
              <Lock aria-hidden className="size-4" />
              <span>
                {submitting
                  ? "Securing Order..."
                  : `Proceed to Secure Payment · £${finalTotal.toFixed(2)}`}
              </span>
            </Button>
          </form>

          <aside className="space-y-3 lg:sticky lg:top-24">
            <div className={`${SOFT_CARD} space-y-6 p-6 md:p-8`}>
              <h2 className="text-[clamp(22px,2vw,28px)] leading-[1.1] text-[#1b1b1b]">Review order</h2>

              <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3.5">
                    <img
                      src={it.image}
                      alt={it.name}
                      loading="lazy"
                      className="size-14 shrink-0 rounded-xl bg-[#f4f3e0] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] text-[#1b1b1b]">{it.name}</p>
                      <p className="text-caption text-[#6d6e72]">Qty: {it.quantity}</p>
                    </div>
                    <span className="text-[15px] tabular-nums text-[#1b1b1b]">
                      £{it.itemTotal.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <div>
                {!appliedDiscount ? (
                  <form onSubmit={handleApplyDiscount} className="flex items-end gap-3">
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
                    <div className="flex items-center gap-2">
                      <CheckCircle2 aria-hidden className="size-4 shrink-0" />
                      <span>
                        Coupon {appliedDiscount.code} applied (-£{discountAmount.toFixed(2)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="ml-2 text-caption underline underline-offset-4"
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
                    <dt>Promo Discount</dt>
                    <dd className="text-[#1b1b1b] tabular-nums">-£{discountAmount.toFixed(2)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-[#e4ded2] py-3.5 text-[#6d6e72]">
                  <dt>UK Delivery</dt>
                  <dd className="text-[#1b1b1b] tabular-nums">
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </dd>
                </div>
                <div className="flex justify-between border-t-2 border-[#1b1b1b] pt-4 text-[20px] text-[#1b1b1b]">
                  <dt>Total (inc. VAT)</dt>
                  <dd className="tabular-nums">£{finalTotal.toFixed(2)}</dd>
                </div>
              </dl>
            </div>

            <div className="flex items-start gap-3 rounded-[20px] bg-[#f4f3e0] p-5">
              <ShieldCheck aria-hidden strokeWidth={1.4} className="mt-0.5 size-6 shrink-0 text-[#1b1b1b]" />
              <div>
                <p className="text-[16px] text-[#1b1b1b]">Secure checkout</p>
                <p className="mt-1 text-[14px] leading-[1.45] text-[#55565a]">
                  Payments are processed securely via Stripe.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
