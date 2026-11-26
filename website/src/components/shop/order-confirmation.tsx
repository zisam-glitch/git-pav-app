import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { ButtonLink, Heading, Section } from "@/components/hims";
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

  const money = (v: unknown) => `£${parseFloat(String(v || "0")).toFixed(2)}`;
  const ROW = "flex items-center justify-between py-3 text-[15px] text-[#1b1b1b]";

  return (
    <div className="bg-[#f7f5f2] px-4 pt-16 pb-24 sm:px-6 md:pt-24">
      <div className="mx-auto max-w-[640px]">
        <div className="text-center">
          <div className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-white shadow-[0_10px_36px_rgba(20,20,40,0.07)]">
            <CheckCircle2 aria-hidden strokeWidth={1.4} className="size-7 text-[#1b1b1b]" />
          </div>
          <h1 className="text-[34px] leading-[1.1] font-medium tracking-[-0.02em] text-[#1b1b1b] md:text-[48px]">
            Order complete
          </h1>
          <p className="mt-4 text-[18px] text-[#8b8d92]">
            Thank you for your order. Your smile routine is on its way.
          </p>
        </div>

        <section className="mt-10 rounded-[22px] bg-white p-6 shadow-[0_10px_36px_rgba(20,20,40,0.07)] md:p-8">
          <h2 className="text-[20px] font-medium text-[#1b1b1b]">Confirmation</h2>
          <p className="mt-2 text-[15px] text-[#6b6b70]">
            We emailed your order confirmation to{" "}
            <span className="font-medium text-[#1b1b1b]">{order.customer_email}</span>.
          </p>
          <dl className="mt-5 grid gap-5 text-[15px] sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-[#9a9a9e]">Order number</dt>
              <dd className="mt-1 font-mono text-[#1b1b1b] break-all">{order.id}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-[#9a9a9e]">Placed on</dt>
              <dd className="mt-1 text-[#1b1b1b]">
                {new Date(order.created_at).toLocaleDateString("en-GB", { dateStyle: "long" })}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-[#9a9a9e]">Delivery address</dt>
              <dd className="mt-1 text-[#1b1b1b]">
                {shippingAddr.name}
                <br />
                {shippingAddr.address || shippingAddr.line1}
                {shippingAddr.line2 ? `, ${shippingAddr.line2}` : ""}
                <br />
                {shippingAddr.city}, {shippingAddr.zip || shippingAddr.postalCode}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-[#9a9a9e]">Delivery</dt>
              <dd className="mt-1 text-[#1b1b1b]">
                {order.shipping?.trackingNumber
                  ? `Tracking: ${order.shipping.trackingNumber}`
                  : "Preparing dispatch"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-4 rounded-[22px] bg-white p-6 shadow-[0_10px_36px_rgba(20,20,40,0.07)] md:p-8">
          <h2 className="text-[20px] font-medium text-[#1b1b1b]">Your order</h2>
          <ul className="mt-4 space-y-3">
            {orderItems.map((it) => {
              const price = parseFloat(String(it.unitPrice || it.unit_price || "0"));
              return (
                <li key={it.id} className="flex items-center gap-4">
                  <ShopMedia
                    src={it.image}
                    alt={it.name}
                    tone="cream"
                    className="size-16 shrink-0 rounded-[14px] bg-[#fbfbee] brightness-[1.06]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-[#1b1b1b]">{it.name}</p>
                    <p className="text-[13px] text-[#6b6b70]">Quantity: {it.quantity}</p>
                  </div>
                  <span className="text-[15px] tabular-nums text-[#1b1b1b]">
                    £{(price * it.quantity).toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 divide-y divide-[#e4e0d8] border-t border-[#e4e0d8]">
            <div className={ROW}>
              <span>Sub-total</span>
              <span className="tabular-nums">{money(order.subtotal)}</span>
            </div>
            {parseFloat(order.discount_amount || "0") > 0 ? (
              <div className={ROW}>
                <span>Discount</span>
                <span className="tabular-nums">-{money(order.discount_amount)}</span>
              </div>
            ) : null}
            <div className={ROW}>
              <span>UK delivery</span>
              <span className="tabular-nums">
                {parseFloat(order.shipping_cost || "0") === 0 ? "Free" : money(order.shipping_cost)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t-2 border-[#1b1b1b] pt-3 text-[18px] font-medium text-[#1b1b1b]">
            <span>Total paid</span>
            <span className="tabular-nums">{money(orderTotal)}</span>
          </div>
        </section>

        <div className="mt-8 text-center">
          <ButtonLink to="/shop">Continue shopping</ButtonLink>
          <p className="mt-8 text-[15px] text-[#6b6b70]">
            Have questions? Contact us at{" "}
            <a href="/contact" className="text-[#1b1b1b] underline underline-offset-4">
              our contact page
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
