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
      <ul className="list-none space-y-3">
        {["Enhanced Appearance", "Boosted Confidence", "Long-Lasting Results"].map((t) => (
          <li key={t} className="flex items-center gap-3 text-[17px] text-[#55565a]">
            <span className="grid size-5 place-items-center rounded-full bg-[#8a4242] text-white">
              <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
                <path
                  d="M2.5 6.2l2.2 2.2 4.8-4.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-xl text-[15px] leading-[1.5] text-[#6b6b70]">
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
