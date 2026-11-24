import { BookButton, CallButton, FaqPhoto, Section, type FaqItem } from "@/components/hims";

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
    <Section theme="white" aria-labelledby="hygiene-faq-heading">
      <FaqPhoto
        id="hygiene-faq-heading"
        title="Frequently Asked Question"
        items={FAQS}
        image="/images/generated/oral-hygiene-showcase.jpg"
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
