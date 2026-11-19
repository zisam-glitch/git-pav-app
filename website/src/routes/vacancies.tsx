import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { VacanciesPage } from "@/components/vacancies/vacancies-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/vacancies")({
  head: () => seoHead("/vacancies"),
  component: VacanciesRoute,
});

function VacanciesRoute() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <VacanciesPage />
      <Footer />
    </main>
  );
}
