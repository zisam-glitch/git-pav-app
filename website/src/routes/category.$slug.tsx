import { createFileRoute } from "@tanstack/react-router";
import { shopCategoryHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCartStore } from "@/lib/cart-store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import type { Product } from "@/components/shop/shop-data";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => shopCategoryHead(params.slug),
  component: CategoryRoute,
});

function CategoryRoute() {
  const { slug } = Route.useParams();
  const { items, addItem, updateQuantity, removeItem, clearCart } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: apiProducts, isLoading } = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: () => api.products.list({ category: slug }),
  });

  const productsToDisplay: Product[] = (apiProducts || []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category || "dental-care",
    categoryLabel: p.category_label || p.category_name || "Dental Care",
    price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
    originalPrice: p.original_price
      ? typeof p.original_price === "string"
        ? parseFloat(p.original_price)
        : p.original_price
      : undefined,
    image: p.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85",
    shortDesc: p.short_desc || "",
    fullDesc: p.full_desc || "",
    features: Array.isArray(p.features) ? p.features : [],
    howToUse: p.how_to_use || "",
    badge: p.badge || undefined,
    inStock: p.in_stock,
  }));

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const categoryTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />

      <div className="bg-[#faf6f0] border-b border-[#e2d4c0] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/shop" className="inline-flex items-center gap-2 text-xs text-muted hover:text-primary">
            <ArrowLeft className="size-4" />
            <span>All Categories</span>
          </a>
          <span className="text-xs font-semibold text-[#844d1e] uppercase">{categoryTitle}</span>
        </div>
      </div>

      <div className="py-12">
        <ShopCatalog
          products={productsToDisplay}
          isLoading={isLoading}
          onAddToCart={(p) => {
            addItem(p, 1);
            setIsCartOpen(true);
          }}
        />
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items.map((it) => ({
          product: {
            id: it.productId,
            name: it.name,
            slug: it.slug,
            category: it.category || "dental-care",
            categoryLabel: it.categoryLabel || "Dental Care",
            price: it.unitPrice,
            image: it.image,
            shortDesc: "",
            fullDesc: "",
            features: [],
            howToUse: "",
            inStock: true,
          },
          quantity: it.quantity,
        }))}
        onUpdateQuantity={(productId, qty) => {
          const it = items.find((i) => i.productId === productId);
          if (it) updateQuantity(it.id, qty);
        }}
        onRemoveItem={(productId) => {
          const it = items.find((i) => i.productId === productId);
          if (it) removeItem(it.id);
        }}
        onClearCart={clearCart}
      />

      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full accent-gradient px-4 py-3 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="View shopping bag"
      >
        <div className="relative">
          <ShoppingBag className="size-5" />
          {totalItemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-white text-primary text-[10px] font-bold shadow-xs">
              {totalItemCount}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold hidden sm:inline">
          View Bag ({totalItemCount})
        </span>
      </button>

      <Footer />
    </main>
  );
}

