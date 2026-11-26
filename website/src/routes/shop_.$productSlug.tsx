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
          className="fixed right-6 bottom-6 z-50 flex items-center gap-4 rounded-full bg-[#1b1b1b] py-2 pr-2 pl-6 text-[15px] font-medium text-white shadow-[0_10px_36px_rgba(20,20,40,0.22)]"
        >
          <span>Added to bag!</span>
          <Link to="/cart" className="rounded-full bg-white px-5 py-2.5 text-[14px] text-[#1b1b1b] t-colors hover:bg-[#f3f0a8]">
            View Bag
          </Link>
        </div>
      ) : null}
      <Footer />
    </main>
  );
}
