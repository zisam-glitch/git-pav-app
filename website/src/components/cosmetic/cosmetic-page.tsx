import { BookButton, CallButton, CtaBand } from "@/components/hims";
import { CosmeticAbout } from "./cosmetic-about";
import { CosmeticBenefits } from "./cosmetic-benefits";
import { CosmeticContact } from "./cosmetic-contact";
import { CosmeticFaq } from "./cosmetic-faq";
import { CosmeticFinancing } from "./cosmetic-financing";
import { CosmeticHero } from "./cosmetic-hero";
import { CosmeticProcedures } from "./cosmetic-procedures";
import { CosmeticShowcase } from "./cosmetic-showcase";

export function CosmeticPage() {
  return (
    <main className="bg-white">
      <CosmeticHero />
      <CosmeticProcedures />
      <CosmeticBenefits />
      <CosmeticAbout />
      <CosmeticFinancing />
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
    </main>
  );
}
