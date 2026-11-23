import { createFileRoute } from "@tanstack/react-router";
import { CareFeature } from "@/components/home/care-feature";
import { CheckUpFeature } from "@/components/home/check-up-feature";
import { ContactForm } from "@/components/home/contact-form";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { HeroSlider } from "@/components/home/hero-slider";
import { KnowMore } from "@/components/home/know-more";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ServicesFeature } from "@/components/home/services-feature";
import { TopTicker } from "@/components/home/top-ticker";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seoHead("/"),
  component: Home,
});

function Home() {
  return (
    <main>
      <ScrollProgress />
      <TopTicker />
      <Header />
      <HeroSlider />
      <CheckUpFeature />
      <ServicesFeature />
      <CareFeature />
      <KnowMore />
      <ContactForm />
      <Footer />
    </main>
  );
}
