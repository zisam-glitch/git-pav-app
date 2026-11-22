import { createFileRoute } from "@tanstack/react-router";
import { BookButton, CallButton, CtaBand } from "@/components/hims";
import { ContactForm } from "@/components/home/contact-form";
import { Counters } from "@/components/home/counters";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { HeroSlider } from "@/components/home/hero-slider";
import { HomeEmergency } from "@/components/home/home-emergency";
import { HomeTeamCarousel } from "@/components/home/home-team-carousel";
import { Marquee } from "@/components/home/marquee";
import { Overview } from "@/components/home/overview";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ServiceTabs } from "@/components/home/service-tabs";
import { VideoSection } from "@/components/home/video-section";
import { TestimonialsSection } from "@/components/testimonials/testimonials-section";
import { HOME_TESTIMONIALS } from "@/content/testimonials";
import { seoHead } from "@/lib/seo";

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
      <ServiceTabs />
      <HomeEmergency id="emergency" />
      <Overview />
      <HomeEmergency />
      <VideoSection />
      <Counters />
      <HomeTeamCarousel />
      <TestimonialsSection testimonials={HOME_TESTIMONIALS} />
      <ContactForm />
      <CtaBand
        theme="brown"
        title="Ready for dental care"
        accent="that fits your life?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · Open 00:00 – 24:00, seven days a week.
      </CtaBand>
      <Footer />
    </main>
  );
}
