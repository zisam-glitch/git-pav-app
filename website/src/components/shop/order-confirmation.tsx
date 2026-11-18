import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { CheckCircle2, ArrowRight, Truck, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAID_STATUSES = ["paid", "fulfilling", "shipped", "delivered"];
const AWAITING_CONFIRMATION = ["pending", "payment_processing"];
const STATUS_CHECK_MS = 3000;
const MAX_STATUS_CHECKS = 20;

export function OrderConfirmation({ orderId, access }: { orderId: string; access?: string }) {
  const { clearCart } = useCartStore();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.checkout.getOrder(orderId, access),
    retry: false,
    enabled: !!orderId,
    refetchInterval: (query) =>
      AWAITING_CONFIRMATION.includes(query.state.data?.status) &&
      query.state.dataUpdateCount < MAX_STATUS_CHECKS
        ? STATUS_CHECK_MS
        : false,
  });

  const isPaid = PAID_STATUSES.includes(order?.status);

  useEffect(() => {
    if (isPaid) {
      clearCart();
    }
  }, [isPaid]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] bg-[#FBF8F5] pt-28 pb-20 flex flex-col items-center justify-center p-6 text-center">
        <div className="inline-block size-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-black/65">Retrieving your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[75vh] bg-[#FBF8F5] pt-28 pb-20 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md rounded-[1.5rem] border border-black/8 bg-white p-10 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <h1 className="font-display text-3xl font-normal tracking-[-0.04em] text-black">
            Order Not Found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-black/65">
            Please use the link from your checkout, or sign in to the account you ordered with.
          </p>
          <Button asChild className="mt-7 h-12 px-8">
            <a href="/shop">Return to Shop</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!isPaid && order.status !== "refunded") {
    const waiting = AWAITING_CONFIRMATION.includes(order.status);
    return (
      <div className="min-h-[75vh] bg-[#FBF8F5] pt-28 pb-20 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md rounded-[1.5rem] border border-black/8 bg-white p-10 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          {waiting && (
            <div className="mx-auto inline-block size-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
          )}
          <h1 className="mt-4 font-display text-3xl font-normal tracking-[-0.04em] text-black">
            {waiting ? "Confirming your payment" : "This order hasn't been paid"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-black/65">
            {waiting
              ? "This usually takes a few seconds. If you closed the payment page without paying, you haven't been charged."
              : "You haven't been charged for this order. Your bag is still saved if you'd like to try again."}
          </p>
          <Button asChild className="mt-7 h-12 px-8">
            <a href={waiting ? "/shop" : "/checkout"}>
              {waiting ? "Return to Shop" : "Return to Checkout"}
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const shippingAddr =
    typeof order.shipping_address === "string"
      ? (() => {
          try {
            return JSON.parse(order.shipping_address);
          } catch {
            return {};
          }
        })()
      : order.shipping_address || {};

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const orderTotal =
    typeof order.total === "string" ? parseFloat(order.total) : order.total;

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-fg pt-24 pb-20 px-4 sm:pt-28 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Success Header */}
        <div className="rounded-[1.5rem] border border-black/8 bg-white p-8 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)] sm:p-10">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F2EDE5] text-[#1B3745]">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
            Thank You for Your Order
          </h1>
          <p className="mt-3 text-sm text-black/65">
            We&apos;ve received your payment for this order, placed with{" "}
            <span className="font-medium text-black">{order.customer_email}</span>.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#FAF8F2] px-4 py-1.5 text-xs">
            <span className="text-black/55">Order ID:</span>
            <span className="font-mono font-medium text-black">{order.id}</span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="space-y-6 rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
            <div className="flex items-center gap-2 text-xs text-black/60">
              <Calendar className="size-4" />
              <span>
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-GB", {
                  dateStyle: "long",
                })}
              </span>
            </div>
            <span className="rounded-full bg-[#F2EDE5] px-3 py-1 text-xs font-medium capitalize text-[#1B3745]">
              Status: {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 text-xs sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#1B3745]" />
              <div>
                <p className="font-medium text-black">Delivery Address</p>
                <p className="mt-1 leading-relaxed text-black/65">
                  {shippingAddr.name}
                  <br />
                  {shippingAddr.address || shippingAddr.line1}
                  {shippingAddr.line2 ? `, ${shippingAddr.line2}` : ""}
                  <br />
                  {shippingAddr.city}, {shippingAddr.zip || shippingAddr.postalCode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 size-4 shrink-0 text-[#1B3745]" />
              <div>
                <p className="font-medium text-black">Fulfillment &amp; Tracking</p>
                <p className="mt-1 leading-relaxed text-black/65">
                  {order.shipping?.trackingNumber
                    ? `Tracking: ${order.shipping.trackingNumber}`
                    : "Preparing dispatch from clinical dispensary."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-black/10 pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-black/55">
              Purchased Items
            </p>
            <div className="divide-y divide-black/10">
              {orderItems.map((it: any) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between gap-4 py-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        it.image ||
                        "/media/hims/bento-whitening.jpg"
                      }
                      alt={it.name}
                      className="size-12 shrink-0 rounded-xl border border-black/6 bg-[#FAF8F2] object-contain p-1"
                    />
                    <div>
                      <p className="font-medium text-black">{it.name}</p>
                      {it.variantSku && (
                        <p className="font-mono text-[11px] text-black/50">{it.variantSku}</p>
                      )}
                      <p className="text-[11px] text-black/55">Quantity: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium tabular-nums text-black">
                    £{(parseFloat(it.unitPrice || it.unit_price || "0") * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-black/10 pt-4 text-xs">
            <div className="flex justify-between text-black/65">
              <span>Subtotal</span>
              <span className="font-medium tabular-nums text-black">
                £{parseFloat(order.subtotal || "0").toFixed(2)}
              </span>
            </div>
            {parseFloat(order.discount_amount || "0") > 0 && (
              <div className="flex justify-between font-medium text-[#754B3D]">
                <span>Discount Applied</span>
                <span className="tabular-nums">
                  -£{parseFloat(order.discount_amount).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-black/65">
              <span>UK Delivery</span>
              <span className="font-medium tabular-nums text-black">
                {parseFloat(order.shipping_cost || "0") === 0
                  ? "FREE"
                  : `£${parseFloat(order.shipping_cost).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-3 text-base font-medium text-black">
              <span>Total Paid</span>
              <span className="tabular-nums">£{parseFloat(String(orderTotal)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button asChild className="h-12 px-8">
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
