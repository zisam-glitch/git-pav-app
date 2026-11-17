import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { EmergencyDentalPage } from "@/components/emergency-dental/emergency-page";

export const Route = createFileRoute("/services/emergency-dental")({
  head: () => seoHead("/services/emergency-dental"),
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <div className="pt-16">
        <EmergencyDentalPage />
      </div>
      <Footer />
    </>
  );
}
