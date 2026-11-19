import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { RootCanalPage } from "@/components/root-canal/root-canal-page";

export const Route = createFileRoute("/services/root-canal")({
  head: () => seoHead("/services/root-canal"),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <RootCanalPage />
      <Footer />
    </div>
  );
}
