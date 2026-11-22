import { BookButton, CallButton, CtaBand } from "@/components/hims";
import { DenturesContact } from "./dentures-contact";
import { DenturesFaq } from "./dentures-faq";
import { DenturesHero } from "./dentures-hero";
import { DenturesPricing } from "./dentures-pricing";
import { DenturesShowcase } from "./dentures-showcase";
import { DenturesSolutions } from "./dentures-solutions";

export function DenturesPage() {
  return (
    <main className="bg-bg">
      <DenturesHero />
      <DenturesSolutions />
      <DenturesShowcase />
      <DenturesPricing />
      <DenturesFaq />
      <DenturesContact />
      <CtaBand
        theme="brown"
        title="Book your free consultation"
        accent="today"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Book your free consultation today with one of our GDC-registered dentists to start your
        journey towards a confident, healthy smile.
      </CtaBand>
    </main>
  );
}
