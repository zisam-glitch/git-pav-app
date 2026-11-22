import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, HAS_API_BASE } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { ShopMedia } from "./shop-media";

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
      <Section theme="white" className="min-h-[65vh]">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heading as="h1" size="h2-md" accent="is Empty" tone="terracotta" inline>
            Your Bag
          </Heading>
          <p className="mt-3 text-body text-muted">
            Add clinical oral care products before checking out.
          </p>
          <div className="mt-8">
            <ButtonLink to="/shop">Browse Store</ButtonLink>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section theme="white">
      <div className="space-y-8">
        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-small font-medium text-muted t-colors hover:text-fg"
          >
            <ArrowLeft aria-hidden className="size-4" />
            <span>Back to Shopping</span>
          </Link>
          <Heading as="h1" size="h2-md" className="mt-4">
            Checkout
          </Heading>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Form Left Side */}
          <form onSubmit={handleProceedToPayment} className="space-y-6 lg:col-span-7">
            {errorMessage ? (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-xl border border-danger bg-cream p-4 text-small text-danger"
              >
                <AlertCircle aria-hidden className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {/* 1. Contact Info */}
            <Tile tone="white" className="space-y-5 p-6 md:p-8">
              <h2 className="text-h4 text-fg">1. Contact Information</h2>
              <div className="space-y-2">
                <Label htmlFor="checkout-email">Email Address *</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.co.uk"
                />
                <p className="text-caption text-muted">
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
                />
              </div>
            </Tile>

            {/* 2. Delivery Address */}
            <Tile tone="white" className="space-y-5 p-6 md:p-8">
              <h2 className="text-h4 text-fg">2. Shipping Address</h2>
              <div className="space-y-2">
                <Label htmlFor="checkout-name">Full Name *</Label>
                <Input
                  id="checkout-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
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
                    className="uppercase"
                  />
                </div>
              </div>
            </Tile>

            {/* 3. Shipping Method */}
            <Tile tone="white" className="space-y-5 p-6 md:p-8">
              <h2 className="text-h4 text-fg">3. Delivery Options</h2>
              {loadingShipping ? (
                <p className="text-small text-muted">Loading delivery rates...</p>
              ) : shippingMethods.length === 0 ? (
                <p className="text-small text-muted">
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
                          "flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 t-colors",
                          isSelected
                            ? "border-black bg-cream"
                            : "border-border bg-white hover:border-border-strong",
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
                            <p className="text-label text-fg">{m.name}</p>
                            {m.description ? (
                              <p className="mt-0.5 text-caption text-muted">{m.description}</p>
                            ) : null}
                          </div>
                        </div>
                        <span className="text-label tabular-nums text-fg">
                          {isFree ? "FREE" : `£${price.toFixed(2)}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </Tile>

            <Button type="submit" disabled={submitting} className="w-full">
              <Lock aria-hidden className="size-4" />
              <span>
                {submitting
                  ? "Securing Order..."
                  : `Proceed to Secure Payment · £${finalTotal.toFixed(2)}`}
              </span>
            </Button>
          </form>

          {/* Right Summary Side */}
          <div className="space-y-4 lg:col-span-5">
            <Tile tone="cream" className="space-y-6 p-6 md:p-8">
              <h2 className="text-h4 text-fg">Order Summary</h2>

              <div className="max-h-80 divide-y divide-border overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                    <ShopMedia
                      src={it.image}
                      alt={it.name}
                      tone="sand"
                      className="size-12 shrink-0 rounded-lg border border-border bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-small font-medium text-fg">{it.name}</p>
                      <p className="text-caption text-muted">Qty: {it.quantity}</p>
                    </div>
                    <span className="text-small font-medium tabular-nums text-fg">
                      £{it.itemTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                {!appliedDiscount ? (
                  <form onSubmit={handleApplyDiscount} className="flex gap-2">
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
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 aria-hidden className="size-4 shrink-0 text-fg" />
                      <span>
                        Coupon {appliedDiscount.code} applied (-£{discountAmount.toFixed(2)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="ml-2 text-caption font-medium text-fg underline underline-offset-4"
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
                    <span>Promo Discount</span>
                    <span className="tabular-nums">-£{discountAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-muted">
                  <span>UK Delivery</span>
                  <span className="font-medium text-fg tabular-nums">
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-h4 text-fg">
                  <span>Total (inc. VAT)</span>
                  <span className="tabular-nums">£{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </Tile>

            <Tile tone="sage" className="flex items-start gap-3 p-5">
              <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-fg" />
              <div>
                <p className="text-label text-fg">Secure Checkout</p>
                <p className="mt-1 text-small text-muted">
                  Payments are processed securely via Stripe.
                </p>
              </div>
            </Tile>
          </div>
        </div>
      </div>
    </Section>
  );
}
