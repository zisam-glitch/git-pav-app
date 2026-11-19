import { createFileRoute } from "@tanstack/react-router";
import { ServicesHub } from "@/components/content/services-hub";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { seoHead } from "@/lib/seo";

// An index route, not services.tsx: a services.tsx would become the layout of
// every /services/* page.
export const Route = createFileRoute("/services/")({
  head: () => seoHead("/services"),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <ServicesHub />
      <Footer />
    </main>
  );
}
