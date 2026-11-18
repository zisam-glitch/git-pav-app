import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { api } from "@/lib/api";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();

  useEffect(() => {
    async function loadShipping() {
      try {
        const methods = await api.shipping.list();
        setShippingMethods(methods);
        if (methods.length > 0 && !selectedShippingMethodId) {
          setShippingMethodId(methods[0].id);
        }
      } catch (err) {
        console.error("Failed to load shipping methods:", err);
      } finally {
        setLoadingShipping(false);
      }
    }
    loadShipping();
  }, []);

  const selectedMethod =
    shippingMethods.find((m) => m.id === selectedShippingMethodId) || shippingMethods[0];
  let shippingCost = 0;
  if (selectedMethod) {
    const base = parseFloat(selectedMethod.base_price);
    const threshold = selectedMethod.free_shipping_threshold
      ? parseFloat(selectedMethod.free_shipping_threshold)
      : null;
    shippingCost = threshold !== null && subtotal >= threshold ? 0 : base;
  } else {
    shippingCost = subtotal >= 40 ? 0 : 3.99;
  }

  const finalTotal = getTotal(shippingCost);

  const handleApplyDiscount = async (e: React.FormEvent) => {
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

  const handleProceedToPayment = async (e: React.FormEvent) => {
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
          address: address,
          city,
          state: city,
          zip,
          country: "GB",
        },
        billingAddress: {
          name: fullName,
          address: address,
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
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate payment. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#FBF8F5] pt-28 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-[1.5rem] border border-black/8 bg-white p-10 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Checkout
          </p>
          <h1 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black">
            Your Bag is Empty
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-black/65">
            Add clinical oral care products before checking out.
          </p>
          <Button asChild className="mt-7 h-12 px-8">
            <a href="/shop">Browse Store</a>
          </Button>
        </div>
      </div>
    );
  }

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:border-black focus:outline-none";

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-fg pt-24 pb-20 px-4 sm:pt-28 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[87rem]">
        <div className="mb-8 border-b border-black/10 pb-6">
          <a
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-medium text-black/60 transition-colors hover:text-black"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Shopping</span>
          </a>
          <h1 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Form Left Side */}
          <form onSubmit={handleProceedToPayment} className="space-y-6 lg:col-span-7">
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-[#8A3A34]/20 bg-[#8A3A34]/8 p-4 text-xs font-medium text-[#8A3A34]">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Contact Info */}
            <div className="space-y-4 rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] sm:p-7">
              <div className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-black text-[11px] font-medium text-white">
                  1
                </span>
                <h2 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                  Contact Information
                </h2>
              </div>

              <div>
                <label htmlFor="checkout-email" className="text-xs font-medium text-black/80">
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.co.uk"
                  className={inputCls}
                />
                <p className="mt-1.5 text-[11px] text-black/50">
                  We&apos;ll send your receipt and tracking updates here.
                </p>
              </div>

              <div>
                <label htmlFor="checkout-phone" className="text-xs font-medium text-black/80">
                  Phone Number (Optional)
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7123 456789"
                  className={inputCls}
                />
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="space-y-4 rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] sm:p-7">
              <div className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-black text-[11px] font-medium text-white">
                  2
                </span>
                <h2 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                  Shipping Address
                </h2>
              </div>

              <div>
                <label htmlFor="checkout-name" className="text-xs font-medium text-black/80">
                  Full Name *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="checkout-address" className="text-xs font-medium text-black/80">
                  Address Line 1 *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address or P.O. Box"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-city" className="text-xs font-medium text-black/80">
                    Town / City *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bradford, Leeds, London..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-zip" className="text-xs font-medium text-black/80">
                    Postcode *
                  </label>
                  <input
                    id="checkout-zip"
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="e.g. BD1 1AA"
                    className={`${inputCls} uppercase placeholder:normal-case`}
                  />
                </div>
              </div>
            </div>

            {/* 3. Shipping Method */}
            <div className="space-y-4 rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] sm:p-7">
              <div className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-black text-[11px] font-medium text-white">
                  3
                </span>
                <h2 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                  Delivery Options
                </h2>
              </div>

              {loadingShipping ? (
                <p className="text-xs text-black/55">Loading delivery rates...</p>
              ) : (
                <div className="space-y-2.5">
                  {shippingMethods.map((m) => {
                    const price = parseFloat(m.base_price);
                    const isFree =
                      m.free_shipping_threshold &&
                      subtotal >= parseFloat(m.free_shipping_threshold);
                    const isSelected = selectedShippingMethodId === m.id;

                    return (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${
                          isSelected
                            ? "border-black bg-[#FAF8F2]"
                            : "border-black/12 bg-white hover:border-black/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={isSelected}
                            onChange={() => setShippingMethodId(m.id)}
                            className="accent-black"
                          />
                          <div>
                            <p className="text-sm font-medium text-black">{m.name}</p>
                            {m.description && (
                              <p className="text-xs text-black/55">{m.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-medium tabular-nums text-black">
                          {isFree ? "FREE" : `£${price.toFixed(2)}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="h-12 w-full text-sm">
              <Lock className="size-4" />
              <span>
                {submitting
                  ? "Securing Order..."
                  : `Proceed to Secure Payment · £${finalTotal.toFixed(2)}`}
              </span>
            </Button>
          </form>

          {/* Right Summary Side */}
          <div className="space-y-4 lg:sticky lg:top-28 lg:col-span-5">
            <div className="space-y-5 rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] sm:p-7">
              <h2 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                Order Summary
              </h2>

              <div className="max-h-80 divide-y divide-black/10 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3.5 py-3 first:pt-0">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="size-12 shrink-0 rounded-xl border border-black/6 bg-[#FAF8F2] object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-black">{it.name}</p>
                      <p className="text-[11px] text-black/55">Qty: {it.quantity}</p>
                    </div>
                    <span className="text-xs font-medium tabular-nums text-black">
                      £{it.itemTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 pt-4">
                {!appliedDiscount ? (
                  <form onSubmit={handleApplyDiscount} className="flex gap-2">
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
                    <div className="flex items-center gap-1.5 font-medium text-[#1B3745]">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>
                        Coupon {appliedDiscount.code} applied (-£{discountAmount.toFixed(2)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="ml-2 font-medium text-black/60 underline hover:text-black"
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
                    <span>Promo Discount</span>
                    <span className="tabular-nums">-£{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-black/65">
                  <span>UK Delivery</span>
                  <span className="font-medium tabular-nums text-black">
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-3 text-base font-medium text-black">
                  <span>Total (inc. VAT)</span>
                  <span className="tabular-nums">£{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[1.5rem] border border-black/8 bg-[#FAF8F2] p-4 text-xs">
              <ShieldCheck className="size-5 shrink-0 text-[#1B3745]" />
              <div>
                <p className="font-medium text-black">256-Bit SSL Encrypted Payment</p>
                <p className="mt-0.5 text-[11px] text-black/60">
                  Authorized clinical dispenser. 30-day money back guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
