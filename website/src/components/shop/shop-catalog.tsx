import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CONTAINER, MUTED_TITLE, TITLE } from "@/components/pricing/tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SHOP_CATEGORIES } from "./shop-catalog-data";
import type { Product } from "./shop-data";

interface ShopCatalogProps {
  products?: Product[];
  isLoading?: boolean;
  unavailable?: boolean;
  onQuickView?: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, variant?: unknown) => void;
  hideHeading?: boolean;
  hideCategoryFilters?: boolean;
}

const SORT_OPTIONS = [
  { id: "featured", label: "Sort: Featured" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
] as const;

export function ShopCatalog({
  products = [],
  isLoading = false,
  unavailable = false,
  onQuickView,
  onAddToCart,
  hideHeading = false,
  hideCategoryFilters = false,
}: ShopCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map((p) => p.category));
    const orderedSlugs = [
      ...SHOP_CATEGORIES.map((c) => c.slug).filter((slug) => uniqueCategories.has(slug)),
      ...Array.from(uniqueCategories).filter(
        (slug) => !SHOP_CATEGORIES.some((c) => c.slug === slug),
      ),
    ];
    const categoryList = orderedSlugs.map((cat) => ({
      id: cat,
      label:
        SHOP_CATEGORIES.find((c) => c.slug === cat)?.name ||
        products.find((p) => p.category === cat)?.categoryLabel ||
        cat,
    }));
    return [{ id: "all", label: "All Products" }, ...categoryList];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchesCat =
        hideCategoryFilters || selectedCategory === "all" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });

    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, selectedCategory, sortBy, searchQuery, hideCategoryFilters]);

  const handleAdd = (product: Product) => {
    const defaultVariant = product.variants?.find((v) => v.stock_qty > 0) ?? null;
    onAddToCart(product, 1, defaultVariant);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const handleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const activeCategoryMeta =
    selectedCategory !== "all"
      ? SHOP_CATEGORIES.find((cat) => cat.slug === selectedCategory)
      : undefined;

  return (
    <section
      id="catalog"
      aria-label="Product catalogue"
      className="scroll-mt-20 bg-white pb-14 md:pb-24"
    >
      <div className={CONTAINER}>
        {!hideHeading ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className={TITLE}>
                Our <span className={MUTED_TITLE}>Products</span>
              </h2>
            </div>
            {!isLoading && products.length > 0 ? (
              <p className="text-small text-subtle tabular-nums">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Filter Controls Row */}
        <div
          className={cn(
            "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
            !hideHeading && "mt-10",
          )}
        >
          {!hideCategoryFilters && categories.length > 1 ? (
            <>
              <div className="sm:hidden">
                <Select
                  aria-label="Filter by category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="hidden flex-1 flex-wrap items-center gap-2 sm:flex">
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-full px-4 py-2 text-[15px] t-colors",
                        active
                          ? "bg-[#1b1b1b] text-white"
                          : "bg-[#f4f1ea] text-[#1b1b1b] hover:bg-[#ebe6dc]",
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-small text-subtle tabular-nums">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          )}

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:ml-auto">
            <div className="relative w-full sm:w-64">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle"
              />
              <Input
                type="search"
                aria-label="Search products"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-full border-0 bg-[#f4f1ea] pl-10"
              />
            </div>
          </div>
        </div>

        {!hideCategoryFilters && activeCategoryMeta ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f6f6f4] px-5 py-3.5 text-small">
            <span className="text-muted">
              Viewing <strong className="font-medium text-fg">{activeCategoryMeta.name}</strong> —{" "}
              {activeCategoryMeta.description}
            </span>
            <Link
              to="/category/$slug"
              params={{ slug: activeCategoryMeta.slug }}
              className="inline-flex shrink-0 items-center gap-1.5 font-medium text-fg underline underline-offset-4 t-colors hover:text-terracotta"
            >
              <span>Open {activeCategoryMeta.name} page</span>
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        ) : null}

        {/* Product Grid */}
        {isLoading ? (
          <div className="mt-10 rounded-[22px] bg-[#f6f6f4] p-10 text-center md:p-14">
            <p className="text-h4 text-fg">Loading products...</p>
            <p className="mt-2 text-small text-muted">
              Please wait while we load our dental care catalogue.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-[22px] bg-[#f6f6f4] p-10 text-center md:p-14">
            <p className="text-h4 text-fg">
              {unavailable
                ? "Shop catalogue temporarily unavailable"
                : products.length === 0
                  ? "No products available in this category"
                  : "No matching products found"}
            </p>
            <p className="mt-2 text-small text-muted">
              {unavailable
                ? "Our online store is currently being updated. Please check back shortly or call 0800 1938 786."
                : products.length === 0
                  ? "Explore our full Happy Tooth catalogue."
                  : "Try resetting your search query or selecting another category."}
            </p>
            {products.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-6"
              >
                Show All Products
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {filteredProducts.map((product) => (
              <ProductRevealCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                isJustAdded={justAddedId === product.id}
                onAdd={() => handleAdd(product)}
                onFavorite={() => handleFavorite(product.id)}
                onQuickView={onQuickView ? () => onQuickView(product) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
