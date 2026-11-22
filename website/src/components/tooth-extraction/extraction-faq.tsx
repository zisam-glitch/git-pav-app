import { BookButton, CallButton } from "@/components/hims";
import { FaqSection } from "@/components/hims/faq-section";
import type { InfoAccordionItem } from "@/components/hims/info-accordion";

const FAQS: readonly InfoAccordionItem[] = [
  {
    title: "Why is tooth extraction necessary?",
    content:
      "Tooth extraction is necessary when a tooth is too damaged or decayed to be repaired, when there's severe gum disease (periodontitis), for orthodontic reasons (like overcrowding), or impacted wisdom teeth.",
  },
  {
    title: "How should I prepare for a tooth extraction?",
    content:
      "Inform your dentist about any medical conditions and medications you're taking. Avoid smoking before the procedure, and arrange for someone to drive you home if you'll be sedated.",
  },
  {
    title: "What is the procedure for tooth extraction?",
    content:
      "The procedure varies depending on the tooth. Generally, the area is numbed with local anesthesia. If the tooth is impacted, an incision may be made in the gum. The tooth is then rocked back and forth to loosen it before removal.",
  },
  {
    title: "Is tooth extraction painful?",
    content:
      "You shouldn't feel pain during the extraction due to anesthesia, but you may feel pressure. Post-extraction, some discomfort and swelling are normal.",
  },
  {
    title: "What should I expect after the extraction?",
    content:
      "After the extraction, it's common to experience some bleeding, swelling, and discomfort. Your dentist will provide instructions on managing these symptoms.",
  },
  {
    title: "How should I care for my mouth after extraction?",
    content:
      "Avoid rinsing, spitting, or sucking actions for the first 24 hours. Use pain relief as advised, and apply an ice pack to reduce swelling. Eat soft foods and gradually reintroduce other foods as healing progresses.",
  },
  {
    title: "What are the potential complications of tooth extraction?",
    content:
      "Potential complications include dry socket, infection, prolonged bleeding, or damage to adjacent teeth or jawbone. Contact your dentist if you have severe pain, fever, or uncontrolled bleeding.",
  },
  {
    title: "How long does recovery take?",
    content:
      "Recovery typically takes a few days. However, it's important to avoid strenuous activity for at least 24 hours to minimize bleeding and aid the healing process.",
  },
  {
    title: "When should I follow up with my dentist?",
    content:
      "Follow up if you experience severe pain, swelling, signs of infection, or if you have any concerns. Otherwise, adhere to your dentist's recommended schedule for check-ups.",
  },
  {
    title: "Can I replace the extracted tooth?",
    content:
      "Yes, options like dental implants, bridges, or dentures can be considered to replace an extracted tooth. Discuss these options with your dentist.",
  },
];

export function ExtractionFaq() {
  return (
    <FaqSection
      theme="cream"
      title="Frequently Asked"
      accent="Question"
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
