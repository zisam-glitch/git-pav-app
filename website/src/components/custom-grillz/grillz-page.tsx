import { BookButton, CallButton, CtaBand, FloatingCta, SubNav } from "@/components/hims";
import { GrillzContact } from "./grillz-contact";
import { GrillzFaq } from "./grillz-faq";
import { GrillzHero } from "./grillz-hero";
import { GrillzPricing } from "./grillz-pricing";
import { GrillzProcess } from "./grillz-process";
import { GrillzStyles } from "./grillz-styles";

export function CustomGrillzPage() {
  return (
    <main className="bg-white">
      <GrillzHero />
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
      <GrillzProcess />
      <GrillzPricing />
      <GrillzContact />
      <GrillzFaq />
      <CtaBand
        theme="navy"
        title="Ready to design"
        accent="your signature grillz?"
        tone="butter"
        actions={
          <>
            <BookButton variant="butter">Book Appointment</BookButton>
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
