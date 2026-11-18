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
    image:
      p.image ||
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85",
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
    <main className="min-h-screen bg-[#FBF8F5] text-fg">
      <ScrollProgress />
      <Header />

      <div className="pt-24 sm:pt-28">
        <div className="mx-auto max-w-[108rem] px-3 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[87rem] border-b border-black/10 pb-6">
            <div className="flex items-center justify-between">
              <a
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-medium text-black/60 transition-colors hover:text-black"
              >
                <ArrowLeft className="size-3.5" />
                <span>All Categories</span>
              </a>
              <span className="rounded-full bg-[#F2EDE5] px-3 py-1 text-xs font-medium text-[#754B3D]">
                Category
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              {categoryTitle}
            </h1>
          </div>
        </div>

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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-black px-5 py-3 text-white shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-colors duration-200 hover:bg-[#1B3745]"
        aria-label="View shopping bag"
      >
        <div className="relative">
          <ShoppingBag className="size-4" />
          {totalItemCount > 0 && (
            <span className="absolute -top-2 -right-2.5 flex size-4 items-center justify-center rounded-full bg-[#ECD880] text-[10px] font-semibold text-[#1B3745]">
              {totalItemCount}
            </span>
          )}
        </div>
        <span className="hidden text-xs font-medium sm:inline">
          View Bag ({totalItemCount})
        </span>
      </button>

      <Footer />
    </main>
  );
}
