import {
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Media,
  Section,
  Tile,
} from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

export function EmergencyHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Emergency Dentist"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-pill border border-border bg-cream px-3.5 py-1.5 text-caption font-medium text-terracotta">
            <span aria-hidden className="size-1.5 rounded-full bg-terracotta" />
            24/7 Emergency Dental Care
          </p>
          <Heading as="h1" size="hero" accent="Dentist" tone="terracotta" inline className="mt-4">
            Emergency
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Covering Bradford 24 Hours 7 days of the week including National and Bank Holidays
          </p>

          <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
            <Tile
              tone="cream"
              className="flex flex-col justify-between gap-2 border border-border p-5"
            >
              <p className="text-h4 text-fg tabular-nums">£45 consultation</p>
              <p className="border-t border-border pt-2.5 text-small text-muted">
                Monday to Friday between 9am – 5pm
              </p>
            </Tile>
            <Tile
              tone="sage"
              className="flex flex-col justify-between gap-2 border border-border p-5"
            >
              <p className="text-h4 text-fg tabular-nums">£90* out-of-hours consultation</p>
              <p className="border-t border-border pt-2.5 text-small text-muted">
                Weekends 9am – 8pm and Weekdays 5pm – 8pm
              </p>
            </Tile>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="default">Call us Now · {PRACTICE_PHONE}</CallButton>
            <BookButton variant="outline">Book Online</BookButton>
            <ButtonLink href="#pricing" variant="ghost">
              How much does it cost?
            </ButtonLink>
          </div>
        </div>

        <Media
          src="/images/generated/emergency-dental-hero.jpg"
          alt="Pav Dental emergency dental clinic in Bradford ready for 24-hour urgent dental care"
          ratio="4 / 3"
          tone="navy"
          className="ring-1 ring-black/8"
          priority
        />
      </div>
    </Section>
  );
}
