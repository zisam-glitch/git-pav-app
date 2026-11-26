import { BookButton, CallButton, FaqPhoto, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "What is a root canal treatment?",
    a: "A root canal is a dental procedure that removes infected or damaged pulp from inside the tooth, cleans the canals, and seals them to prevent further infection.",
  },
  {
    q: "Why do I need a root canal?",
    a: "You may need a root canal if the tooth pulp is infected or inflamed due to deep decay, cracks, repeated dental procedures, or trauma. Symptoms often include severe pain, sensitivity, or swelling.",
  },
  {
    q: "Is a root canal painful?",
    a: "Modern root canal treatments are generally not painful. Local anesthesia ensures comfort during the procedure. Mild soreness afterward is normal and temporary.",
  },
  {
    q: "What happens during the root canal procedure?",
    a: "The dentist numbs the area, removes the infected pulp, cleans and shapes the canals, and fills them with a biocompatible material. A crown may be recommended afterward for protection.",
  },
  {
    q: "How long does a root canal take?",
    a: "Most root canals take 45–90 minutes depending on the complexity and number of canals. Some cases require multiple visits.",
  },
  {
    q: "What should I expect after the procedure?",
    a: "Mild discomfort, sensitivity, or swelling is normal for a few days. Pain relief medication is usually effective, and most patients return to normal activities quickly.",
  },
  {
    q: "How should I care for my tooth after a root canal?",
    a: "Avoid chewing on the treated side until a crown is placed. Maintain good oral hygiene and follow your dentist’s instructions for pain management and care.",
  },
  {
    q: "What are the risks or complications?",
    a: "Possible complications include persistent infection, missed canals, or fractures. In rare cases, retreatment or additional procedures may be needed.",
  },
  {
    q: "Is a crown necessary after a root canal?",
    a: "For back teeth or teeth with significant damage, a crown is highly recommended to restore strength and prevent fractures.",
  },
  {
    q: "How long does a root canal last?",
    a: "With proper care and restoration, a root canal-treated tooth can last for many years, often for a lifetime.",
  },
];

export function RootCanalFaq() {
  return (
    <Section theme="white" aria-labelledby="root-canal-faq-heading">
      <FaqPhoto
        id="root-canal-faq-heading"
        title="Frequently Asked Questions"
        items={FAQS}
        image="/images/generated/root-canal-how.jpg"
        alt=""
        actions={
          <>
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </>
        }
      />
    </Section>
  );
}
