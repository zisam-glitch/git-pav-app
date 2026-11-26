import { BookButton, FloatingCta, NumberedCards, Section, SubNav } from "@/components/hims";
import { ContactForm } from "@/components/home/contact-form";
import { ExtractionBook } from "./extraction-book";
import { ExtractionFaq } from "./extraction-faq";
import { ExtractionGuarantee } from "./extraction-guarantee";
import { ExtractionHero } from "./extraction-hero";
import { ExtractionPostOp } from "./extraction-postop";
import { ExtractionPricing } from "./extraction-pricing";

export function ToothExtractionPage() {
  return (
    <main className="bg-white">
      <ExtractionHero />
      <SubNav
        label="On this page"
        items={[
          { label: "Same Day", href: "#same-day" },
          { label: "Prices", href: "#pricing" },
          { label: "Post-Op", href: "#post-op" },
          { label: "FAQ", href: "#faq" },
        ]}
      />
      <Section theme="white" aria-label="How a same-day extraction works">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]">
            Turn tooth pain into <span className="text-[#c0805f]">relief</span>
          </h2>
        </div>
        <NumberedCards
          items={[
            {
              title: "Book same-day",
              text: "We understand that tooth pain can be unbearable and waiting is not an option.",
            },
            {
              title: "Get your extraction",
              text: "Using the latest techniques and state-of-the-art equipment, we can quickly and safely remove the affected tooth.",
            },
            {
              title: "Recover with aftercare",
              text: "Comprehensive aftercare support helps you recover swiftly and return to your daily routine.",
            },
          ]}
        />
      </Section>
      <ExtractionGuarantee />
      <ExtractionPricing />
      <ExtractionPostOp />
      <ExtractionBook />
      <ExtractionFaq />
      <ContactForm />
      <FloatingCta>
        <BookButton>Make an Appointment</BookButton>
      </FloatingCta>
    </main>
  );
}
