import { createFileRoute, Link } from "@tanstack/react-router";
import { productHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ProductDetail } from "@/components/shop/product-detail";
import type { Product } from "@/components/shop/shop-data";
import type { ProductVariant } from "@/lib/api";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

export const Route = createFileRoute("/shop_/$productSlug")({
  head: ({ params }) => productHead(params.productSlug),
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  const { productSlug } = Route.useParams();
  const { addItem } = useCartStore();
  const [bagNotice, setBagNotice] = useState(false);

  const handleAddToCart = (
    product: Product,
    quantity: number = 1,
    variant?: ProductVariant | null,
  ) => {
    addItem(product, quantity, variant);
    setBagNotice(true);
    setTimeout(() => setBagNotice(false), 3500);
  };

  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <ProductDetail productSlug={productSlug} onAddToCart={handleAddToCart} />
      {bagNotice ? (
        <div
          role="status"
          className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-pill bg-black px-5 py-3 text-small font-medium text-white shadow-card"
        >
          <span>Added to bag!</span>
          <Link to="/cart" className="underline underline-offset-4 hover:text-gold">
            View Bag
          </Link>
        </div>
      ) : null}
      <Footer />
    </main>
  );
}
