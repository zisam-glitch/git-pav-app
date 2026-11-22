import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
import { GrillzContact } from "./grillz-contact";
import { GrillzFaq } from "./grillz-faq";
import { GrillzHero } from "./grillz-hero";
import { GrillzPricing } from "./grillz-pricing";
import { GrillzProcess } from "./grillz-process";
import { GrillzStyles } from "./grillz-styles";

export function CustomGrillzPage() {
  return (
    <main>
      <GrillzHero />
      <GrillzStyles />
      <GrillzProcess />
      <GrillzPricing />
      <GrillzContact />
      <GrillzFaq />
      <ClosingBand
        title="Ready to design"
        highlight="your signature grillz?"
        lead="Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine check-ups, and advanced technologies like digital imaging and laser dentistry."
        actions={
          <>
            <BookButton variant="butter">Book Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      />
    </main>
  );
}
