import { createFileRoute } from "@tanstack/react-router";
import { productHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ProductDetail } from "@/components/shop/product-detail";
import type { Product } from "@/components/shop/shop-data";
import { useCartStore } from "@/lib/cart-store";

export const Route = createFileRoute("/shop_/$productSlug")({
  head: ({ params }) => productHead(params.productSlug),
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  const { productSlug } = Route.useParams();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: Product, quantity: number = 1, variant?: any) => {
    addItem(product, quantity, variant);

    const notification = document.createElement("div");
    notification.className =
      "fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-black px-5 py-3 text-xs font-medium text-white shadow-[0_12px_32px_rgba(0,0,0,0.22)]";
    notification.innerHTML = `<span>Added to bag</span> <a href="/cart" class="underline underline-offset-4 text-[#ECD880] hover:opacity-85">View Bag</a>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3500);
  };

  return (
    <main className="min-h-screen bg-[#FBF8F5] text-fg">
      <ScrollProgress />
      <Header />
      <ProductDetail productSlug={productSlug} onAddToCart={handleAddToCart} />
      <Footer />
    </main>
  );
}
