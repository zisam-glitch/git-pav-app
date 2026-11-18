import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { CosmeticPage } from "@/components/cosmetic/cosmetic-page";

export const Route = createFileRoute("/services/cosmetic")({
  head: () => seoHead("/services/cosmetic"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <CosmeticPage />
      <Footer />
    </div>
  );
}
