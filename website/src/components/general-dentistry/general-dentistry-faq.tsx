import { BookButton, CallButton } from "@/components/hims";
import { FaqSection } from "@/components/hims/faq-section";
import type { InfoAccordionItem } from "@/components/hims/info-accordion";

const FAQS: readonly InfoAccordionItem[] = [
  {
    title: "What is general dentistry?",
    content:
      "General dentistry focuses on preventive care and treatments to maintain healthy teeth and gums. It includes regular check-ups, cleanings, fillings, root canals, extractions, and patient education on oral hygiene.",
  },
  {
    title: "What services do general dentists offer?",
    content:
      "General dentists provide services like dental exams, cleanings, x-rays, fillings, crowns, bridges, root canal treatments, gum care, and sometimes orthodontic treatments like braces.",
  },
  {
    title: "How often should I visit a general dentist?",
    content:
      "It's recommended to visit a dentist for check-ups and cleanings every six months. However, your dentist may suggest a different schedule based on your specific oral health needs.",
  },
  {
    title: "What's the difference between general dentistry and specialized dentistry?",
    content:
      "General dentists provide a broad range of dental care and are your primary dental care providers. Specialists, like orthodontists or periodontists, focus on specific areas of dental health.",
  },
  {
    title: "Can general dentists perform cosmetic procedures?",
    content:
      "Yes, many general dentists can perform cosmetic procedures such as teeth whitening, veneers, and bonding. However, complex cosmetic work may require a specialist.",
  },
  {
    title: "What should I expect during a dental check-up?",
    content:
      "A dental check-up typically includes an examination of your teeth, gums, and mouth, dental cleanings to remove plaque and tartar, and possibly X-rays to detect underlying issues.",
  },
  {
    title: "How can I maintain good oral health at home?",
    content:
      "Good oral hygiene includes brushing twice a day, flossing daily, using mouthwash, eating a balanced diet, and avoiding tobacco products. Regular dental visits are also crucial.",
  },
  {
    title: "Are dental X-rays safe?",
    content:
      "Dental X-rays are safe and expose you to very low levels of radiation. However, inform your dentist if you're pregnant or have specific health concerns.",
  },
  {
    title: "What is a dental emergency, and how is it handled?",
    content:
      "Dental emergencies include severe toothache, broken or knocked-out teeth, and acute gum or jaw pain. In such cases, it's important to see a dentist immediately for urgent care.",
  },
  {
    title: "How are cavities treated?",
    content:
      "Cavities are treated by removing the decayed part of the tooth and filling it with materials like composite resin or amalgam.",
  },
  {
    title: "What are the signs of gum disease?",
    content:
      "Signs of gum disease include red, swollen, or bleeding gums, bad breath, loose teeth, and receding gums. Early detection and treatment are crucial.",
  },
  {
    title: "Can general dentists treat children?",
    content:
      "Many general dentists can treat children, and some even specialize in pediatric dentistry. It's important to find a dentist who is comfortable and experienced in treating young patients.",
  },
];

export function GeneralDentistryFaq() {
  return (
    <FaqSection
      theme="cream"
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
