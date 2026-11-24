import { ServiceHeroLayout, BookButton, ButtonLink, CallButton, Heading } from "@/components/hims";

export function AestheticsHero() {
  return (
    <ServiceHeroLayout
      label="Pav Dental Aesthetics"
      images={[
        {
          src: "/images/generated/aesthetics-hero.jpg",
          alt: "Warm sunlit facial aesthetics consultation room at Pav Dental in Bradford",
        },
        { src: "/images/generated/aesthetics-premium.jpg", alt: "" },
        { src: "/images/generated/home-facial-aesthetics.jpg", alt: "" },
      ]}
      head={
        <>
          <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
            Pav Dental Aesthetics
          </span>
          <Heading as="h1" size="hero" accent="Perfection?" tone="terracotta" className="mt-4">
            Seeking
          </Heading>
        </>
      }
    >
      <p className="mt-5 max-w-xl text-lead text-muted">
        The Award-Winning Bradford Dental and Aesthetic Clinic: Excellence in Dental and Aesthetic
        Care.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <BookButton>Book Now</BookButton>
        <ButtonLink href="#pricing" variant="outline">
          Aesthetics Price List
        </ButtonLink>
        <CallButton variant="ghost" />
      </div>
      <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-small text-muted">
        <a
          href="#treatments"
          className="underline underline-offset-4 t-colors hover:text-terracotta"
        >
          Aesthetics Treatments
        </a>
        <a href="#safety" className="underline underline-offset-4 t-colors hover:text-terracotta">
          How We are Keeping You Safe
        </a>
      </div>
    </ServiceHeroLayout>
  );
}
