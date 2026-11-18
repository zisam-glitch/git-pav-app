import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { GeneralDentistryPage } from "@/components/general-dentistry/general-dentistry-page";

export const Route = createFileRoute("/services/general-dentistry")({
  head: () => seoHead("/services/general-dentistry"),
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <GeneralDentistryPage />
      <Footer />
    </>
  );
}
