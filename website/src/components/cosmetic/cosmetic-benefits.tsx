import { BookButton, Section, SectionHead, WhyCards } from "@/components/hims";

const BENEFITS = [
  {
    lead: "1. Enhanced",
    rest: "Appearance:",
    desc: "The most obvious benefit is a more attractive smile.",
  },
  {
    lead: "2. Boosted",
    rest: "Confidence:",
    desc: "A better smile often leads to increased self-esteem and confidence.",
  },
  {
    lead: "3. Improved",
    rest: "Oral Health:",
    desc: "Some procedures can help improve your oral health by making cleaning easier.",
  },
  {
    lead: "4. Long-Lasting",
    rest: "Results:",
    desc: "Many cosmetic dentistry procedures offer long-term or permanent solutions.",
  },
  {
    lead: "5. Wider Range",
    rest: "of Options:",
    desc: "There are treatments available for almost every aesthetic issue you might have with your teeth.",
  },
] as const;

export function CosmeticBenefits() {
  return (
    <Section theme="white" aria-labelledby="cosmetic-benefits-heading">
      <SectionHead
        id="cosmetic-benefits-heading"
        title="Benefits of Cosmetic Dentistry"
        action={<BookButton>Book Now</BookButton>}
      />
      <div className="mt-10">
        <WhyCards items={BENEFITS.map((b) => ({ lead: b.lead, rest: b.rest, text: b.desc }))} />
      </div>
    </Section>
  );
}
