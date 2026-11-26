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
        { src: "/images/generated/aesthetics-skin.jpg", alt: "" },
      ]}
      head={
        <>
          <Heading as="h1" size="hero" accent="Perfection?" tone="terracotta" className="mt-4">
            Seeking
          </Heading>
        </>
      }
    >
      <ul className="list-none space-y-3">
        {["Wholehearted Commitment", "Expert Guidance", "Quality Assurance"].map((t) => (
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
