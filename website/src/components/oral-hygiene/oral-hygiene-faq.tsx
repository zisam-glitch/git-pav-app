import { BookButton, CallButton, FaqList, Heading, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "How Often Should I See the Hygienist?",
    a: "Most patients benefit from hygiene care every 3 to 6 months. Patients with gum disease or a higher risk of dental problems may need more frequent visits. Our dentist or hygienist will recommend the right interval for you.",
  },
  {
    q: "Does Hygiene Treatment Hurt?",
    a: "Hygiene treatment is usually very comfortable. If your gums are sensitive, we can apply a numbing gel to make the treatment easier and more relaxing.",
  },
  {
    q: "Is Hygiene the Same as Teeth Whitening?",
    a: "No. Hygiene treatment removes tartar, plaque, and surface stains, while teeth whitening is designed to lighten the natural colour of your teeth.",
  },
  {
    q: "Can Hygiene Stop Bleeding Gums?",
    a: "Yes. In most cases, professional cleaning combined with correct home care significantly improves bleeding gums.",
  },
  {
    q: "Is Hygiene Safe During Pregnancy?",
    a: "Yes. Hygiene treatment is completely safe during pregnancy and is highly recommended to maintain healthy gums and teeth.",
  },
  {
    q: "Will My Breath Improve After Hygiene Treatment?",
    a: "Yes. Removing bacteria and tartar from your teeth and gums significantly reduces bad breath and helps keep your mouth fresh.",
  },
];

export function OralHygieneFaq() {
  return (
    <Section theme="white" space="default">
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-14">
        <div className="lg:sticky lg:top-24">
          <p className="inline-flex rounded-pill bg-white px-3.5 py-1.5 text-caption font-medium text-terracotta">
            Patient Guidance
          </p>
          <Heading as="h2" size="h2-md" accent="Question" tone="terracotta" className="mt-4">
            Frequently Asked
          </Heading>
          <p className="mt-4 max-w-sm text-lead text-muted">
            Common questions about hygiene visits, comfort, pregnancy care, and keeping your mouth
            fresh.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>

        <FaqList items={FAQS} />
      </div>
    </Section>
  );
}
