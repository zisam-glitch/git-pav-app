import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { PetitionPage } from "@/components/petition/petition-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/petition")({
  head: () => seoHead("/petition"),
  component: PetitionPageRoute,
});

function PetitionPageRoute() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <PetitionPage />
      <Footer />
    </main>
  );
}
