import { BookButton, ButtonLink, CallButton, Heading, Media, Section } from "@/components/hims";

export function MobileDentistryHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Mobile dental care"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <span className="inline-flex items-center rounded-pill bg-cream px-3.5 py-1 text-small font-medium text-terracotta">
            Coming Soon
          </span>
          <Heading as="h1" size="hero" accent="at Doorstep" tone="terracotta" className="mt-4">
            Mobile dental care
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-fg">
            Experience Convenient Mobile Dental Care with Comprehensive Dentistry Delivered to Your
            Doorstep.
          </p>
          <p className="mt-4 max-w-xl text-body text-muted">
            Pav Dental Mobile is a unique dental service that enables our patients to access a full
            range of dental services from the comfort of their own home. With many combined years of
            dental experience in both traditional and mobile dentistry along with the latest
            technology and equipment we guarantee our patients the upmost satisfactory service.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Contact us
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
        </div>

        <Media
          src="/images/generated/mobile-dentistry-hero.jpg"
          alt="Pav Dental mobile dentistry equipment in warm natural light"
          ratio="4 / 3"
          tone="cream"
          priority
        />
      </div>
    </Section>
  );
}
