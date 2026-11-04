import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { OrderConfirmation } from "@/components/shop/order-confirmation";

export const Route = createFileRoute("/order/$id")({
  // `access` is the private link from checkout: keep it out of referrers and search engines.
  validateSearch: (search: Record<string, unknown>): { access?: string } =>
    typeof search.access === "string" ? { access: search.access } : {},
  head: () => ({
    meta: [
      { title: "Your order | Pav Dental" },
      { name: "referrer", content: "no-referrer" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderRoute,
});

function OrderRoute() {
  const { id } = Route.useParams();
  const { access } = Route.useSearch();

  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />
      <OrderConfirmation orderId={id} access={access} />
      <Footer />
    </main>
  );
}

