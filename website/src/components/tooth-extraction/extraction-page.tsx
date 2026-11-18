import { ExtractionHero } from "./extraction-hero";
import { ExtractionGuarantee } from "./extraction-guarantee";
import { ExtractionPricing } from "./extraction-pricing";
import { ExtractionPostOp } from "./extraction-postop";
import { ExtractionBook } from "./extraction-book";
import { ExtractionFaq } from "./extraction-faq";

export function ToothExtractionPage() {
  return (
    <main className="bg-[#FBF8F5]">
      <ExtractionHero />
      <ExtractionGuarantee />
      <ExtractionPricing />
      <ExtractionPostOp />
      <ExtractionBook />
      <ExtractionFaq />
    </main>
  );
}
