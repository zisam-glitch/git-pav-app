import { BookButton, FaqList, Heading, Section, type FaqItem } from "@/components/hims";

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
    a: (
      <div className="space-y-2">
        <p>Denture prices vary depending on the type. For example:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Standard dentures are £495.</li>
          <li>Flexible dentures are £795.</li>
          <li>Cobalt chromium dentures are £1095.</li>
        </ul>
      </div>
    ),
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
    <Section theme="white">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-14">
        <div className="lg:sticky lg:top-24">
          <Heading size="h2-md" accent="Questions" tone="terracotta">
            Frequently Asked
          </Heading>
          <div className="mt-6">
            <BookButton>Make an Appointment</BookButton>
          </div>
        </div>

        <FaqList items={FAQS} tone="light" defaultOpen={0} />
      </div>
    </Section>
  );
}
