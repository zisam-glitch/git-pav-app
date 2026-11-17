import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { PetitionPage } from "@/components/petition/petition-page";

export const Route = createFileRoute("/petition")({
  head: () => seoHead("/petition"),
  component: PetitionPageRoute,
});

function PetitionPageRoute() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      {/* Single Unified Header */}
      <Header />

      {/* Spacer for fixed header */}
      <div className="pt-16">
        <PetitionPage />
      </div>

      {/* Single Unified Footer */}
      <Footer />
    </main>
  );
}
