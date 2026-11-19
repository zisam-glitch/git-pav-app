import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { WhiteningPage } from "@/components/whitening/whitening-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/services/whitening")({
  head: () => seoHead("/services/whitening"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <WhiteningPage />
      <Footer />
    </div>
  );
}
