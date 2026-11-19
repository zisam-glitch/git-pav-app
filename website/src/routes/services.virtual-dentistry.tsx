import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { VirtualDentistryPage } from "@/components/virtual-dentistry/virtual-dentistry-page";

export const Route = createFileRoute("/services/virtual-dentistry")({
  head: () => seoHead("/services/virtual-dentistry"),
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <VirtualDentistryPage />
      <Footer />
    </>
  );
}
