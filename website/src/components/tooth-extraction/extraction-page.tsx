import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
import { ContactForm } from "@/components/home/contact-form";
import { ExtractionBook } from "./extraction-book";
import { ExtractionFaq } from "./extraction-faq";
import { ExtractionGuarantee } from "./extraction-guarantee";
import { ExtractionHero } from "./extraction-hero";
import { ExtractionPostOp } from "./extraction-postop";
import { ExtractionPricing } from "./extraction-pricing";

export function ToothExtractionPage() {
  return (
    <main>
      <ExtractionHero />
      <ExtractionGuarantee />
      <ExtractionPricing />
      <ExtractionPostOp />
      <ExtractionBook />
      <ExtractionFaq />
      <ContactForm />
      <ClosingBand
        title="Need urgent relief"
        highlight="or an extraction assessment?"
        lead="786 Leeds Road, Bradford, BD3 9TY · Simple, intermediate, advanced, and surgical extractions."
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
