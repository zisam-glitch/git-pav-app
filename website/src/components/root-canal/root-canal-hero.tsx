import { BookButton, ButtonLink, CallButton, Heading, Media, Section } from "@/components/hims";

export function RootCanalHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Pav Dental Advanced Root Canal Care"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <Heading as="h1" size="hero" accent="Advanced Root Canal Care" tone="terracotta">
            Pav Dental
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Explore our transparent root canal pricing for basic, intermediate, and advanced
            treatments, along with essential information to help you make an informed decision about
            your dental care.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink to="/contact-us" variant="outline">
              Contact us
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <a
              href="#pricing"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Our Root Canal Prices (£195 – £395)
            </a>
            <a
              href="#consent"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              Informed Consent for Root Canal Treatment
            </a>
          </div>
        </div>

        <Media
          alt="Warm sunlit Pav Dental treatment room prepared for root canal care"
          ratio="4 / 3"
          tone="cream"
          priority
        />
      </div>
    </Section>
  );
}
