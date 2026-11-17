import { createFileRoute } from "@tanstack/react-router";
import { productHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ProductDetail } from "@/components/shop/product-detail";
import type { Product } from "@/components/shop/shop-data";
import { useState } from "react";

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
    
    // Show success notification
    const notification = document.createElement("div");
    notification.className = "fixed bottom-4 right-4 bg-[#844d1e] text-white px-5 py-3 rounded-xl shadow-xl z-50 text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2";
    notification.innerHTML = `<span>Added to bag!</span> <a href="/cart" class="underline hover:opacity-80">View Bag</a>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3500);
  };

  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />
      <ProductDetail productSlug={productSlug} onAddToCart={handleAddToCart} />
      <Footer />
    </main>
  );
}