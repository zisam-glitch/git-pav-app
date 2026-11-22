import { createFileRoute } from "@tanstack/react-router";
import { FinancePage } from "@/components/finance/finance-page";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/services/finance")({
  head: () => seoHead("/services/finance"),
  component: ServicesFinanceRoute,
});

function ServicesFinanceRoute() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <FinancePage />
      <Footer />
    </main>
  );
}
