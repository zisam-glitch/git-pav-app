import { ServiceHeroLayout, BookButton, ButtonLink, CallButton, Heading } from "@/components/hims";

export function CosmeticHero() {
  return (
    <ServiceHeroLayout
      label="Cosmetic Dentistry"
      images={[
        {
          src: "/images/generated/cosmetic-hero.jpg",
          alt: "Cosmetic dentistry shade guide and porcelain dental mirror in warm natural studio light",
        },
        { src: "/images/generated/cosmetic-about.jpg", alt: "" },
        { src: "/images/generated/cosmetic-showcase.jpg", alt: "" },
      ]}
      head={
        <>
          <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
            Cosmetic Dentistry
          </span>
          <Heading
            as="h1"
            size="hero"
            accent="Transforming Smiles, Changing Lives"
            tone="terracotta"
            className="mt-4"
          >
            Cosmetic Dentistry:
          </Heading>
        </>
      }
    >
      <p className="mt-5 max-w-xl text-lead text-muted">
        Welcome to your definitive guide on Cosmetic Dentistry, where science meets art to enhance
        your smile. Explore teeth whitening, porcelain veneers, and more to achieve a dazzling smile
        and transform your confidence and appearance.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <BookButton>Book Now</BookButton>
        <ButtonLink href="#procedures" variant="outline">
          Popular Procedures
        </ButtonLink>
        <CallButton variant="ghost" />
      </div>
      <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-small text-muted">
        <a
          href="#financing"
          className="underline underline-offset-4 t-colors hover:text-terracotta"
        >
          Costs and Financing
        </a>
        <a href="#faq" className="underline underline-offset-4 t-colors hover:text-terracotta">
          Frequently Asked Questions
        </a>
      </div>
    </ServiceHeroLayout>
  );
}
