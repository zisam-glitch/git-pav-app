import { BookButton, CallButton } from "@/components/hims";
import { FaqSection } from "@/components/hims/faq-section";
import type { InfoAccordionItem } from "@/components/hims/info-accordion";

const FAQS: readonly InfoAccordionItem[] = [
  {
    title: "What is cosmetic dentistry?",
    content:
      "Cosmetic dentistry includes procedures that enhance the appearance of your teeth and smile. It can include teeth whitening, veneers, bonding, crowns, orthodontics, and more.",
  },
  {
    title: "What are common cosmetic dental procedures?",
    content:
      "Common procedures include teeth whitening, dental veneers, dental bonding, dental crowns, inlays and onlays, dental implants, and orthodontic treatments.",
  },
  {
    title: "How do I know if I need cosmetic dentistry?",
    content:
      "If you are unhappy with aspects of your smile, such as color, alignment, spacing, size, or shape of your teeth, cosmetic dentistry might be an option.",
  },
  {
    title: "Is cosmetic dentistry safe?",
    content:
      "Yes, when performed by a qualified dentist, cosmetic dentistry is safe. However, as with any medical procedure, there are risks and benefits that should be discussed with your dentist.",
  },
  {
    title: "Does cosmetic dentistry hurt?",
    content:
      "Many cosmetic dental procedures are painless or involve minimal discomfort. For more extensive procedures, dentists use local anesthesia to minimize pain.",
  },
  {
    title: "How long do cosmetic dental procedures take?",
    content:
      "The duration varies depending on the procedure. Some treatments like teeth whitening can be done in one visit, while others like veneers or implants may require multiple visits.",
  },
  {
    title: "How much does cosmetic dentistry cost?",
    content:
      "Costs vary widely based on the procedure, dentist's experience, and location. Some cosmetic procedures can be expensive, and many are not covered by dental insurance.",
  },
  {
    title: "Will my insurance cover cosmetic dentistry?",
    content:
      "Most insurance plans do not cover cosmetic procedures if they are purely for aesthetic reasons. However, some procedures that also have restorative benefits might be partially covered.",
  },
  {
    title: "How do I choose a cosmetic dentist?",
    content:
      "Look for a dentist with experience in cosmetic dentistry. Check their qualifications, before-and-after photos of previous patients, and reviews or testimonials.",
  },
  {
    title: "How long do the results of cosmetic dentistry last?",
    content:
      "The longevity of results varies. For example, teeth whitening may last for several months, while veneers or implants can last for many years with proper care.",
  },
  {
    title: "What are the risks associated with cosmetic dentistry?",
    content:
      "Risks can include sensitivity, damage to underlying teeth, and mismatched colors. It's important to discuss potential risks and complications with your dentist.",
  },
  {
    title: "Can cosmetic dentistry improve oral health?",
    content:
      "While the primary focus is on appearance, some procedures can improve oral health. For instance, correcting misaligned teeth can make them easier to clean and reduce the risk of decay.",
  },
];

export function CosmeticFaq() {
  return (
    <FaqSection
      id="faq"
      title="Frequently Asked"
      accent="Questions"
      actions={
        <>
          <BookButton>Book Appointment</BookButton>
          <CallButton variant="outline" />
        </>
      }
      items={FAQS}
    />
  );
}
