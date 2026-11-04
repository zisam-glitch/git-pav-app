// The one place an order's money is worked out. All amounts are whole pence, so
// the page, the order row and the Stripe charge can't drift through rounding.

/**
 * Shop prices already include VAT at 20%, with no exempt products (owner, 5 Nov
 * 2026, D-23). VAT is reported as the part of the total that is tax, never added on top.
 */
export const VAT_RATE_PERCENT = 20;

const DEFAULT_SHIPPING_PENCE = 399;
const DEFAULT_FREE_SHIPPING_FROM_PENCE = 4000;

export interface PricedLine {
  productId: string;
  variantId: string | null;
  name: string;
  unitPence: number;
  quantity: number;
}

export interface ShippingRate {
  name: string;
  basePence: number;
  freeFromPence: number | null;
}

export interface DiscountRate {
  type: string;
  value: string | number;
}

export interface OrderTotals {
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  vatPence: number;
  totalPence: number;
}

export function toPence(pounds: string | number): number {
  const value = typeof pounds === "number" ? pounds : Number.parseFloat(pounds);
  if (!Number.isFinite(value)) throw new Error("Not a money amount");
  return Math.round(value * 100);
}

/** Pounds as a string for a NUMERIC(10,2) column. */
export function toPounds(pence: number): string {
  return (pence / 100).toFixed(2);
}

export function discountPence(subtotal: number, discount: DiscountRate | null): number {
  if (!discount) return 0;
  const amount =
    discount.type === "percentage" ? Math.round((subtotal * Number(discount.value)) / 100) : toPence(discount.value);
  return Math.max(0, Math.min(subtotal, amount));
}

export function shippingPence(subtotal: number, rate: ShippingRate | null): number {
  const base = rate ? rate.basePence : DEFAULT_SHIPPING_PENCE;
  const freeFrom = rate ? rate.freeFromPence : DEFAULT_FREE_SHIPPING_FROM_PENCE;
  return freeFrom !== null && subtotal >= freeFrom ? 0 : base;
}

export function priceOrder(
  lines: PricedLine[],
  shipping: ShippingRate | null,
  discount: DiscountRate | null,
): OrderTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPence * line.quantity, 0);
  const off = discountPence(subtotal, discount);
  const delivery = shippingPence(subtotal, shipping);
  const total = subtotal - off + delivery;
  return {
    subtotalPence: subtotal,
    discountPence: off,
    shippingPence: delivery,
    vatPence: Math.round((total * VAT_RATE_PERCENT) / (100 + VAT_RATE_PERCENT)),
    totalPence: total,
  };
}

/** Shares `discount` across lines by value, to the penny, using largest remainders. */
function allocateDiscount(lineTotals: number[], discount: number): number[] {
  const subtotal = lineTotals.reduce((sum, total) => sum + total, 0);
  if (subtotal === 0 || discount === 0) return lineTotals.map(() => 0);

  const exact = lineTotals.map((total) => (discount * total) / subtotal);
  const shares = exact.map(Math.floor);
  let left = discount - shares.reduce((sum, share) => sum + share, 0);
  const byRemainder = exact.map((value, index) => ({ index, remainder: value - Math.floor(value) }));
  byRemainder.sort((a, b) => b.remainder - a.remainder);
  for (const { index } of byRemainder) {
    if (left === 0) break;
    shares[index] += 1;
    left -= 1;
  }
  return shares;
}

export interface StripeLineItem {
  price_data: {
    currency: "gbp";
    product_data: { name: string; description?: string };
    unit_amount: number;
  };
  quantity: 1;
}

function stripeLine(name: string, amount: number, description?: string): StripeLineItem {
  return {
    price_data: {
      currency: "gbp",
      product_data: description ? { name, description } : { name },
      unit_amount: amount,
    },
    quantity: 1,
  };
}

/**
 * Stripe line items adding up to exactly `totals.totalPence`. Each product is a
 * single line for its whole quantity, because a discounted line total doesn't
 * always divide evenly by the quantity. Throws rather than charge a wrong amount.
 */
export function stripeLineItems(lines: PricedLine[], totals: OrderTotals, shippingName: string): StripeLineItem[] {
  const lineTotals = lines.map((line) => line.unitPence * line.quantity);
  const shares = allocateDiscount(lineTotals, totals.discountPence);

  const items = lines.map((line, index) =>
    stripeLine(
      line.quantity > 1 ? `${line.name} × ${line.quantity}` : line.name,
      lineTotals[index] - shares[index],
      shares[index] > 0 ? `Includes £${toPounds(shares[index])} off` : undefined,
    ),
  );
  if (totals.shippingPence > 0) items.push(stripeLine(`Delivery (${shippingName})`, totals.shippingPence));

  const charged = items.reduce((sum, item) => sum + item.price_data.unit_amount, 0);
  if (charged !== totals.totalPence) throw new Error("Stripe line items don't match the order total");
  return items;
}
