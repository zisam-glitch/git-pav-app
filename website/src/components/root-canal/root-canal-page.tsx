import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
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
      <ClosingBand
        title="Ready to book"
        highlight="your root canal care?"
        lead="786 Leeds Road, Bradford, BD3 9TY · Basic (£195), Intermediate (£295), and Advanced (£395) root canal treatments."
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
