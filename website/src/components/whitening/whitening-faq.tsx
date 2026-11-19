import { BookButton, ButtonLink, FaqList, Heading, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "How do whitening strips differ from trays (kits)?",
    a: "As well as being more cost-effective than trays, WhiteWash Professional Whitening Strips are more comfortable, less bulky, and allow you to whiten on the go. Whats more, each strip already contains the optimum amount of whitening gel so its less hassle for you and helps to ensure you achieve an even white smile.",
  },
  {
    q: "Will I get even results?",
    a: "Each strip contains the exact amount of whitening gel to effectively whiten your teeth. Each strip should be positioned across the teeth and gently pressed into place, aiming to get maximum contact with all of your visible teeth. This will ensure even spread of the whitening gel.",
  },
  {
    q: "If white spots appear will they go or are they permanent?",
    a: "No. These white spots are temporary; they are not harmful and will disappear within 24 hours.",
  },
  {
    q: "What If I experience tooth sensitivity or gum irritation?",
    a: "It is not uncommon to experience tooth sensitivity and / or gum irritation whilst whitening your teeth. This is temporary and NOT harmful. To alleviate symptoms it may be sensible to whiten your teeth on alternate days, until you have used all of the strips. If the problem persists, discontinue use and consult your dentist.",
  },
  {
    q: "Why can't I buy teeth whitening gel online?",
    a: "Each strip contains the exact amount of whitening gel to effectively whiten your teeth. Each strip should be positioned across the teeth and gently pressed into place, aiming to get maximum contact with all of your visible teeth. This will ensure even spread of the whitening gel.",
  },
  {
    q: "Can I swallow saliva when using the whitening strips?",
    a: "Yes, you can. It is perfectly safe to swallow saliva when using the whitening strips. You may also notice a foaming reaction as the hydrogen peroxide gets to work, this is normal.",
  },
  {
    q: "Are whitening strips suitable for everyone?",
    a: "Though the whitening strips are non-harmful to the human body, it is advised that children under the age of 16 (18 in the European Union due to this being a legal requirement), pregnant women, and those sensitive to hydrogen peroxide should not use them. Patients with teeth sensitive to cold, heat or acid, or those who suffer from oral ulceration should discuss this with their prescribing dentist before undergoing a course of whitening treatment.",
  },
  {
    q: "Can the whitening strips be in contact with my gums?",
    a: "Yes, but such contact should be minimised to avoid gum irritation.",
  },
  {
    q: "Can I use a whitening toothpaste everyday?",
    a: "Yes, you can use WhiteWash Whitening toothpastes like you would use your normal toothpaste. However this is not always the case with all whitening toothpastes as some can be extremely abrasive, so it is best to check with the specific toothpaste manufacturer.",
  },
  {
    q: "What if white spots appear?",
    a: "These white spots are temporary; they are not harmful and will disappear within 24 hours.",
  },
];

export function WhiteningFaq() {
  return (
    <Section id="faq" theme="white">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-14">
        <div className="lg:sticky lg:top-24">
          <Heading size="h2-md" accent="Question" tone="terracotta">
            Frequently Asked
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Guidance on whitening strips, kits, sensitivity, and suitability.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <BookButton>Book Appointment</BookButton>
            <ButtonLink to="/contact-us" variant="outline">
              Contact us
            </ButtonLink>
          </div>
        </div>

        <FaqList items={FAQS} tone="light" defaultOpen={0} />
      </div>
    </Section>
  );
}
