import { BookButton, FaqSplit, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "What’s the difference between standard dentures and implant-retained dentures?",
    a: "Standard dentures rely on gravity, while implant-retained dentures are secured with implants, offering a more stable and secure fit.",
  },
  {
    q: "Can I eat normally with dentures?",
    a: "With well-fitting dentures, you’ll enjoy a wider variety of foods, making dining a more enjoyable experience.",
  },
  {
    q: "How much do dentures cost?",
    a: "Denture prices vary depending on the type. For example: * Standard dentures are £495. * Flexible dentures are £795. * Cobalt chromium dentures are £1095.",
  },
  {
    q: "How do implant-retained dentures differ from regular implants?",
    a: "Implant-retained dentures are removable and click onto implants, while standard implants are permanently fixed in place.",
  },
  {
    q: "How do I clean my dentures?",
    a: "Use an antibacterial and antifungal cleaner, which you can find at most retailers like Boots or Tesco. Follow the manufacturer’s instructions for best results.",
  },
  {
    q: "Can I sleep with my dentures in?",
    a: "While it’s possible, we recommend removing them to allow your gums to breathe and avoid irritation. You can do this discreetly while showering or bathing.",
  },
  {
    q: "What should I do if my dentures feel loose?",
    a: "If your dentures feel loose, visit us for an assessment. In some cases, adjustments or relining may be required. Denture adhesives can also help for temporary fixes.",
  },
  {
    q: "Do I need to replace my dentures over time?",
    a: "Yes, your gums can change over time, which may affect the fit of your dentures. Regular checkups will help ensure they remain comfortable.",
  },
  {
    q: "Are there alternatives to dentures?",
    a: "Yes, implants and bridges are alternatives to traditional dentures, providing different benefits based on your oral health needs.",
  },
  {
    q: "Can dentures help improve my speech?",
    a: "Yes, well-made dentures can enhance your speech by providing proper support for your mouth and jaw.",
  },
];

export function DenturesFaq() {
  return (
    <Section theme="white" aria-labelledby="dentures-faq-heading">
      <FaqSplit
        id="dentures-faq-heading"
        title="Frequently Asked Questions"
        action={<BookButton>Make an Appointment</BookButton>}
        items={FAQS}
      />
    </Section>
  );
}
