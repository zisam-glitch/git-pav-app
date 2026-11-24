import { createFileRoute, Link } from "@tanstack/react-router";
import { shopCategoryHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { CONTAINER, LEAD, MUTED_TITLE, TITLE } from "@/components/pricing/tokens";
import { ShopCatalog } from "@/components/shop/shop-catalog";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCartStore } from "@/lib/cart-store";
import { useQuery } from "@tanstack/react-query";
import { api, HAS_API_BASE } from "@/lib/api";
import { useState } from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import {
  getCatalogProductsByCategory,
  getCategoryMeta,
  mapApiProduct,
} from "@/components/shop/shop-catalog-data";
import type { Product } from "@/components/shop/shop-data";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => shopCategoryHead(params.slug),
  component: CategoryRoute,
});

function CategoryRoute() {
  const { slug } = Route.useParams();
  const { items, addItem, updateQuantity, removeItem, clearCart } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: apiProducts, isLoading, isError } = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: () => api.products.list({ category: slug }),
    enabled: HAS_API_BASE,
    retry: false,
  });

  // The built-in Happy Tooth catalogue answers when the API has nothing for this category.
  const fromApi: Product[] = (apiProducts || []).map(mapApiProduct);
  const productsToDisplay: Product[] =
    fromApi.length > 0 ? fromApi : getCatalogProductsByCategory(slug);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const categoryMeta = getCategoryMeta(slug);

  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />

      <section aria-label="Category header" className="bg-white pt-10 pb-6 md:pt-14">
        <div className={CONTAINER}>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-small text-[#6d6e72] t-colors hover:text-[#1b1b1b]"
          >
            <ArrowLeft aria-hidden className="size-4" />
            <span>All Categories</span>
          </Link>
          <h1 className={`mt-5 ${TITLE}`}>
            {categoryMeta.shortTitle} <span className={MUTED_TITLE}>{categoryMeta.accentWord}</span>
          </h1>
          <p className={`mt-4 max-w-[40rem] ${LEAD}`}>{categoryMeta.description}</p>
        </div>
      </section>

      <ShopCatalog
        products={productsToDisplay}
        isLoading={isLoading && productsToDisplay.length === 0}
        unavailable={productsToDisplay.length === 0 && (!HAS_API_BASE || isError)}
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
        className="fixed right-6 bottom-6 z-40 inline-flex h-14 items-center gap-2.5 rounded-full bg-[#1b1b1b] px-6 text-[15px] font-medium text-white shadow-[0_10px_36px_rgba(20,20,40,0.22)] t-colors hover:bg-black"
        aria-label={`View shopping bag (${totalItemCount} items)`}
      >
        <div className="relative">
          <ShoppingBag aria-hidden className="size-5" />
          {totalItemCount > 0 ? (
            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#f3f0a8] text-[12px] font-medium text-[#1b1b1b] tabular-nums">
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
