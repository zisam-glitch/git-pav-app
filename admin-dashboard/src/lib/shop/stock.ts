import type { QueryFn } from "@/lib/db/client";

// Each change locks the variant row, so simultaneous orders can't overwrite each
// other's count. Must run inside a transaction.
export async function changeVariantStock(
  tx: QueryFn,
  change: {
    variantId: string;
    quantityChange: number;
    reason: "sale" | "return";
    orderId: string;
    notes: string;
  },
): Promise<void> {
  const [variant] = await tx<{ stock_qty: number }>("SELECT stock_qty FROM product_variants WHERE id = $1 FOR UPDATE", [
    change.variantId,
  ]);
  if (!variant) return;

  const previous = variant.stock_qty ?? 0;
  const next = Math.max(0, previous + change.quantityChange);
  const oversold = previous + change.quantityChange < 0;
  if (oversold) console.error(`[shop] Order ${change.orderId} was paid for more stock than was left`);

  await tx("UPDATE product_variants SET stock_qty = $1, updated_at = now() WHERE id = $2", [next, change.variantId]);
  await tx(
    `INSERT INTO inventory_logs (variant_id, quantity_change, previous_qty, new_qty, reason, order_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      change.variantId,
      next - previous,
      previous,
      next,
      change.reason,
      change.orderId,
      oversold ? `${change.notes} (oversold)` : change.notes,
    ],
  );
}
