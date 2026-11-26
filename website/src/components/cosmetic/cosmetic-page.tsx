import { BookButton, CallButton, CtaBand, FloatingCta } from "@/components/hims";
import { CosmeticContact } from "./cosmetic-contact";
import { CosmeticFaq } from "./cosmetic-faq";
import { CosmeticHero } from "./cosmetic-hero";
import {
  CosmeticBenefits,
  CosmeticCosts,
  CosmeticIntro,
  CosmeticProcedures,
  CosmeticQuestion,
} from "./cosmetic-sections";
import { CosmeticShowcase } from "./cosmetic-showcase";

export function CosmeticPage() {
  return (
    <main className="bg-white">
      <CosmeticHero />
      <CosmeticIntro />
      <CosmeticProcedures />
      <CosmeticBenefits />
      <CosmeticCosts />
      <CosmeticQuestion />
      <CosmeticShowcase />
      <CosmeticFaq />
      <CosmeticContact />
      <CtaBand
        theme="brown"
        title="Book"
        accent="Appointment"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine
        check-ups, and advanced technologies like digital imaging and laser dentistry.
      </CtaBand>
      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
    </main>
  );
}
