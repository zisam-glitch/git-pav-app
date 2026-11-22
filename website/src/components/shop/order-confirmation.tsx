import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, CheckCircle2, MapPin, Truck } from "lucide-react";
import { useEffect } from "react";
import { ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { ShopMedia } from "./shop-media";

const PAID_STATUSES = ["paid", "fulfilling", "shipped", "delivered"];
const AWAITING_CONFIRMATION = ["pending", "payment_processing"];
const STATUS_CHECK_MS = 3000;
const MAX_STATUS_CHECKS = 20;

interface OrderItemSummary {
  id: string;
  name: string;
  image?: string;
  variantSku?: string;
  quantity: number;
  unitPrice?: string | number;
  unit_price?: string | number;
}

export function OrderConfirmation({ orderId, access }: { orderId: string; access?: string }) {
  const { clearCart } = useCartStore();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
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
  }, [isPaid, clearCart]);

  if (isLoading) {
    return (
      <Section theme="white" className="min-h-[65vh]">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-fg border-t-transparent" />
          <p className="mt-4 text-small text-muted">Retrieving your order details...</p>
        </div>
      </Section>
    );
  }

  if (error || !order) {
    return (
      <Section theme="white" className="min-h-[65vh]">
        <div className="mx-auto max-w-md py-20 text-center">
          <Heading as="h1" size="h2-md">
            Order Not Found
          </Heading>
          <p className="mt-3 text-body text-muted">
            Please use the link from your checkout, or sign in to the account you ordered with.
          </p>
          <div className="mt-6">
            <ButtonLink to="/shop">Return to Shop</ButtonLink>
          </div>
        </div>
      </Section>
    );
  }

  if (!isPaid && order.status !== "refunded") {
    const waiting = AWAITING_CONFIRMATION.includes(order.status);
    return (
      <Section theme="white" className="min-h-[65vh]">
        <div className="mx-auto max-w-md py-20 text-center">
          {waiting ? (
            <div className="mx-auto mb-5 size-8 animate-spin rounded-full border-2 border-fg border-t-transparent" />
          ) : null}
          <Heading as="h1" size="h2-md">
            {waiting ? "Confirming your payment" : "This order hasn't been paid"}
          </Heading>
          <p className="mt-3 text-body text-muted">
            {waiting
              ? "This usually takes a few seconds. If you closed the payment page without paying, you haven't been charged."
              : "You haven't been charged for this order. Your bag is still saved if you'd like to try again."}
          </p>
          <div className="mt-6">
            <ButtonLink to={waiting ? "/shop" : "/checkout"}>
              {waiting ? "Return to Shop" : "Return to Checkout"}
            </ButtonLink>
          </div>
        </div>
      </Section>
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

  const orderItems: OrderItemSummary[] = Array.isArray(order.items) ? order.items : [];
  const orderTotal = typeof order.total === "string" ? parseFloat(order.total) : order.total;

  return (
    <Section theme="white" width="prose">
      <div className="space-y-8">
        {/* Success Header */}
        <Tile tone="sage" className="p-8 text-center md:p-10">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-pill bg-white text-fg">
            <CheckCircle2 aria-hidden className="size-8" />
          </div>
          <Heading as="h1" size="h2-md">
            Thank You for Your Order!
          </Heading>
          <p className="mt-3 text-body text-muted">
            We&apos;ve received your payment for this order, placed with{" "}
            <span className="font-medium text-fg">{order.customer_email}</span>.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-pill bg-white px-4 py-2 text-small">
            <span className="text-muted">Order ID:</span>
            <span className="font-mono font-medium text-fg">{order.id}</span>
          </div>
        </Tile>

        {/* Order Details Card */}
        <Tile tone="cream" className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2 text-small text-muted">
              <Calendar aria-hidden className="size-4" />
              <span>
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-GB", { dateStyle: "long" })}
              </span>
            </div>
            <span className="rounded-pill bg-sage px-3.5 py-1 text-caption font-medium capitalize text-fg">
              Status: {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 text-small sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-terracotta" />
              <div>
                <p className="font-medium text-fg">Delivery Address</p>
                <p className="mt-1 text-muted">
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
              <Truck aria-hidden className="mt-0.5 size-5 shrink-0 text-terracotta" />
              <div>
                <p className="font-medium text-fg">Fulfillment &amp; Tracking</p>
                <p className="mt-1 text-muted">
                  {order.shipping?.trackingNumber
                    ? `Tracking: ${order.shipping.trackingNumber}`
                    : "Your tracking number will appear here once your order ships."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-5">
            <p className="text-caption font-medium text-subtle">Purchased Items</p>
            <div className="divide-y divide-border">
              {orderItems.map((it) => {
                const price = parseFloat(String(it.unitPrice || it.unit_price || "0"));
                return (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-4 py-3 text-small"
                  >
                    <div className="flex items-center gap-3">
                      <ShopMedia
                        src={it.image}
                        alt={it.name}
                        tone="sand"
                        className="size-12 shrink-0 rounded-lg border border-border bg-white"
                      />
                      <div>
                        <p className="font-medium text-fg">{it.name}</p>
                        {it.variantSku ? (
                          <p className="font-mono text-caption text-muted">{it.variantSku}</p>
                        ) : null}
                        <p className="text-caption text-muted">Quantity: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium tabular-nums text-fg">
                      £{(price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4 text-small">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-fg tabular-nums">
                £{parseFloat(order.subtotal || "0").toFixed(2)}
              </span>
            </div>
            {parseFloat(order.discount_amount || "0") > 0 ? (
              <div className="flex justify-between text-fg">
                <span>Discount Applied</span>
                <span className="tabular-nums">
                  -£{parseFloat(order.discount_amount).toFixed(2)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between text-muted">
              <span>Delivery</span>
              <span className="font-medium text-fg tabular-nums">
                {parseFloat(order.shipping_cost || "0") === 0
                  ? "FREE"
                  : `£${parseFloat(order.shipping_cost).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-h4 text-fg">
              <span>Total Paid</span>
              <span className="tabular-nums">£{parseFloat(String(orderTotal)).toFixed(2)}</span>
            </div>
          </div>
        </Tile>

        <div className="text-center">
          <ButtonLink to="/shop">
            <span>Continue Shopping</span>
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
