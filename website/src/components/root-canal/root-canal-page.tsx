import { BookButton, CallButton, CtaBand } from "@/components/hims";
import { RootCanalConsent } from "./root-canal-consent";
import { RootCanalContact } from "./root-canal-contact";
import { RootCanalFaq } from "./root-canal-faq";
import { RootCanalHero } from "./root-canal-hero";
import { RootCanalHow } from "./root-canal-how";
import { RootCanalPricing } from "./root-canal-pricing";

export function RootCanalPage() {
  return (
    <main>
      <RootCanalHero />
      <RootCanalHow />
      <RootCanalPricing />
      <RootCanalConsent />
      <RootCanalFaq />
      <RootCanalContact />
      <CtaBand
        theme="brown"
        title="Ready to book"
        accent="your root canal care?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · Basic (£195), Intermediate (£295), and Advanced (£395)
        root canal treatments.
      </CtaBand>
    </main>
  );
}
