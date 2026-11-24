import { BookButton, FaqSplit, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "What is cosmetic dentistry?",
    a: "Cosmetic dentistry includes procedures that enhance the appearance of your teeth and smile. It can include teeth whitening, veneers, bonding, crowns, orthodontics, and more.",
  },
  {
    q: "What are common cosmetic dental procedures?",
    a: "Common procedures include teeth whitening, dental veneers, dental bonding, dental crowns, inlays and onlays, dental implants, and orthodontic treatments.",
  },
  {
    q: "How do I know if I need cosmetic dentistry?",
    a: "If you are unhappy with aspects of your smile, such as color, alignment, spacing, size, or shape of your teeth, cosmetic dentistry might be an option.",
  },
  {
    q: "Is cosmetic dentistry safe?",
    a: "Yes, when performed by a qualified dentist, cosmetic dentistry is safe. However, as with any medical procedure, there are risks and benefits that should be discussed with your dentist.",
  },
  {
    q: "Does cosmetic dentistry hurt?",
    a: "Many cosmetic dental procedures are painless or involve minimal discomfort. For more extensive procedures, dentists use local anesthesia to minimize pain.",
  },
  {
    q: "How long do cosmetic dental procedures take?",
    a: "The duration varies depending on the procedure. Some treatments like teeth whitening can be done in one visit, while others like veneers or implants may require multiple visits.",
  },
  {
    q: "How much does cosmetic dentistry cost?",
    a: "Costs vary widely based on the procedure, dentist's experience, and location. Some cosmetic procedures can be expensive, and many are not covered by dental insurance.",
  },
  {
    q: "Will my insurance cover cosmetic dentistry?",
    a: "Most insurance plans do not cover cosmetic procedures if they are purely for aesthetic reasons. However, some procedures that also have restorative benefits might be partially covered.",
  },
  {
    q: "How do I choose a cosmetic dentist?",
    a: "Look for a dentist with experience in cosmetic dentistry. Check their qualifications, before-and-after photos of previous patients, and reviews or testimonials.",
  },
  {
    q: "How long do the results of cosmetic dentistry last?",
    a: "The longevity of results varies. For example, teeth whitening may last for several months, while veneers or implants can last for many years with proper care.",
  },
  {
    q: "What are the risks associated with cosmetic dentistry?",
    a: "Risks can include sensitivity, damage to underlying teeth, and mismatched colors. It's important to discuss potential risks and complications with your dentist.",
  },
  {
    q: "Can cosmetic dentistry improve oral health?",
    a: "While the primary focus is on appearance, some procedures can improve oral health. For instance, correcting misaligned teeth can make them easier to clean and reduce the risk of decay.",
  },
];

export function CosmeticFaq() {
  return (
    <Section id="faq" theme="white" aria-labelledby="cosmetic-faq-heading">
      <FaqSplit
        id="cosmetic-faq-heading"
        title="Frequently Asked Questions"
        action={<BookButton>Book Appointment</BookButton>}
        items={FAQS}
      />
    </Section>
  );
}
