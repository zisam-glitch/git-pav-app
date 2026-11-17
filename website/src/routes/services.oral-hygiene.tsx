import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { OralHygienePage } from "@/components/oral-hygiene/oral-hygiene-page";

export const Route = createFileRoute("/services/oral-hygiene")({
  head: () => seoHead("/services/oral-hygiene"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-[#fffdf9] text-fg">
      <Header />
      <OralHygienePage />
      <Footer />
    </div>
  );
}