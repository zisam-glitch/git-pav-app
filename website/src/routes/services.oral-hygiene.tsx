import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { OralHygienePage } from "@/components/oral-hygiene/oral-hygiene-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/services/oral-hygiene")({
  head: () => seoHead("/services/oral-hygiene"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <OralHygienePage />
      <Footer />
    </div>
  );
}
