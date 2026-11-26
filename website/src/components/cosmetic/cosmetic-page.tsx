import { VideoSection, YouTubeVideo } from "@/components/hims";
import { ContactForm } from "@/components/home/contact-form";
import { YOUTUBE } from "@/content/videos";
import { CosmeticAbout } from "./cosmetic-about";
import { CosmeticBenefits } from "./cosmetic-benefits";
import { CosmeticFaq } from "./cosmetic-faq";
import { CosmeticFinancing } from "./cosmetic-financing";
import { CosmeticHero } from "./cosmetic-hero";
import { CosmeticProcedures } from "./cosmetic-procedures";
import { CosmeticShowcase } from "./cosmetic-showcase";

export function CosmeticPage() {
  return (
    <main className="bg-white">
      <CosmeticHero />
      <VideoSection>
        <YouTubeVideo {...YOUTUBE.cosmetic} title="Cosmetic dentistry at Pav Dental" />
      </VideoSection>
      <CosmeticProcedures />
      <CosmeticBenefits />
      <CosmeticAbout />
      <CosmeticFinancing />
      <CosmeticShowcase />
      <CosmeticFaq />
      <ContactForm />
    </main>
  );
}
