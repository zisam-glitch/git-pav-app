// Test helper: an in-memory Postgres with the dashboard's real migrations applied,
// so the shop's SQL is run for real rather than mocked.
import fs from "node:fs";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS = path.join(import.meta.dirname, "../db/migrations");

export async function createTestDb() {
  const pg = new PGlite();
  await pg.waitReady;

  const runMigrations = async () => {
    for (const file of fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
      // The app logs and carries on past a failing migration, so match it here,
      // then fail below if a table the shop needs didn't get created.
      await pg.exec(fs.readFileSync(path.join(MIGRATIONS, file), "utf8")).catch(() => undefined);
    }
  };
  await runMigrations();

  const wrap = (runner) => async (text, params = []) => (await runner.query(text, params)).rows;
  const query = wrap(pg);
  const transaction = (fn) => pg.transaction((tx) => fn(wrap(tx)));

  await query("SELECT 1 FROM processed_stripe_events LIMIT 1");
  await query("SELECT amount_refunded FROM payments LIMIT 1");

  let counter = 0;
  const unique = () => `${Date.now()}-${++counter}`;

  return {
    query,
    transaction,
    runMigrations,
    close: () => pg.close(),

    async product({ price = "50.00", inStock = true } = {}) {
      const id = unique();
      const [row] = await query(
        `INSERT INTO products (name, slug, price, in_stock, published, category, category_label, short_desc, full_desc, how_to_use)
         VALUES ($1, $2, $3, $4, true, 'test', 'Test', 'short', 'full', 'use')
         RETURNING id`,
        [`Product ${id}`, `product-${id}`, price, inStock],
      );
      return row.id;
    },

    async variant(productId, { stock = 10, priceOverride = null } = {}) {
      const [row] = await query(
        `INSERT INTO product_variants (product_id, sku, attributes, price_override, stock_qty)
         VALUES ($1, $2, '{}', $3, $4) RETURNING id`,
        [productId, `SKU-${unique()}`, priceOverride, stock],
      );
      return row.id;
    },

    async discount({ type = "percentage", value = "10", maxUses = null } = {}) {
      const code = `CODE${unique()}`.replace(/-/g, "");
      await query("INSERT INTO discounts (code, type, value, max_uses) VALUES ($1, $2, $3, $4)", [
        code,
        type,
        value,
        maxUses,
      ]);
      return code;
    },

    async stockOf(variantId) {
      const [row] = await query("SELECT stock_qty FROM product_variants WHERE id = $1", [variantId]);
      return row.stock_qty;
    },

    async order(id) {
      const [row] = await query("SELECT * FROM orders WHERE id = $1", [id]);
      return row;
    },
  };
}
