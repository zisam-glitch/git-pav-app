import { BookButton, CallButton, CtaBand } from "@/components/hims";
import { GrillzContact } from "./grillz-contact";
import { GrillzHero } from "./grillz-hero";
import { GrillzPricing } from "./grillz-pricing";
import { GrillzProcess } from "./grillz-process";
import { GrillzStyles } from "./grillz-styles";

export function CustomGrillzPage() {
  return (
    <main className="bg-white">
      <GrillzHero />
      <GrillzStyles />
      <GrillzProcess />
      <GrillzPricing />
      <GrillzContact />
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
        Ready to create your signature grillz? Contact Pav Dental today for a consultation.
      </CtaBand>
    </main>
  );
}
