import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { VacanciesPage } from "@/components/vacancies/vacancies-page";

export const Route = createFileRoute("/vacancies")({
  head: () => seoHead("/vacancies"),
  component: VacanciesRoute,
});

function VacanciesRoute() {
  return (
    <main className="min-h-screen bg-[#FBF8F5] text-fg">
      <ScrollProgress />
      {/* Single Unified Header */}
      <Header />

      {/* Spacer for fixed header */}
      <div className="pt-20 sm:pt-24">
        <VacanciesPage />
      </div>

      {/* Single Unified Footer */}
      <Footer />
    </main>
  );
}

