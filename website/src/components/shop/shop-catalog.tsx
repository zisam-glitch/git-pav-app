import { useState, useMemo } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import type { Product } from "./shop-data";

interface ShopCatalogProps {
  products?: Product[];
  isLoading?: boolean;
  onQuickView?: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, variant?: any) => void;
}

export function ShopCatalog({
  products = [],
  isLoading = false,
  onQuickView,
  onAddToCart,
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

  const sortOptions = [
    { id: "featured", label: "Sort: Featured" },
    { id: "price_asc", label: "Price: Low to High" },
    { id: "price_desc", label: "Price: High to Low" },
  ];

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

  return (
    <section id="catalog" className="bg-[#FBF8F5] py-12 sm:py-16">
      <div className="mx-auto max-w-[108rem] px-3 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[87rem]">
          {/* Section Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-black/10 pb-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Clinical Essentials
              </p>
              <h2 className="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
                Our Products
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-black/65">
              Professional dental care products selected by our clinical team for your daily oral
              health routine.
            </p>
          </div>

          {/* Filter Controls Row */}
          <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3745] focus-visible:ring-offset-2 ${
                    selectedCategory === cat.id
                      ? "bg-black text-white"
                      : "border border-black/12 bg-white text-black/75 hover:bg-[#F2EDE5] hover:text-black"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex w-full items-center justify-between gap-2.5 md:w-auto md:justify-end">
              <div className="relative flex-1 md:w-60">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-black/45" />
                <input
                  type="text"
                  aria-label="Search products"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-full border border-black/12 bg-white pl-9 pr-4 text-xs text-black placeholder:text-black/45 focus:border-black focus:outline-none"
                />
              </div>

              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 rounded-full border border-black/12 bg-white px-4 text-xs font-medium text-black focus:border-black focus:outline-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-[1.5rem] border border-black/8 bg-[#FAF8F2] p-6"
                >
                  <div className="space-y-3">
                    <div className="h-3 w-24 rounded-full bg-black/8 animate-pulse" />
                    <div className="h-6 w-3/4 rounded-lg bg-black/8 animate-pulse" />
                    <div className="h-4 w-16 rounded-full bg-black/8 animate-pulse" />
                  </div>
                  <div className="my-6 aspect-[4/3] w-full rounded-2xl bg-white/80 animate-pulse" />
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="h-11 rounded-full bg-black/10 animate-pulse" />
                    <div className="h-11 rounded-full bg-black/6 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const isAdded = justAddedId === product.id;
                const isFavorite = favorites.has(product.id);

                return (
                  <ProductRevealCard
                    key={product.id}
                    product={product}
                    isFavorite={isFavorite}
                    isJustAdded={isAdded}
                    onAdd={() => handleAdd(product)}
                    onFavorite={() => handleFavorite(product.id)}
                    onQuickView={() => {
                      if (onQuickView) {
                        onQuickView(product);
                      } else {
                        navigate({
                          to: "/shop/$productSlug",
                          params: { productSlug: product.slug },
                        });
                      }
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-[#FAF8F2] p-10 sm:p-14 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#F2EDE5] text-[#1B3745]">
                <ShoppingBag className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                {products.length === 0 ? "Our Online Shop is Coming Soon!" : "No products found"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black/65">
                {products.length === 0
                  ? "We're working hard to bring you the best dental care products. Stay tuned for our launch!"
                  : "Try resetting your search query or selecting another category."}
              </p>
              {products.length > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-6 h-10 px-6"
                >
                  Show All Products
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
