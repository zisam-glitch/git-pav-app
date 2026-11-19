import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { AestheticsPage } from "@/components/aesthetics/aesthetics-page";

export const Route = createFileRoute("/services/aesthetics")({
  head: () => seoHead("/services/aesthetics"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <AestheticsPage />
      <Footer />
    </div>
  );
}
