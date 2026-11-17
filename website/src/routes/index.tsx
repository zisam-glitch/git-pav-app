import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { ContactForm } from "@/components/home/contact-form";
import { Counters } from "@/components/home/counters";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { HeroSlider } from "@/components/home/hero-slider";
import { Marquee } from "@/components/home/marquee";
import { Overview } from "@/components/home/overview";
import { Reviews } from "@/components/home/reviews";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ServiceTabs } from "@/components/home/service-tabs";
import { VideoSection } from "@/components/home/video-section";

export const Route = createFileRoute("/")({
  head: () => seoHead("/"),
  component: Home,
});

function Home() {
  return (
    <main>
      <ScrollProgress />
      <Header />
      <HeroSlider />
      <Marquee />
      <Overview />
      <VideoSection />
      <ServiceTabs />
      <Counters />
      <Reviews />
      <ContactForm />
      <Footer />
    </main>
  );
}
