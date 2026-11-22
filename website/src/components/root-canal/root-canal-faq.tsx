import { BookButton, CallButton } from "@/components/hims";
import { FaqSection } from "@/components/hims/faq-section";
import type { InfoAccordionItem } from "@/components/hims/info-accordion";

const FAQS: readonly InfoAccordionItem[] = [
  {
    title: "What is a root canal treatment?",
    content:
      "A root canal is a dental procedure that removes infected or damaged pulp from inside the tooth, cleans the canals, and seals them to prevent further infection.",
  },
  {
    title: "Why do I need a root canal?",
    content:
      "You may need a root canal if the tooth pulp is infected or inflamed due to deep decay, cracks, repeated dental procedures, or trauma. Symptoms often include severe pain, sensitivity, or swelling.",
  },
  {
    title: "Is a root canal painful?",
    content:
      "Modern root canal treatments are generally not painful. Local anesthesia ensures comfort during the procedure. Mild soreness afterward is normal and temporary.",
  },
  {
    title: "What happens during the root canal procedure?",
    content:
      "The dentist numbs the area, removes the infected pulp, cleans and shapes the canals, and fills them with a biocompatible material. A crown may be recommended afterward for protection.",
  },
  {
    title: "How long does a root canal take?",
    content:
      "Most root canals take 45–90 minutes depending on the complexity and number of canals. Some cases require multiple visits.",
  },
  {
    title: "What should I expect after the procedure?",
    content:
      "Mild discomfort, sensitivity, or swelling is normal for a few days. Pain relief medication is usually effective, and most patients return to normal activities quickly.",
  },
  {
    title: "How should I care for my tooth after a root canal?",
    content:
      "Avoid chewing on the treated side until a crown is placed. Maintain good oral hygiene and follow your dentist’s instructions for pain management and care.",
  },
  {
    title: "What are the risks or complications?",
    content:
      "Possible complications include persistent infection, missed canals, or fractures. In rare cases, retreatment or additional procedures may be needed.",
  },
  {
    title: "Is a crown necessary after a root canal?",
    content:
      "For back teeth or teeth with significant damage, a crown is highly recommended to restore strength and prevent fractures.",
  },
  {
    title: "How long does a root canal last?",
    content:
      "With proper care and restoration, a root canal-treated tooth can last for many years, often for a lifetime.",
  },
];

export function RootCanalFaq() {
  return (
    <FaqSection
      title="Frequently Asked"
      accent="Questions"
      actions={
        <>
          <BookButton>Book Now</BookButton>
          <CallButton variant="outline" />
        </>
      }
      items={FAQS}
    />
  );
}
