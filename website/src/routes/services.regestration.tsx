import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { RegistrationPage } from "@/components/registration/registration-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/services/regestration")({
  head: () => seoHead("/services/regestration"),
  component: ServicesRegistrationRoute,
});

function ServicesRegistrationRoute() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <RegistrationPage />
      <Footer />
    </main>
  );
}
