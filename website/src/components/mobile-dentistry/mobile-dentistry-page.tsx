import {
  BookButton,
  CallButton,
  CtaBand,
  FloatingCta,
  NumberedCards,
  Section,
  SubNav,
} from "@/components/hims";
import { MobileDentistryBenefits } from "./mobile-dentistry-benefits";
import { MobileDentistryContact } from "./mobile-dentistry-contact";
import { MobileDentistryHero } from "./mobile-dentistry-hero";
import { MobileDentistryLocation } from "./mobile-dentistry-location";
import { MobileDentistryService } from "./mobile-dentistry-service";

export function MobileDentistryPage() {
  return (
    <main className="bg-white">
      <MobileDentistryHero />
      <SubNav
        label="On this page"
        items={[
          { label: "Benefits", href: "#benefits" },
          { label: "We Come to You", href: "#service" },
          { label: "Location", href: "#location" },
          { label: "Contact", href: "#contact" },
        ]}
      />
      <Section theme="white" aria-label="Dentistry that comes to you">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]">
            Dentistry that <span className="text-[#c0805f]">comes to you</span>
          </h2>
        </div>
        <NumberedCards
          items={[
            {
              title: "At your doorstep",
              text: "A full range of dental services from the comfort of your own home.",
            },
            {
              title: "A mobile surgery",
              text: "A modern, well-equipped mobile surgery with the latest mobile dental equipment.",
            },
            {
              title: "Across the UK",
              text: "Pav Dental Mobile visits patients and care homes across the UK.",
            },
          ]}
        />
      </Section>
      <MobileDentistryBenefits />
      <MobileDentistryService />
      <MobileDentistryLocation />
      <MobileDentistryContact />
      <CtaBand
        theme="brown"
        title="Ready to arrange"
        accent="a mobile visit?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine
        check-ups, and advanced technologies like digital imaging and laser dentistry.
      </CtaBand>
      <FloatingCta>
        <BookButton>Make an Appointment</BookButton>
      </FloatingCta>
    </main>
  );
}
