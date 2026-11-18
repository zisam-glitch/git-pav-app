import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Heading, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Product } from "./shop-data";

interface ShopCatalogProps {
  products?: Product[];
  isLoading?: boolean;
  onQuickView?: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, variant?: unknown) => void;
  hideHeading?: boolean;
}

const SORT_OPTIONS = [
  { id: "featured", label: "Sort: Featured" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
] as const;

export function ShopCatalog({
  products = [],
  isLoading = false,
  onQuickView,
  onAddToCart,
  hideHeading = false,
}: ShopCatalogProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map((p) => p.category));
    const categoryList = Array.from(uniqueCategories).map((cat) => ({
      id: cat,
      label: products.find((p) => p.category === cat)?.categoryLabel || cat,
    }));
    return [{ id: "all", label: "All Products" }, ...categoryList];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
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
  }, [products, selectedCategory, sortBy, searchQuery]);

  const handleAdd = (product: Product) => {
    onAddToCart(product, 1);
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

  const handleQuickView = (product: Product) => {
    if (onQuickView) {
      onQuickView(product);
      return;
    }
    navigate({ to: "/shop/$productSlug", params: { productSlug: product.slug } });
  };

  return (
    <Section id="catalog" theme="white" aria-label="Product catalogue">
      {!hideHeading ? (
        <div className="max-w-2xl">
          <Heading as="h2" size="h2" accent="Products" tone="terracotta" inline>
            Our
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Professional dental care products designed by our clinical team for your daily oral
            health routine.
          </p>
        </div>
      ) : null}

      {/* Filter Controls Row */}
      <div
        className={cn(
          "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
          !hideHeading && "mt-10",
        )}
      >
        {categories.length > 1 ? (
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
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-pill border px-4 py-2 text-small font-medium t-colors",
                      active
                        ? "border-black bg-black text-white"
                        : "border-border bg-cream text-fg hover:border-black",
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div />
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-60">
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
              className="h-12 pl-10"
            />
          </div>

          <div className="w-full sm:w-52">
            <Select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 leading-[2.75rem]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <Tile tone="cream" className="mt-10 p-10 text-center md:p-14">
          <p className="text-h4 text-fg">Loading products...</p>
          <p className="mt-2 text-small text-muted">
            Please wait while we fetch our dental care products.
          </p>
        </Tile>
      ) : filteredProducts.length === 0 ? (
        <Tile tone="cream" className="mt-10 p-10 text-center md:p-14">
          <p className="text-h4 text-fg">
            {products.length === 0 ? "No products available" : "No products found"}
          </p>
          <p className="mt-2 text-small text-muted">
            {products.length === 0
              ? "Check back soon for new dental care products."
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
        </Tile>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductRevealCard
              key={product.id}
              product={product}
              isFavorite={favorites.has(product.id)}
              isJustAdded={justAddedId === product.id}
              onAdd={() => handleAdd(product)}
              onFavorite={() => handleFavorite(product.id)}
              onQuickView={() => handleQuickView(product)}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
