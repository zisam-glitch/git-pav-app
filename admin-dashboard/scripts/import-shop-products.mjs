// Adds the live shop's 10 products to the dashboard catalogue through the staff API.
// Run it yourself, with your own staff account, from admin-dashboard/:
//
//   DASHBOARD_URL=https://<dashboard host> \
//   STAFF_EMAIL=<your staff email> STAFF_PASSWORD=<your password> \
//   node scripts/import-shop-products.mjs            # add `--dry-run` to only print the requests
//
// Products are created unpublished and out of stock. Publish them and add SKUs and stock in the dashboard.
// Passwords are read from the environment only; nothing is written to disk.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(path.join(here, "../../docs/completion/shop-products-2026-11-23.json"), "utf8"));

const base = process.env.DASHBOARD_URL;
const email = process.env.STAFF_EMAIL;
const password = process.env.STAFF_PASSWORD;
const mfaCode = process.env.MFA_CODE;
const dryRun = process.argv.includes("--dry-run");

if (!dryRun && (!base || !email || !password)) {
  console.error("Set DASHBOARD_URL, STAFF_EMAIL and STAFF_PASSWORD (or pass --dry-run).");
  process.exit(1);
}

const productBody = (p) => ({
  name: p.name,
  slug: p.slug,
  price: p.price,
  original_price: p.original_price ?? undefined,
  in_stock: false,
  published: false,
});

if (dryRun) {
  for (const p of data.products) console.log(JSON.stringify(productBody(p)));
  process.exit(0);
}

const login = await fetch(`${base}/api/v1/admin/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, ...(mfaCode ? { mfaCode } : {}) }),
});
const cookie = login.headers.get("set-cookie");
if (!login.ok || !cookie) {
  console.error(`Sign-in failed (HTTP ${login.status}). Check the account, or MFA_CODE if it needs one.`);
  process.exit(1);
}
const session = cookie.split(";")[0];

// One request: the import is all or nothing, so nothing is written if any product fails.
const res = await fetch(`${base}/api/v1/admin/products/import`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: session },
  body: JSON.stringify({ products: data.products.map(productBody) }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`Import failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
  process.exit(1);
}
console.log(`Added ${data.products.length} products as unpublished and out of stock: ${text}`);
