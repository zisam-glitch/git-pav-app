import { BookButton, CallButton, FaqList, Heading, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "What is general dentistry?",
    a: "General dentistry focuses on preventive care and treatments to maintain healthy teeth and gums. It includes regular check-ups, cleanings, fillings, root canals, extractions, and patient education on oral hygiene.",
  },
  {
    q: "What services do general dentists offer?",
    a: "General dentists provide services like dental exams, cleanings, x-rays, fillings, crowns, bridges, root canal treatments, gum care, and sometimes orthodontic treatments like braces.",
  },
  {
    q: "How often should I visit a general dentist?",
    a: "It's recommended to visit a dentist for check-ups and cleanings every six months. However, your dentist may suggest a different schedule based on your specific oral health needs.",
  },
  {
    q: "What's the difference between general dentistry and specialized dentistry?",
    a: "General dentists provide a broad range of dental care and are your primary dental care providers. Specialists, like orthodontists or periodontists, focus on specific areas of dental health.",
  },
  {
    q: "Can general dentists perform cosmetic procedures?",
    a: "Yes, many general dentists can perform cosmetic procedures such as teeth whitening, veneers, and bonding. However, complex cosmetic work may require a specialist.",
  },
  {
    q: "What should I expect during a dental check-up?",
    a: "A dental check-up typically includes an examination of your teeth, gums, and mouth, dental cleanings to remove plaque and tartar, and possibly X-rays to detect underlying issues.",
  },
  {
    q: "How can I maintain good oral health at home?",
    a: "Good oral hygiene includes brushing twice a day, flossing daily, using mouthwash, eating a balanced diet, and avoiding tobacco products. Regular dental visits are also crucial.",
  },
  {
    q: "Are dental X-rays safe?",
    a: "Dental X-rays are safe and expose you to very low levels of radiation. However, inform your dentist if you're pregnant or have specific health concerns.",
  },
  {
    q: "What is a dental emergency, and how is it handled?",
    a: "Dental emergencies include severe toothache, broken or knocked-out teeth, and acute gum or jaw pain. In such cases, it's important to see a dentist immediately for urgent care.",
  },
  {
    q: "How are cavities treated?",
    a: "Cavities are treated by removing the decayed part of the tooth and filling it with materials like composite resin or amalgam.",
  },
  {
    q: "What are the signs of gum disease?",
    a: "Signs of gum disease include red, swollen, or bleeding gums, bad breath, loose teeth, and receding gums. Early detection and treatment are crucial.",
  },
  {
    q: "Can general dentists treat children?",
    a: "Many general dentists can treat children, and some even specialize in pediatric dentistry. It's important to find a dentist who is comfortable and experienced in treating young patients.",
  },
];

export function GeneralDentistryFaq() {
  return (
    <Section theme="cream">
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-14">
        <div className="lg:sticky lg:top-24">
          <p className="inline-flex rounded-pill border border-border bg-white px-3.5 py-1.5 text-caption font-medium text-terracotta">
            Patient Guidance
          </p>
          <Heading size="h2-md" accent="Questions" tone="terracotta" className="mt-4">
            Frequently Asked
          </Heading>
          <div className="mt-6 flex flex-wrap gap-3">
            <BookButton>Book Appointment</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>

        <FaqList items={FAQS} tone="light" defaultOpen={0} />
      </div>
    </Section>
  );
}
