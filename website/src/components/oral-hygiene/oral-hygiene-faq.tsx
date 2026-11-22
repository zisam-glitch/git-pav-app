import { BookButton, CallButton } from "@/components/hims";
import { FaqSection } from "@/components/hims/faq-section";
import type { InfoAccordionItem } from "@/components/hims/info-accordion";

const FAQS: readonly InfoAccordionItem[] = [
  {
    title: "How Often Should I See the Hygienist?",
    content:
      "Most patients benefit from hygiene care every 3 to 6 months. Patients with gum disease or a higher risk of dental problems may need more frequent visits. Our dentist or hygienist will recommend the right interval for you.",
  },
  {
    title: "Does Hygiene Treatment Hurt?",
    content:
      "Hygiene treatment is usually very comfortable. If your gums are sensitive, we can apply a numbing gel to make the treatment easier and more relaxing.",
  },
  {
    title: "Is Hygiene the Same as Teeth Whitening?",
    content:
      "No. Hygiene treatment removes tartar, plaque, and surface stains, while teeth whitening is designed to lighten the natural colour of your teeth.",
  },
  {
    title: "Can Hygiene Stop Bleeding Gums?",
    content:
      "Yes. In most cases, professional cleaning combined with correct home care significantly improves bleeding gums.",
  },
  {
    title: "Is Hygiene Safe During Pregnancy?",
    content:
      "Yes. Hygiene treatment is completely safe during pregnancy and is highly recommended to maintain healthy gums and teeth.",
  },
  {
    title: "Will My Breath Improve After Hygiene Treatment?",
    content:
      "Yes. Removing bacteria and tartar from your teeth and gums significantly reduces bad breath and helps keep your mouth fresh.",
  },
];

export function OralHygieneFaq() {
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
