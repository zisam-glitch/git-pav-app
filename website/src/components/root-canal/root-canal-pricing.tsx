import { Check } from "lucide-react";
import {
  BookButton,
  CompareTable,
  DarkQuestion,
  ButtonLink,
  FeatureBento,
  IncludedList,
  Section,
} from "@/components/hims";
import { TIERS } from "./root-canal-data";

const { basic, intermediate, advanced } = TIERS;
const H2 =
  "text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]";

export function RootCanalPricing() {
  return (
    <>
      <Section id="pricing" theme="white" aria-labelledby="root-canal-pricing-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="root-canal-pricing-heading" className={H2}>
            Our Root Canal <span className="text-[#8a4242]">Prices</span>
          </h2>
          <p className="mt-4 text-lead text-muted">
            Explore our transparent root canal pricing for basic, intermediate, and advanced
            treatments.
          </p>
        </div>
        <div className="mt-12">
          <FeatureBento
            feature={{
              title: advanced.name,
              kicker: advanced.kicker,
              price: advanced.price,
              image: advanced.image,
              alt: advanced.alt,
              href: "#compare",
            }}
            items={[basic, intermediate].map((t) => ({
              title: t.name,
              kicker: t.kicker,
              price: t.price,
              image: t.image,
              alt: t.alt,
              href: "#compare",
            }))}
            help={{
              title: "Talk to our team",
              text: "Not sure which tier applies to your tooth? Book an appointment and we will guide you.",
              cta: <BookButton variant="gold">Make an Appointment</BookButton>,
            }}
          />
        </div>
      </Section>

      <Section id="compare" theme="white" aria-labelledby="root-canal-compare-heading">
        <div className="mx-auto max-w-[1100px]">
          <h2 id="root-canal-compare-heading" className={H2}>
            Three tiers, <span className="text-[#4a5c66]">compared</span>
          </h2>
          <div className="mt-10">
            <CompareTable
              columns={[basic, intermediate, advanced].map((t) => ({
                name: t.name,
                sub: t.price,
              }))}
              rows={[
                {
                  label: "Typically for",
                  cells: [basic, intermediate, advanced].map((t) => t.kicker),
                },
                {
                  label: "What it covers",
                  cells: [basic, intermediate, advanced].map((t) => t.description),
                },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section theme="white" aria-labelledby="root-canal-included-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="root-canal-included-heading" className={H2}>
            Everything in a root canal comes with <span className="text-[#4a5c66]">Pav Dental</span>
          </h2>
        </div>
        <IncludedList
          items={[
            { text: "Local anesthesia for comfort", icon: Check },
            { text: "Infected pulp removed", icon: Check },
            { text: "Canals cleaned and shaped", icon: Check },
            { text: "Sealed with a biocompatible material", icon: Check },
            { text: "Crown advice for back teeth", icon: Check },
          ]}
        />
      </Section>

      <Section theme="white" space="sm" aria-label="Is a root canal right for you?">
        <DarkQuestion
          lead="Could a root canal be"
          highlight="what you need?"
          text="You may need a root canal if the tooth pulp is infected or inflamed due to deep decay, cracks, repeated dental procedures, or trauma. Symptoms often include severe pain, sensitivity, or swelling."
          chips={["Pain", "Sensitivity", "Swelling", "Deep decay"]}
          cta={
            <ButtonLink href="#consent" variant="gold">
              Read the consent
            </ButtonLink>
          }
        />
      </Section>
    </>
  );
}
