import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
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
    <main>
      <CosmeticHero />
      <CosmeticAbout />
      <CosmeticProcedures />
      <CosmeticBenefits />
      <CosmeticFinancing />
      <CosmeticShowcase />
      <CosmeticFaq />
      <CosmeticContact />
      <ClosingBand
        title="Book"
        highlight="Appointment"
        lead="Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine check-ups, and advanced technologies like digital imaging and laser dentistry."
        actions={
          <>
            <BookButton variant="butter">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      />
    </main>
  );
}
