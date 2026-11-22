import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
import { DenturesContact } from "./dentures-contact";
import { DenturesFaq } from "./dentures-faq";
import { DenturesHero } from "./dentures-hero";
import { DenturesPricing } from "./dentures-pricing";
import { DenturesShowcase } from "./dentures-showcase";
import { DenturesSolutions } from "./dentures-solutions";

export function DenturesPage() {
  return (
    <main>
      <DenturesHero />
      <DenturesSolutions />
      <DenturesShowcase />
      <DenturesPricing />
      <DenturesFaq />
      <DenturesContact />
      <ClosingBand
        title="Book your free consultation"
        highlight="today"
        lead="Book your free consultation today with one of our GDC-registered dentists to start your journey towards a confident, healthy smile."
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
