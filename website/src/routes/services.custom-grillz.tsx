import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { CustomGrillzPage } from "@/components/custom-grillz/grillz-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/services/custom-grillz")({
  head: () => seoHead("/services/custom-grillz"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <CustomGrillzPage />
      <Footer />
    </div>
  );
}
