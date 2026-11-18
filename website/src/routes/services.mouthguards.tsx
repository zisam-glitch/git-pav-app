import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { MouthguardsPage } from "@/components/mouthguards/mouthguards-page";

export const Route = createFileRoute("/services/mouthguards")({
  head: () => seoHead("/services/mouthguards"),
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <MouthguardsPage />
      <Footer />
    </>
  );
}
