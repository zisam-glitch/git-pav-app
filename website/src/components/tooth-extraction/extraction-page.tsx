import { BookButton, CallButton, CtaBand } from "@/components/hims";
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
      <CtaBand
        theme="brown"
        title="Need urgent relief"
        accent="or an extraction assessment?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · Simple, intermediate, advanced, and surgical
        extractions.
      </CtaBand>
    </main>
  );
}
