import { createFileRoute, Link } from "@tanstack/react-router";
import { shopCategoryHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { CategoryHero } from "@/components/hims/category-hero";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCartStore } from "@/lib/cart-store";
import { useQuery } from "@tanstack/react-query";
import { api, HAS_API_BASE } from "@/lib/api";
import { useState } from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import type { Product } from "@/components/shop/shop-data";
import { getCatalogProductsByCategory } from "@/components/shop/shop-catalog-data";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => shopCategoryHead(params.slug),
  component: CategoryRoute,
});

function CategoryRoute() {
  const { slug } = Route.useParams();
  const { items, addItem, updateQuantity, removeItem, clearCart } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    data: apiProducts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: () => api.products.list({ category: slug }),
    enabled: HAS_API_BASE,
    retry: false,
  });

  const apiMapped: Product[] = (apiProducts || []).map((p) => ({
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
    image: p.image || "",
    shortDesc: p.short_desc || "",
    fullDesc: p.full_desc || "",
    features: Array.isArray(p.features) ? p.features : [],
    howToUse: p.how_to_use || "",
    badge: p.badge || undefined,
    inStock: p.in_stock,
  }));

  // The API owns the catalogue when it answers; otherwise the clinic's local catalogue fills the page.
  const productsToDisplay: Product[] =
    apiMapped.length > 0 ? apiMapped : getCatalogProductsByCategory(slug);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const categoryTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />

      <CategoryHero
        id="top"
        label="Category header"
        eyebrow={
          <Link
            to="/shop"
            className="inline-flex min-h-11 items-center gap-2 text-small font-medium text-muted t-colors hover:text-fg"
          >
            <ArrowLeft aria-hidden className="size-4" />
            <span>All Categories</span>
          </Link>
        }
        title={categoryTitle}
      />

      <ShopCatalog
        products={productsToDisplay}
        isLoading={isLoading && productsToDisplay.length === 0}
        unavailable={(!HAS_API_BASE || isError) && productsToDisplay.length === 0}
        hideHeading
        onAddToCart={(p) => {
          addItem(p, 1);
          setIsCartOpen(true);
        }}
      />

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
        className="fixed right-6 bottom-6 z-40 inline-flex h-12 items-center gap-2.5 rounded-pill bg-black px-5 text-label text-white shadow-card t-colors hover:bg-black/85"
        aria-label={`View shopping bag (${totalItemCount} items)`}
      >
        <div className="relative">
          <ShoppingBag aria-hidden className="size-5" />
          {totalItemCount > 0 ? (
            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-pill bg-gold text-caption font-medium text-brown tabular-nums">
              {totalItemCount}
            </span>
          ) : null}
        </div>
        <span className="hidden sm:inline">View Bag ({totalItemCount})</span>
      </button>

      <Footer />
    </main>
  );
}
