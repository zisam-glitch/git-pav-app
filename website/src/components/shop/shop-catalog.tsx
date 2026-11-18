import { useState, useMemo } from "react";
import { Search } from "lucide-react";
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

export function ShopCatalog({ products = [], isLoading = false, onQuickView, onAddToCart }: ShopCatalogProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    const categoryList = Array.from(uniqueCategories).map(cat => ({
      id: cat,
      label: products.find(p => p.category === cat)?.categoryLabel || cat
    }));
    return [
      { id: "all", label: "All Products" },
      ...categoryList
    ];
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
    <section id="catalog" className="py-20 sm:py-28 bg-[#2a1c12] border-b border-[#e2d4c0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
            Our Products
          </h2>
          <p className="mt-4 text-white/80 text-sm sm:text-base leading-relaxed">
            Professional dental care products designed by our clinical team for your daily oral health routine.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
          {/* Category tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "accent-gradient text-white shadow-sm"
                    : "bg-white/10 text-white border border-white/20 hover:border-[#925a27] hover:bg-white/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="relative flex-1 md:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-white/20 bg-white/10 pl-8 pr-3 text-xs text-white placeholder:text-white/60 focus:border-[#925a27] focus:outline-none"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-xl border border-white/20 bg-white/10 px-3 text-xs text-white font-medium focus:border-[#925a27] focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
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
                  // Navigate to product detail page using slug
                  navigate({ to: "/shop/$productSlug", params: { productSlug: product.slug } });
                }}
              />
            );
          })}
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/10 p-12 text-center">
            <p className="font-display text-xl font-bold text-white">Loading products...</p>
            <p className="mt-1 text-xs text-white/60">Please wait while we fetch our dental care products.</p>
          </div>
        ) : filteredProducts.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/10 p-12 text-center">
            <p className="font-display text-xl font-bold text-white">
              {products.length === 0 ? "No products available" : "No products found"}
            </p>
            <p className="mt-1 text-xs text-white/60">
              {products.length === 0 
                ? "Check back soon for new dental care products."
                : "Try resetting your search query or selecting another category."}
            </p>
            {products.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 border-white/20 text-white hover:bg-white/20"
              >
                Show All Products
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

