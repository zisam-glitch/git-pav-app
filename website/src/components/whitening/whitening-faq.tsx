import { BookButton, ButtonLink } from "@/components/hims";
import { FaqSection } from "@/components/hims/faq-section";
import type { InfoAccordionItem } from "@/components/hims/info-accordion";

const FAQS: readonly InfoAccordionItem[] = [
  {
    title: "How do whitening strips differ from trays (kits)?",
    content:
      "As well as being more cost-effective than trays, WhiteWash Professional Whitening Strips are more comfortable, less bulky, and allow you to whiten on the go. Whats more, each strip already contains the optimum amount of whitening gel so its less hassle for you and helps to ensure you achieve an even white smile.",
  },
  {
    title: "Will I get even results?",
    content:
      "Each strip contains the exact amount of whitening gel to effectively whiten your teeth. Each strip should be positioned across the teeth and gently pressed into place, aiming to get maximum contact with all of your visible teeth. This will ensure even spread of the whitening gel.",
  },
  {
    title: "If white spots appear will they go or are they permanent?",
    content:
      "No. These white spots are temporary; they are not harmful and will disappear within 24 hours.",
  },
  {
    title: "What If I experience tooth sensitivity or gum irritation?",
    content:
      "It is not uncommon to experience tooth sensitivity and / or gum irritation whilst whitening your teeth. This is temporary and NOT harmful. To alleviate symptoms it may be sensible to whiten your teeth on alternate days, until you have used all of the strips. If the problem persists, discontinue use and consult your dentist.",
  },
  {
    title: "Why can't I buy teeth whitening gel online?",
    content:
      "Each strip contains the exact amount of whitening gel to effectively whiten your teeth. Each strip should be positioned across the teeth and gently pressed into place, aiming to get maximum contact with all of your visible teeth. This will ensure even spread of the whitening gel.",
  },
  {
    title: "Can I swallow saliva when using the whitening strips?",
    content:
      "Yes, you can. It is perfectly safe to swallow saliva when using the whitening strips. You may also notice a foaming reaction as the hydrogen peroxide gets to work, this is normal.",
  },
  {
    title: "Are whitening strips suitable for everyone?",
    content:
      "Though the whitening strips are non-harmful to the human body, it is advised that children under the age of 16 (18 in the European Union due to this being a legal requirement), pregnant women, and those sensitive to hydrogen peroxide should not use them. Patients with teeth sensitive to cold, heat or acid, or those who suffer from oral ulceration should discuss this with their prescribing dentist before undergoing a course of whitening treatment.",
  },
  {
    title: "Can the whitening strips be in contact with my gums?",
    content: "Yes, but such contact should be minimised to avoid gum irritation.",
  },
  {
    title: "Can I use a whitening toothpaste everyday?",
    content:
      "Yes, you can use WhiteWash Whitening toothpastes like you would use your normal toothpaste. However this is not always the case with all whitening toothpastes as some can be extremely abrasive, so it is best to check with the specific toothpaste manufacturer.",
  },
  {
    title: "What if white spots appear?",
    content:
      "These white spots are temporary; they are not harmful and will disappear within 24 hours.",
  },
];

export function WhiteningFaq() {
  return (
    <FaqSection
      title="Frequently Asked"
      accent="Question"
      lead="Guidance on whitening strips, kits, sensitivity, and suitability."
      actions={
        <>
          <BookButton>Book Appointment</BookButton>
          <ButtonLink to="/contact-us" variant="outline">
            Contact us
          </ButtonLink>
        </>
      }
      items={FAQS}
    />
  );
}
