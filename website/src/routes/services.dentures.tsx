import { createFileRoute } from "@tanstack/react-router";
import { DenturesPage } from "@/components/dentures/dentures-page";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/services/dentures")({
  head: () => seoHead("/services/dentures"),
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <DenturesPage />
      <Footer />
    </>
  );
}
