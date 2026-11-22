import { BookButton, CallButton } from "@/components/hims";
import { FaqSection } from "@/components/hims/faq-section";
import type { InfoAccordionItem } from "@/components/hims/info-accordion";

const FAQS: readonly InfoAccordionItem[] = [
  {
    title: "What’s the difference between standard dentures and implant-retained dentures?",
    content:
      "Standard dentures rely on gravity, while implant-retained dentures are secured with implants, offering a more stable and secure fit.",
  },
  {
    title: "Can I eat normally with dentures?",
    content:
      "With well-fitting dentures, you’ll enjoy a wider variety of foods, making dining a more enjoyable experience.",
  },
  {
    title: "How much do dentures cost?",
    content:
      "Denture prices vary depending on the type. For example: * Standard dentures are £495. * Flexible dentures are £795. * Cobalt chromium dentures are £1095.",
  },
  {
    title: "How do implant-retained dentures differ from regular implants?",
    content:
      "Implant-retained dentures are removable and click onto implants, while standard implants are permanently fixed in place.",
  },
  {
    title: "How do I clean my dentures?",
    content:
      "Use an antibacterial and antifungal cleaner, which you can find at most retailers like Boots or Tesco. Follow the manufacturer’s instructions for best results.",
  },
  {
    title: "Can I sleep with my dentures in?",
    content:
      "While it’s possible, we recommend removing them to allow your gums to breathe and avoid irritation. You can do this discreetly while showering or bathing.",
  },
  {
    title: "What should I do if my dentures feel loose?",
    content:
      "If your dentures feel loose, visit us for an assessment. In some cases, adjustments or relining may be required. Denture adhesives can also help for temporary fixes.",
  },
  {
    title: "Do I need to replace my dentures over time?",
    content:
      "Yes, your gums can change over time, which may affect the fit of your dentures. Regular checkups will help ensure they remain comfortable.",
  },
  {
    title: "Are there alternatives to dentures?",
    content:
      "Yes, implants and bridges are alternatives to traditional dentures, providing different benefits based on your oral health needs.",
  },
  {
    title: "Can dentures help improve my speech?",
    content:
      "Yes, well-made dentures can enhance your speech by providing proper support for your mouth and jaw.",
  },
];

export function DenturesFaq() {
  return (
    <FaqSection
      title="Frequently Asked"
      accent="Questions"
      actions={
        <>
          <BookButton>Make an Appointment</BookButton>
          <CallButton variant="outline" />
        </>
      }
      items={FAQS}
    />
  );
}
