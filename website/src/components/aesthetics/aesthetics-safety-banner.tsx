import { BookButton, Heading, Section } from "@/components/hims";
import { TitleCards } from "@/components/hims/title-cards";

export function AestheticsSafetyBanner() {
  return (
    <Section id="safety" theme="navy" space="lg">
      <TitleCards
        tone="dark"
        columns={2}
        items={[
          {
            title: "Age Limit",
            body: "For the well-being and safety of our patients, all individuals seeking treatment with us MUST be at least 18 years of age.",
          },
          {
            title: "Things to Know",
            body: "Before you embark on your journey, it's essential to be aware of some key details.",
          },
        ]}
      />

      <div className="mt-14 grid gap-8 md:mt-20 lg:grid-cols-2 lg:gap-28">
        <Heading as="h2" size="h2-md" accent="Keeping You Safe" tone="butter">
          How We are
        </Heading>
        <div>
          <p className="text-body text-white/80">
            At Pav Dental, your safety is paramount. We prioritise your well-being and have
            implemented stringent measures to create a safe and healthy environment. As a regulated
            clinic under the Care Quality Commission (CQC), we adhere to rigorous guidelines for
            cleanliness, sterilisation, and staff training. Our team is equipped with the latest
            safety procedures and personal protective equipment. We maintain social distancing and
            limit patient numbers to ensure minimal risk of exposure. By choosing Pav Dental, you
            can trust that we meet the highest standards of quality and safety. Your health and
            peace of mind are our utmost priority.
          </p>
          <div className="mt-8">
            <BookButton variant="butter">Book Now</BookButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
