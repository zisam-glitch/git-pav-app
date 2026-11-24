import {
  ServiceHeroLayout,
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Tile,
} from "@/components/hims";

export function MobileDentistryHero() {
  return (
    <ServiceHeroLayout
      label="Mobile dental care"
      images={[
        {
          src: "/images/generated/mobile-dentistry-hero.jpg",
          alt: "Pav Dental mobile dentistry equipment in warm natural light",
        },
        { src: "/images/generated/mobile-dentistry-service.jpg", alt: "" },
        { src: "/images/generated/mobile-dentistry-location.jpg", alt: "" },
      ]}
      head={
        <>
          <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
            Coming Soon
          </span>
          <Heading as="h1" size="hero" accent="at Doorstep" tone="terracotta" className="mt-4">
            Mobile dental care
          </Heading>
        </>
      }
    >
      <p className="mt-5 max-w-xl text-lead text-fg">
        Experience Convenient Mobile Dental Care with Comprehensive Dentistry Delivered to Your
        Doorstep :
      </p>
      <p className="mt-4 max-w-xl text-body leading-relaxed text-muted">
        Pav Dental Mobile is a unique dental service that enables our patients to access a full
        range of dental services from the comfort of their own home. With many combined years of
        dental experience in both traditional and mobile dentistry along with the latest technology
        and equipment we guarantee our patients the upmost satisfactory service.
      </p>

      <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
        <Tile tone="grey" className="border border-border/60 p-3.5">
          <p className="text-caption font-medium text-copper">Care Homes</p>
          <p className="mt-1 text-label text-fg">CQC-Compliant Care</p>
        </Tile>
        <Tile tone="grey" className="border border-border/60 p-3.5">
          <p className="text-caption font-medium text-copper">Clinical Setup</p>
          <p className="mt-1 text-label text-fg">Mobile Surgery</p>
        </Tile>
        <Tile tone="grey" className="border border-border/60 p-3.5">
          <p className="text-caption font-medium text-copper">Reach</p>
          <p className="mt-1 text-label text-fg">Visits Across the UK</p>
        </Tile>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <BookButton>Make an Appointment</BookButton>
        <ButtonLink href="#contact" variant="outline">
          Contact us
        </ButtonLink>
        <CallButton variant="ghost" />
      </div>

      <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-small text-muted">
        <a href="#benefits" className="underline underline-offset-4 t-colors hover:text-terracotta">
          Care Home &amp; Resident Benefits
        </a>
        <a href="#location" className="underline underline-offset-4 t-colors hover:text-terracotta">
          UK-Wide Location Coverage
        </a>
      </div>
    </ServiceHeroLayout>
  );
}
