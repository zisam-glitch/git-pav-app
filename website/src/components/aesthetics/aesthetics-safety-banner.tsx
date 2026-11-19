import { Heading, Section, Tile } from "@/components/hims";

export function AestheticsSafetyBanner() {
  return (
    <Section id="safety" theme="sand" aria-labelledby="aesthetics-safety-heading">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <Tile tone="white" className="p-6 md:p-8">
            <span className="text-small font-medium text-terracotta tabular-nums">1</span>
            <h3 className="mt-3 text-h4 text-fg">Age Limit</h3>
            <p className="mt-3 text-body text-muted">
              For the well-being and safety of our patients, all individuals seeking treatment with
              us MUST be at least 18 years of age.
            </p>
          </Tile>

          <Tile tone="white" className="p-6 md:p-8">
            <span className="text-small font-medium text-terracotta tabular-nums">2</span>
            <h3 className="mt-3 text-h4 text-fg">Things to Know</h3>
            <p className="mt-3 text-body text-muted">
              Before you embark on your journey, it's essential to be aware of some key details.
            </p>
          </Tile>
        </div>

        <Tile tone="white" className="flex flex-col justify-between p-6 md:p-10">
          <div>
            <span className="text-small font-medium text-terracotta tabular-nums">3</span>
            <div id="aesthetics-safety-heading" className="mt-3">
              <Heading size="h2-md" accent="Keeping You Safe" tone="terracotta">
                How We are
              </Heading>
            </div>
            <p className="mt-5 text-body text-muted">
              At Pav Dental, your safety is paramount. We prioritise your well-being and have
              implemented stringent measures to create a safe and healthy environment. As a
              regulated clinic under the Care Quality Commission (CQC), we adhere to rigorous
              guidelines for cleanliness, sterilisation, and staff training. Our team is equipped
              with the latest safety procedures and personal protective equipment. We maintain
              social distancing and limit patient numbers to ensure minimal risk of exposure. By
              choosing Pav Dental, you can trust that we meet the highest standards of quality and
              safety. Your health and peace of mind are our utmost priority.
            </p>
          </div>
        </Tile>
      </div>
    </Section>
  );
}
