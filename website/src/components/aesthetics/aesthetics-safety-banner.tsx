import { BookButton, Heading, Section, Tile } from "@/components/hims";

export function AestheticsSafetyBanner() {
  return (
    <Section id="safety" theme="navy" space="lg" aria-labelledby="aesthetics-safety-heading">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <Tile tone="glass" className="border border-white/15 p-6 md:p-8">
            <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3 py-0.5 text-caption font-medium text-butter tabular-nums">
              1
            </span>
            <h3 className="mt-4 text-h4 text-white">Age Limit</h3>
            <p className="mt-3 text-body leading-relaxed text-white/80">
              For the well-being and safety of our patients, all individuals seeking treatment with
              us MUST be at least 18 years of age.
            </p>
          </Tile>

          <Tile tone="glass" className="border border-white/15 p-6 md:p-8">
            <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3 py-0.5 text-caption font-medium text-butter tabular-nums">
              2
            </span>
            <h3 className="mt-4 text-h4 text-white">Things to Know</h3>
            <p className="mt-3 text-body leading-relaxed text-white/80">
              Before you embark on your journey, it's essential to be aware of some key details.
            </p>
          </Tile>
        </div>

        <Tile
          tone="glass"
          className="flex flex-col justify-between gap-8 border border-white/15 p-6 md:p-10"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3 py-0.5 text-caption font-medium text-butter tabular-nums">
                3
              </span>
              <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3 py-0.5 text-caption font-medium text-white/85">
                CQC Regulated Clinic
              </span>
            </div>
            <div id="aesthetics-safety-heading" className="mt-4">
              <Heading size="h2-md" accent="Keeping You Safe" tone="butter">
                How We are
              </Heading>
            </div>
            <p className="mt-5 border-t border-white/15 pt-5 text-body leading-relaxed text-white/80">
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

          <div className="flex flex-wrap gap-3">
            <BookButton variant="butter">Book Now</BookButton>
          </div>
        </Tile>
      </div>
    </Section>
  );
}
