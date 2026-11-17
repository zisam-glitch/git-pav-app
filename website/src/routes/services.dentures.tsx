import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { DenturesPage } from "@/components/dentures/dentures-page";

export const Route = createFileRoute("/services/dentures")({
  head: () => seoHead("/services/dentures"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-[#fffdf9] text-fg">
      <Header />
      <DenturesPage />
      <Footer />
    </div>
  );
}
