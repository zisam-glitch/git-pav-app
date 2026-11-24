import {
  ServiceHeroLayout,
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Tile,
} from "@/components/hims";

export function ExtractionHero() {
  return (
    <ServiceHeroLayout
      label="Pav Dental: Same day Tooth Extraction"
      images={[
        {
          src: "/images/generated/tooth-extraction-hero.jpg",
          alt: "Serene Pav Dental oral surgery suite in warm natural light prepared for same-day tooth extraction",
        },
        { src: "/images/generated/home-card-extraction.jpg", alt: "" },
        { src: "/images/generated/home-checkup.jpg", alt: "" },
      ]}
      head={
        <>
          <p className="inline-flex items-center gap-2 rounded-pill border border-border bg-cream px-3.5 py-1.5 text-caption font-medium text-terracotta">
            <span aria-hidden className="size-1.5 rounded-full bg-terracotta" />
            Urgent &amp; Surgical Care
          </p>
          <Heading
            as="h1"
            size="hero"
            accent="Same day Tooth Extraction"
            tone="terracotta"
            className="mt-4"
          >
            Pav Dental:
          </Heading>
        </>
      }
    >
      <p className="mt-5 max-w-xl text-lead text-muted">
        At Pav Dental, our experienced oral surgeons are dedicated to providing you with the highest
        standard of care. Utilizing the latest techniques and technologies, we ensure a comfortable
        and effective treatment experience.
      </p>

      <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
        <Tile
          tone="grey"
          className="flex flex-col justify-between gap-2 border border-border p-4 md:p-5"
        >
          <p className="text-h4 text-fg tabular-nums">From £95</p>
          <p className="border-t border-border pt-2.5 text-small text-muted">
            Simple, intermediate, advanced &amp; surgical extractions
          </p>
        </Tile>
        <Tile
          tone="grey"
          className="flex flex-col justify-between gap-2 border border-border p-4 md:p-5"
        >
          <p className="text-h4 text-fg">Same-Day Relief</p>
          <p className="border-t border-border pt-2.5 text-small text-muted">
            Local anaesthetic comfort &amp; comprehensive aftercare
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
        <a href="#pricing" className="underline underline-offset-4 t-colors hover:text-terracotta">
          Our Tooth Extraction Prices (£95 – £295)
        </a>
        <a href="#post-op" className="underline underline-offset-4 t-colors hover:text-terracotta">
          Post Operative Instructions
        </a>
      </div>
    </ServiceHeroLayout>
  );
}
