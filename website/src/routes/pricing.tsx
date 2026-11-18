import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { FeeTable } from "@/components/pricing/fee-table";
import { InsuranceProviders } from "@/components/pricing/insurance-providers";
import { SpecialAnnouncement } from "@/components/pricing/special-announcement";

export const Route = createFileRoute("/pricing")({
  head: () => seoHead("/pricing"),
  component: PricingPage,
});

function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <PricingHero />
      <PricingCards />
      <FeeTable />
      <InsuranceProviders />
      <SpecialAnnouncement />
      <Footer />
    </main>
  );
}
