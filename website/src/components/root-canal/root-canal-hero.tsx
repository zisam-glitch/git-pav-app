import {
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Media,
  Section,
  Tile,
} from "@/components/hims";

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
          <p className="inline-flex items-center gap-2 rounded-pill border border-border bg-cream px-3.5 py-1.5 text-caption font-medium text-terracotta">
            <span aria-hidden className="size-1.5 rounded-full bg-terracotta" />
            Endodontic &amp; Restorative Care
          </p>
          <Heading
            as="h1"
            size="hero"
            accent="Advanced Root Canal Care"
            tone="terracotta"
            className="mt-4"
          >
            Pav Dental
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Explore our transparent root canal pricing for basic, intermediate, and advanced
            treatments, along with essential information to help you make an informed decision about
            your dental care.
          </p>

          <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
            <Tile
              tone="cream"
              className="flex flex-col justify-between gap-2 border border-border p-4 md:p-5"
            >
              <p className="text-h4 text-fg tabular-nums">£195 – £395</p>
              <p className="border-t border-border pt-2.5 text-small text-muted">
                Basic, intermediate &amp; advanced root canal tiers
              </p>
            </Tile>
            <Tile
              tone="sage"
              className="flex flex-col justify-between gap-2 border border-border p-4 md:p-5"
            >
              <p className="text-h4 text-fg">45–90 Minutes</p>
              <p className="border-t border-border pt-2.5 text-small text-muted">
                Local anaesthesia comfort to save your natural tooth
              </p>
            </Tile>
          </div>

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
          src="/images/generated/root-canal-hero.jpg"
          alt="Warm sunlit Pav Dental treatment room prepared for root canal care"
          ratio="4 / 3"
          tone="cream"
          className="ring-1 ring-black/8"
          priority
        />
      </div>
    </Section>
  );
}
