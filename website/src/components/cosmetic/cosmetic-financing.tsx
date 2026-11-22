import { BookButton, ButtonLink, Heading, Section } from "@/components/hims";
import { NumberedList } from "@/components/hims/numbered-list";
import { StackedFlow } from "@/components/hims/stacked-flow";

const CHOOSING_FACTORS = [
  {
    title: "Experience and Qualifications:",
    desc: "Look for a dentist with specialized training and a portfolio of before-and-after cases.",
  },
  {
    title: "Technology:",
    desc: "Opt for a clinic that uses the latest technology for more precise and effective treatments.",
  },
  {
    title: "Reviews and Testimonials:",
    desc: "Customer reviews can provide valuable insights into patient satisfaction and quality of service.",
  },
  {
    title: "Consultation:",
    desc: "A thorough initial consultation is a good sign of a dentist’s professionalism and concern for your needs.",
  },
] as const;

export function CosmeticFinancing() {
  return (
    <Section id="financing" theme="white">
      <StackedFlow
        lead={
          <>
            <Heading as="h2" size="h2-md" accent="Financing" tone="terracotta" inline>
              Costs and
            </Heading>
            <p className="mt-4 text-lead text-muted">
              The cost of cosmetic dentistry varies widely depending on the type of procedure, the
              expertise of the dentist, and geographic location. While many cosmetic procedures are
              not covered by dental insurance, financing options are often available.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row [&>*]:max-sm:w-full">
              <BookButton>Book Appointment</BookButton>
              <ButtonLink to="/pricing" variant="outline">
                View Pricing
              </ButtonLink>
            </div>
          </>
        }
      >
        <div className="rounded-[2rem] bg-tile-cream p-6 md:p-10">
          <Heading as="h3" size="h3-md" accent="General Dentist" tone="terracotta" inline>
            How to Choose a
          </Heading>
          <NumberedList
            size="text"
            className="mt-6"
            items={CHOOSING_FACTORS.map((factor) => ({
              title: factor.title,
              children: factor.desc,
            }))}
          />
        </div>
      </StackedFlow>
    </Section>
  );
}
