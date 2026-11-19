import { createFileRoute } from "@tanstack/react-router";
import { noindexHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { CheckoutPage } from "@/components/shop/checkout-page";

export const Route = createFileRoute("/checkout")({
  head: () => noindexHead("Checkout | Pav Dental"),
  component: CheckoutRoute,
});

function CheckoutRoute() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <CheckoutPage />
      <Footer />
    </main>
  );
}
