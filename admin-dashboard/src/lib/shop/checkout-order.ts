import type { QueryFn } from "@/lib/db/client";

import {
  type DiscountRate,
  type OrderTotals,
  type PricedLine,
  priceOrder,
  type ShippingRate,
  toPence,
  toPounds,
} from "./pricing.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LINES = 50;
const MAX_QUANTITY = 100;
// The checkout page adds up floats, so a rounding tie can differ by a penny.
const TOTAL_TOLERANCE_PENCE = 1;

/** The customer's request can't be honoured. Thrown inside the transaction, so nothing is saved. */
export class CheckoutRejected extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface CheckoutInput {
  items: { productId: string; variantId: string | null; quantity: number }[];
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: unknown;
  billingAddress: unknown;
  shippingMethodId: string | null;
  discountCode: string | null;
  notes: string | null;
  cartSessionId: string;
  expectedTotal: number | null;
}

export function parseCheckoutBody(body: Record<string, any>): CheckoutInput {
  const { items, customerEmail, shippingMethodId, discountCode, expectedTotal, sessionId } = body ?? {};

  if (!Array.isArray(items) || items.length === 0) throw new CheckoutRejected(400, "Cart items cannot be empty");
  if (items.length > MAX_LINES) throw new CheckoutRejected(400, "Too many items in one order");

  const parsedItems = items.map((item) => {
    const quantity = item?.quantity ?? 1;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new CheckoutRejected(400, "Item quantity must be a whole number between 1 and 100");
    }
    if (typeof item?.productId !== "string" || !UUID.test(item.productId)) {
      throw new CheckoutRejected(400, "Product not found");
    }
    const variantId = item.variantId || null;
    if (variantId !== null && (typeof variantId !== "string" || !UUID.test(variantId))) {
      throw new CheckoutRejected(400, "Product option not found");
    }
    return { productId: item.productId as string, variantId: variantId as string | null, quantity: quantity as number };
  });

  if (typeof customerEmail !== "string" || !EMAIL.test(customerEmail.trim())) {
    throw new CheckoutRejected(400, "A valid email address is required");
  }
  if (shippingMethodId && (typeof shippingMethodId !== "string" || !UUID.test(shippingMethodId))) {
    throw new CheckoutRejected(400, "That delivery option is no longer available");
  }
  if (discountCode && typeof discountCode !== "string") {
    throw new CheckoutRejected(400, "That discount code can't be used");
  }
  if (expectedTotal !== undefined && expectedTotal !== null && !Number.isFinite(expectedTotal)) {
    throw new CheckoutRejected(400, "Invalid order total");
  }

  return {
    items: parsedItems,
    customerEmail: customerEmail.trim(),
    customerPhone: typeof body.customerPhone === "string" && body.customerPhone ? body.customerPhone : null,
    shippingAddress: body.shippingAddress ?? {},
    billingAddress: body.billingAddress ?? body.shippingAddress ?? {},
    shippingMethodId: shippingMethodId || null,
    discountCode: discountCode ? discountCode.trim().toUpperCase() : null,
    notes: typeof body.notes === "string" && body.notes ? body.notes : null,
    // Stripe metadata values are limited to 500 characters.
    cartSessionId: typeof sessionId === "string" ? sessionId.slice(0, 200) : "",
    expectedTotal: expectedTotal ?? null,
  };
}

async function resolveLines(tx: QueryFn, items: CheckoutInput["items"]): Promise<PricedLine[]> {
  const lines: PricedLine[] = [];
  const wantedByVariant = new Map<string, number>();

  for (const item of items) {
    const [product] = await tx<any>("SELECT id, name, price, in_stock FROM products WHERE id = $1 AND published = true", [
      item.productId,
    ]);
    if (!product) throw new CheckoutRejected(400, "A product in your bag is no longer available");
    if (product.in_stock === false) throw new CheckoutRejected(400, `${product.name} is out of stock`);

    let unitPence = toPence(product.price);
    let name = product.name as string;

    if (item.variantId) {
      // A variant's price only applies to its own product.
      const [variant] = await tx<any>(
        `SELECT sku, price_override, stock_qty FROM product_variants
         WHERE id = $1 AND product_id = $2 AND is_active = true`,
        [item.variantId, item.productId],
      );
      if (!variant) throw new CheckoutRejected(400, `That option of ${product.name} is no longer available`);

      const wanted = (wantedByVariant.get(item.variantId) ?? 0) + item.quantity;
      wantedByVariant.set(item.variantId, wanted);
      if ((variant.stock_qty ?? 0) < wanted) {
        throw new CheckoutRejected(400, `Only ${variant.stock_qty ?? 0} left of ${product.name} (${variant.sku})`);
      }

      if (variant.price_override !== null) unitPence = toPence(variant.price_override);
      name = `${product.name} (${variant.sku})`;
    }

    lines.push({ productId: product.id, variantId: item.variantId, name, unitPence, quantity: item.quantity });
  }
  return lines;
}

