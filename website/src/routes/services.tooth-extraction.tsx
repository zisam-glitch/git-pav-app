import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ToothExtractionPage } from "@/components/tooth-extraction/extraction-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/services/tooth-extraction")({
  head: () => seoHead("/services/tooth-extraction"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <ToothExtractionPage />
      <Footer />
    </div>
  );
}
