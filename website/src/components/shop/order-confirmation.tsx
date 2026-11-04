import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { CheckCircle2, Package, ArrowRight, Truck, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAID_STATUSES = ["paid", "fulfilling", "shipped", "delivered"];
const AWAITING_CONFIRMATION = ["pending", "payment_processing"];
const STATUS_CHECK_MS = 3000;
const MAX_STATUS_CHECKS = 20;

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const { clearCart } = useCartStore();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.checkout.getOrder(orderId),
    enabled: !!orderId,
    // Stripe's redirect can arrive before its webhook, so keep checking for a little while.
    refetchInterval: (query) =>
      AWAITING_CONFIRMATION.includes(query.state.data?.status) && query.state.dataUpdateCount < MAX_STATUS_CHECKS
        ? STATUS_CHECK_MS
        : false,
  });

  const isPaid = PAID_STATUSES.includes(order?.status);

  // Clear cart only once payment is confirmed: an unpaid customer may want to try again.
  useEffect(() => {
    if (isPaid) {
      clearCart();
    }
  }, [isPaid]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="inline-block size-8 border-2 border-[#844d1e] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-muted">Retrieving your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl font-bold text-fg">Order Not Found</h1>
        <p className="mt-2 text-sm text-muted">We could not find the specified order record.</p>
        <Button asChild className="mt-6 accent-gradient text-white">
          <a href="/shop">Return to Shop</a>
        </Button>
      </div>
    );
  }

  if (!isPaid && order.status !== "refunded") {
    const waiting = AWAITING_CONFIRMATION.includes(order.status);
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        {waiting && (
          <div className="inline-block size-8 border-2 border-[#844d1e] border-t-transparent rounded-full animate-spin" />
        )}
        <h1 className="mt-4 font-display text-2xl font-bold text-fg">
          {waiting ? "Confirming your payment" : "This order hasn't been paid"}
        </h1>
        <p className="mt-2 text-sm text-muted max-w-md">
          {waiting
            ? "This usually takes a few seconds. If you closed the payment page without paying, you haven't been charged."
            : "You haven't been charged for this order. Your bag is still saved if you'd like to try again."}
        </p>
        <Button asChild className="mt-6 accent-gradient text-white">
          <a href={waiting ? "/shop" : "/checkout"}>{waiting ? "Return to Shop" : "Return to Checkout"}</a>
        </Button>
      </div>
    );
  }

  const shippingAddr = typeof order.shipping_address === "string"
    ? (() => {
        try {
          return JSON.parse(order.shipping_address);
        } catch {
          return {};
        }
      })()
    : order.shipping_address || {};

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const orderTotal = typeof order.total === "string" ? parseFloat(order.total) : order.total;

  return (
    <div className="min-h-screen bg-[#fffdf9] text-fg py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center bg-white rounded-3xl border border-[#e2d4c0] p-8 shadow-xs">
          <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="size-10" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-fg">Thank You for Your Order!</h1>
          <p className="mt-2 text-sm text-muted">
            We've received your payment for this order, placed with{" "}
            <span className="font-semibold text-fg">{order.customer_email}</span>.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-[#faf6f0] px-4 py-2 rounded-full border border-[#e2d4c0] text-xs">
            <span className="text-muted">Order ID:</span>
            <span className="font-mono font-bold text-[#844d1e]">{order.id}</span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-[#e2d4c0] p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e2d4c0]">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Calendar className="size-4" />
              <span>Placed on {new Date(order.created_at).toLocaleDateString("en-GB", { dateStyle: "long" })}</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
              Status: {order.status}
            </span>
          </div>

          {/* Delivery destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-[#844d1e] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-fg">Delivery Address</p>
                <p className="text-muted mt-1">
                  {shippingAddr.name}<br />
                  {shippingAddr.address || shippingAddr.line1}
                  {shippingAddr.line2 ? `, ${shippingAddr.line2}` : ""}<br />
                  {shippingAddr.city}, {shippingAddr.zip || shippingAddr.postalCode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="size-5 text-[#844d1e] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-fg">Fulfillment & Tracking</p>
                <p className="text-muted mt-1">
                  {order.shipping?.trackingNumber
                    ? `Tracking: ${order.shipping.trackingNumber}`
                    : "Preparing dispatch from clinical dispensary."}
                </p>
              </div>
            </div>
          </div>

          {/* Ordered items */}
          <div className="space-y-3 pt-4 border-t border-[#e2d4c0]">
            <p className="text-xs font-bold text-fg uppercase tracking-wider">Purchased Items</p>
            <div className="divide-y divide-[#e2d4c0]/50">
              {orderItems.map((it: any) => (
                <div key={it.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80"}
                      alt={it.name}
                      className="size-12 rounded-lg object-cover bg-[#faf6f0] border border-[#e2d4c0] shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-fg">{it.name}</p>
                      {it.variantSku && <p className="text-[11px] text-muted font-mono">{it.variantSku}</p>}
                      <p className="text-[11px] text-muted">Quantity: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-fg">£{(parseFloat(it.unitPrice || it.unit_price || "0") * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial summary */}
          <div className="border-t border-[#e2d4c0] pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-fg">£{parseFloat(order.subtotal || "0").toFixed(2)}</span>
            </div>
            {parseFloat(order.discount_amount || "0") > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied</span>
                <span>-£{parseFloat(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>UK Delivery</span>
              <span className="font-semibold text-fg">
                {parseFloat(order.shipping_cost || "0") === 0 ? "FREE" : `£${parseFloat(order.shipping_cost).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-fg pt-3 border-t border-[#e2d4c0]">
              <span>Total Paid</span>
              <span className="text-[#844d1e]">£{parseFloat(String(orderTotal)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Back to Shop */}
        <div className="text-center">
          <Button asChild className="accent-gradient text-white px-8 h-11 gap-2">
            <a href="/shop">
              <span>Continue Shopping</span>
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