async function resolveShipping(tx: QueryFn, shippingMethodId: string | null): Promise<(ShippingRate & { id: string }) | null> {
  if (!shippingMethodId) return null;
  const [method] = await tx<any>("SELECT * FROM shipping_methods WHERE id = $1 AND is_active = true", [shippingMethodId]);
  if (!method) throw new CheckoutRejected(400, "That delivery option is no longer available");
  return {
    id: method.id,
    name: method.name,
    basePence: toPence(method.base_price),
    freeFromPence: method.free_shipping_threshold ? toPence(method.free_shipping_threshold) : null,
  };
}

async function resolveDiscount(
  tx: QueryFn,
  code: string | null,
  subtotalPence: number,
): Promise<(DiscountRate & { id: string }) | null> {
  if (!code) return null;
  const unusable = new CheckoutRejected(400, "That discount code can't be used on this order");

  const [discount] = await tx<any>("SELECT * FROM discounts WHERE UPPER(code) = $1 AND is_active = true", [code]);
  if (!discount) throw unusable;

  const now = new Date();
  if (discount.valid_from && new Date(discount.valid_from) > now) throw unusable;
  if (discount.valid_until && new Date(discount.valid_until) < now) throw unusable;
  if (discount.min_order_value && subtotalPence < toPence(discount.min_order_value)) throw unusable;

  // Holds one use now, atomically, so two checkouts can't both take the last use.
  // It is given back if the order is never paid (releaseOrderDiscount).
  const held = await tx(
    `UPDATE discounts SET used_count = COALESCE(used_count, 0) + 1
     WHERE id = $1 AND (max_uses IS NULL OR COALESCE(used_count, 0) < max_uses)
     RETURNING id`,
    [discount.id],
  );
  if (held.length === 0) throw unusable;

  return { id: discount.id, type: discount.type, value: discount.value };
}

export interface PlacedOrder {
  orderId: string;
  lines: PricedLine[];
  totals: OrderTotals;
  shippingName: string;
}

/** Validates against current prices and stock, then saves the order. Run in a transaction. */
export async function placeOrder(tx: QueryFn, input: CheckoutInput, userId: string | null): Promise<PlacedOrder> {
  const lines = await resolveLines(tx, input.items);
  const subtotalPence = lines.reduce((sum, line) => sum + line.unitPence * line.quantity, 0);
  const shipping = await resolveShipping(tx, input.shippingMethodId);
  const discount = await resolveDiscount(tx, input.discountCode, subtotalPence);
  const totals = priceOrder(lines, shipping, discount);

  if (
    input.expectedTotal !== null &&
    Math.abs(toPence(input.expectedTotal) - totals.totalPence) > TOTAL_TOLERANCE_PENCE
  ) {
    throw new CheckoutRejected(
      409,
      `Your order total has changed to £${toPounds(totals.totalPence)}. Please review your bag and try again.`,
    );
  }

  const [order] = await tx<{ id: string }>(
    `INSERT INTO orders (
      user_id, customer_email, customer_phone, shipping_address, billing_address,
      subtotal, shipping_cost, discount_amount, tax_amount, total, notes, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
    RETURNING id`,
    [
      userId,
      input.customerEmail,
      input.customerPhone,
      JSON.stringify(input.shippingAddress),
      JSON.stringify(input.billingAddress),
      toPounds(totals.subtotalPence),
      toPounds(totals.shippingPence),
      toPounds(totals.discountPence),
      toPounds(totals.vatPence),
      toPounds(totals.totalPence),
      input.notes,
    ],
  );

  for (const line of lines) {
    await tx(
      `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [order.id, line.productId, line.variantId, line.quantity, toPounds(line.unitPence)],
    );
  }
  if (discount) {
    await tx("INSERT INTO order_discounts (order_id, discount_id, amount_off) VALUES ($1, $2, $3)", [
      order.id,
      discount.id,
      toPounds(totals.discountPence),
    ]);
  }
  if (shipping) {
    await tx("INSERT INTO order_shipping (order_id, shipping_method_id) VALUES ($1, $2)", [order.id, shipping.id]);
  }

  return { orderId: order.id, lines, totals, shippingName: shipping?.name ?? "Standard UK" };
}

/** Gives back the discount use an unpaid order was holding. Safe to call twice. */
export async function releaseOrderDiscount(tx: QueryFn, orderId: string): Promise<void> {
  const released = await tx<{ discount_id: string | null }>(
    "DELETE FROM order_discounts WHERE order_id = $1 RETURNING discount_id",
    [orderId],
  );
  for (const { discount_id } of released) {
    if (!discount_id) continue;
    await tx("UPDATE discounts SET used_count = GREATEST(COALESCE(used_count, 0) - 1, 0) WHERE id = $1", [discount_id]);
  }
}

/** The payment page couldn't be opened, so the order will never be paid. */
export async function abandonOrder(tx: QueryFn, orderId: string): Promise<void> {
  await tx("UPDATE orders SET status = 'cancelled', updated_at = now() WHERE id = $1 AND status = 'pending'", [orderId]);
  await releaseOrderDiscount(tx, orderId);
}
