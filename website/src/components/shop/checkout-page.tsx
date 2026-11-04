import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { api } from "@/lib/api";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, Truck, AlertCircle } from "lucide-react";
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
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const selectedMethod = shippingMethods.find((m) => m.id === selectedShippingMethodId) || shippingMethods[0];
  let shippingCost = 0;
  if (selectedMethod) {
    const base = parseFloat(selectedMethod.base_price);
    const threshold = selectedMethod.free_shipping_threshold ? parseFloat(selectedMethod.free_shipping_threshold) : null;
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
          state: city, // Using city as state for UK addresses
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
        // The server refuses the order if its total differs from what's shown here.
        expectedTotal: finalTotal,
      };

      const res = await api.checkout.createSession(payload);

      if (!res.url) {
        throw new Error("We couldn't open the payment page. You haven't been charged. Please try again.");
      }
      window.location.href = res.url;
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate payment. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl font-bold text-fg">Your Bag is Empty</h1>
        <p className="mt-2 text-sm text-muted">Add clinical oral care products before checking out.</p>
        <Button asChild className="mt-6 accent-gradient text-white">
          <a href="/shop">Browse Store</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] text-fg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <a href="/shop" className="inline-flex items-center gap-2 text-xs text-muted hover:text-primary mb-8">
          <ArrowLeft className="size-4" />
          <span>Back to Shopping</span>
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Left Side */}
          <form onSubmit={handleProceedToPayment} className="lg:col-span-7 space-y-8">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Contact Info */}
            <div className="bg-white rounded-2xl border border-[#e2d4c0] p-6 shadow-xs space-y-4">
              <h2 className="font-display text-lg font-bold text-fg flex items-center gap-2">
                <span>1. Contact Information</span>
              </h2>
              <div>
                <label className="text-xs font-semibold text-fg">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.co.uk"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-[#faf8f5] px-3.5 py-2 text-xs text-fg focus:border-[#844d1e] focus:outline-none"
                />
                <p className="text-[11px] text-muted mt-1">We'll send your receipt and tracking updates here.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-fg">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7123 456789"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-[#faf8f5] px-3.5 py-2 text-xs text-fg focus:border-[#844d1e] focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white rounded-2xl border border-[#e2d4c0] p-6 shadow-xs space-y-4">
              <h2 className="font-display text-lg font-bold text-fg">2. Shipping Address</h2>
              <div>
                <label className="text-xs font-semibold text-fg">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-[#faf8f5] px-3.5 py-2 text-xs text-fg focus:border-[#844d1e] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-fg">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address or P.O. Box"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-[#faf8f5] px-3.5 py-2 text-xs text-fg focus:border-[#844d1e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-fg">Town / City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bradford, Leeds, London..."
                    className="mt-1 w-full rounded-xl border border-border/70 bg-[#faf8f5] px-3.5 py-2 text-xs text-fg focus:border-[#844d1e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-fg">Postcode *</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="e.g. BD1 1AA"
                    className="mt-1 w-full rounded-xl border border-border/70 bg-[#faf8f5] px-3.5 py-2 text-xs text-fg uppercase focus:border-[#844d1e] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Shipping Method */}
            <div className="bg-white rounded-2xl border border-[#e2d4c0] p-6 shadow-xs space-y-4">
              <h2 className="font-display text-lg font-bold text-fg">3. Delivery Options</h2>
              {loadingShipping ? (
                <p className="text-xs text-muted">Loading delivery rates...</p>
              ) : (
                <div className="space-y-2.5">
                  {shippingMethods.map((m) => {
                    const price = parseFloat(m.base_price);
                    const isFree = m.free_shipping_threshold && subtotal >= parseFloat(m.free_shipping_threshold);
                    const isSelected = selectedShippingMethodId === m.id;

                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#844d1e] bg-[#faf6f0] ring-1 ring-[#844d1e]"
                            : "border-[#e2d4c0] bg-white hover:border-[#844d1e]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={isSelected}
                            onChange={() => setShippingMethodId(m.id)}
                            className="text-[#844d1e] focus:ring-[#844d1e]"
                          />
                          <div>
                            <p className="text-xs font-semibold text-fg">{m.name}</p>
                            {m.description && <p className="text-[11px] text-muted">{m.description}</p>}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-fg">
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
              className="w-full h-12 accent-gradient text-white font-semibold text-sm rounded-xl shadow-md gap-2"
            >
              <Lock className="size-4" />
              <span>{submitting ? "Securing Order..." : `Proceed to Secure Payment · £${finalTotal.toFixed(2)}`}</span>
            </Button>
          </form>

          {/* Right Summary Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#e2d4c0] p-6 shadow-xs space-y-6">
              <h2 className="font-display text-lg font-bold text-fg">Order Summary</h2>

              {/* Items list */}
              <div className="divide-y divide-[#e2d4c0]/60 max-h-80 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="py-3 flex items-center gap-3">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="size-12 rounded-lg object-cover bg-[#faf6f0] border border-[#e2d4c0] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-fg truncate">{it.name}</p>
                      <p className="text-[11px] text-muted">Qty: {it.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-fg">£{it.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <div className="pt-2">
                {!appliedDiscount ? (
                  <form onSubmit={handleApplyDiscount} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. SMILE10)"
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
                    <div className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>Coupon {appliedDiscount.code} applied (-£{discountAmount.toFixed(2)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="text-xs text-muted hover:text-fg underline ml-2 font-semibold"
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

              {/* Totals Calculation */}
              <div className="space-y-2 border-t border-[#e2d4c0] pt-4 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-fg">£{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Promo Discount</span>
                    <span>-£{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>UK Delivery</span>
                  <span className="font-semibold text-fg">
                    {shippingCost === 0 ? "FREE" : `£${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-fg pt-3 border-t border-[#e2d4c0]">
                  <span>Total (inc. VAT)</span>
                  <span className="text-[#844d1e] text-base">£{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 text-xs flex items-center gap-3">
              <ShieldCheck className="size-6 text-emerald-700 shrink-0" />
              <div>
                <p className="font-semibold">256-Bit SSL Encrypted Payment</p>
                <p className="text-[11px] text-emerald-800/80">Authorized clinical dispenser. 30-day money back guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

