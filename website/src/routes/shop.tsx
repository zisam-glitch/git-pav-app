import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ShopPage } from "@/components/shop/shop-page";

export const Route = createFileRoute("/shop")({
  head: () => seoHead("/shop"),
  component: ShopRoute,
});

function ShopRoute() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />
      <ShopPage />
      <Footer />
    </main>
  );
}

