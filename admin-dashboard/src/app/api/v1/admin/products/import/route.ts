import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/middleware";
import { query, withTransaction } from "@/lib/db/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN ?? "http://localhost:8080",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MAX_PRODUCTS = 100;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ImportProduct = {
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  in_stock: boolean;
  published: boolean;
};

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: CORS_HEADERS });

function parsePrice(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100000) return null;
  return Math.round(n * 100) / 100;
}

/** Checks the whole batch and returns the cleaned rows, or the first problem found. */
function validate(raw: unknown): { products: ImportProduct[] } | { error: string } {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { products?: unknown }).products)) {
    return { error: "Body must be { products: [...] }" };
  }
  const list = (raw as { products: unknown[] }).products;
  if (list.length === 0) return { error: "No products to import" };
  if (list.length > MAX_PRODUCTS) return { error: `Import at most ${MAX_PRODUCTS} products at a time` };

  const seen = new Set<string>();
  const products: ImportProduct[] = [];
  for (const [i, item] of list.entries()) {
    const row = (item ?? {}) as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const slug = typeof row.slug === "string" ? row.slug.trim() : "";
    const price = parsePrice(row.price);
    if (!name || name.length > 200) return { error: `Product ${i + 1}: name is required (max 200 characters)` };
    if (!slug || slug.length > 120 || !SLUG_PATTERN.test(slug)) {
      return { error: `Product ${i + 1}: slug must be lowercase letters, numbers and hyphens` };
    }
    if (price === null) return { error: `Product ${i + 1}: price must be a number from 0 to 100000` };
    if (seen.has(slug)) return { error: `Slug "${slug}" appears more than once in this import` };
    seen.add(slug);

    const originalRaw = row.original_price;
    const original_price = originalRaw === undefined || originalRaw === null ? null : parsePrice(originalRaw);
    if (originalRaw !== undefined && originalRaw !== null && original_price === null) {
      return { error: `Product ${i + 1}: original_price must be a number from 0 to 100000` };
    }

    products.push({
      name,
      slug,
      price,
      original_price,
      // Off unless the import says otherwise: a product is only sold once it has stock and is published.
      in_stock: row.in_stock === true,
      published: row.published === true,
    });
  }
  return { products };
}

/**
 * POST /api/v1/admin/products/import
 * Body: { products: [{ name, slug, price, original_price?, in_stock?, published? }] } (up to 100).
 * All or nothing: if any row is invalid, or any slug already exists, nothing is written.
 */
export async function POST(request: Request) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Body must be JSON");
  }

  const checked = validate(body);
  if ("error" in checked) return fail(checked.error);
  const { products } = checked;

  try {
    const existing = await query<{ slug: string }>("SELECT slug FROM products WHERE slug = ANY($1::text[])", [
      products.map((p) => p.slug),
    ]);
    if (existing.length > 0) {
      return fail(`These slugs already exist: ${existing.map((r) => r.slug).join(", ")}`, 409);
    }

    const created = await withTransaction(async (tx) => {
      const slugs: string[] = [];
      for (const p of products) {
        await tx(
          `INSERT INTO products (name, slug, price, original_price, in_stock, published)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [p.name, p.slug, p.price, p.original_price, p.in_stock, p.published],
        );
        slugs.push(p.slug);
      }
      return slugs;
    });

    return NextResponse.json({ created }, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error("[POST /api/v1/admin/products/import]", error);
    return fail("Failed to import products", 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
