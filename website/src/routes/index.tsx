import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { ContactForm } from "@/components/home/contact-form";
import { Counters } from "@/components/home/counters";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { HeroSlider } from "@/components/home/hero-slider";
import { Marquee } from "@/components/home/marquee";
import { Overview } from "@/components/home/overview";
import { PersonalizedCards } from "@/components/home/personalized-cards";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ServiceTabs } from "@/components/home/service-tabs";
import { TotalCare } from "@/components/home/total-care";
import { TestimonialsSection } from "@/components/testimonials/testimonials-section";
import { VideoSection } from "@/components/home/video-section";
import { HOME_TESTIMONIALS } from "@/content/testimonials";

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
      <PersonalizedCards />
      <Marquee />
      <TotalCare />
      <Overview />
      <VideoSection />
      <ServiceTabs />
      <Counters />
      <TestimonialsSection testimonials={HOME_TESTIMONIALS} />
      <ContactForm />
      <Footer />
    </main>
  );
}
