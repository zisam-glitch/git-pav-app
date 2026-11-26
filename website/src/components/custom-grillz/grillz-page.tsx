import { ContactForm } from "@/components/home/contact-form";
import { BookButton, FloatingCta, SubNav, VideoSection, YouTubeVideo } from "@/components/hims";
import { YOUTUBE } from "@/content/videos";
import { GrillzFaq } from "./grillz-faq";
import { GrillzHero } from "./grillz-hero";
import { GrillzPricing } from "./grillz-pricing";
import { GrillzProcess } from "./grillz-process";
import { GrillzStyles } from "./grillz-styles";

export function CustomGrillzPage() {
  return (
    <main className="bg-white">
      <GrillzHero />
      <VideoSection>
        <YouTubeVideo {...YOUTUBE.grillz} title="Custom grillz at Pav Dental" />
      </VideoSection>
      <SubNav
        label="On this page"
        items={[
          { label: "Grillz", href: "#styles" },
          { label: "Why Pav Dental", href: "#why-pav" },
          { label: "Guarantee", href: "#guarantee" },
          { label: "Contact", href: "#contact" },
        ]}
      />
      <GrillzStyles />
      <VideoSection title="Custom Grillz" accent="Procedures">
        <YouTubeVideo {...YOUTUBE.grillz} title="Custom grillz procedures" />
      </VideoSection>
      <GrillzProcess />
      <GrillzPricing />
      <ContactForm />
      <GrillzFaq />
      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
    </main>
  );
}
