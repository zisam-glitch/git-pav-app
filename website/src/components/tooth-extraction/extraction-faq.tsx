import { BookButton, CallButton, FaqPhoto, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "Why is tooth extraction necessary?",
    a: "Tooth extraction is necessary when a tooth is too damaged or decayed to be repaired, when there's severe gum disease (periodontitis), for orthodontic reasons (like overcrowding), or impacted wisdom teeth.",
  },
  {
    q: "How should I prepare for a tooth extraction?",
    a: "Inform your dentist about any medical conditions and medications you're taking. Avoid smoking before the procedure, and arrange for someone to drive you home if you'll be sedated.",
  },
  {
    q: "What is the procedure for tooth extraction?",
    a: "The procedure varies depending on the tooth. Generally, the area is numbed with local anesthesia. If the tooth is impacted, an incision may be made in the gum. The tooth is then rocked back and forth to loosen it before removal.",
  },
  {
    q: "Is tooth extraction painful?",
    a: "You shouldn't feel pain during the extraction due to anesthesia, but you may feel pressure. Post-extraction, some discomfort and swelling are normal.",
  },
  {
    q: "What should I expect after the extraction?",
    a: "After the extraction, it's common to experience some bleeding, swelling, and discomfort. Your dentist will provide instructions on managing these symptoms.",
  },
  {
    q: "How should I care for my mouth after extraction?",
    a: "Avoid rinsing, spitting, or sucking actions for the first 24 hours. Use pain relief as advised, and apply an ice pack to reduce swelling. Eat soft foods and gradually reintroduce other foods as healing progresses.",
  },
  {
    q: "What are the potential complications of tooth extraction?",
    a: "Potential complications include dry socket, infection, prolonged bleeding, or damage to adjacent teeth or jawbone. Contact your dentist if you have severe pain, fever, or uncontrolled bleeding.",
  },
  {
    q: "How long does recovery take?",
    a: "Recovery typically takes a few days. However, it's important to avoid strenuous activity for at least 24 hours to minimize bleeding and aid the healing process.",
  },
  {
    q: "When should I follow up with my dentist?",
    a: "Follow up if you experience severe pain, swelling, signs of infection, or if you have any concerns. Otherwise, adhere to your dentist's recommended schedule for check-ups.",
  },
  {
    q: "Can I replace the extracted tooth?",
    a: "Yes, options like dental implants, bridges, or dentures can be considered to replace an extracted tooth. Discuss these options with your dentist.",
  },
];

export function ExtractionFaq() {
  return (
    <Section id="faq" theme="white" aria-labelledby="extraction-faq-heading">
      <FaqPhoto
        id="extraction-faq-heading"
        title="Frequently Asked Questions"
        items={FAQS}
        image="/images/generated/tooth-extraction-hero.jpg"
        alt=""
        actions={
          <>
            <BookButton>Make an Appointment</BookButton>
            <CallButton variant="outline" />
          </>
        }
      />
    </Section>
  );
}
