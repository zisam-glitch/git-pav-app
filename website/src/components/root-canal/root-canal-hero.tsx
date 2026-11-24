import { BookButton, ButtonLink, CallButton, ServiceHeroLayout } from "@/components/hims";

export function RootCanalHero() {
  return (
    <ServiceHeroLayout
      label="Pav Dental Advanced Root Canal Care"
      images={[
        {
          src: "/images/generated/root-canal-hero.jpg",
          alt: "Warm sunlit Pav Dental treatment room prepared for root canal care",
        },
        { src: "/images/generated/root-canal-how.jpg", alt: "" },
        { src: "/images/generated/home-checkup.jpg", alt: "" },
        { src: "/images/generated/home-general-dentistry.jpg", alt: "" },
      ]}
      head={
        <>
          <h1 className="text-hero">
            <span className="text-[#8b8d92]">Pav Dental</span>
            <span className="block text-[#2a2a2c]">Advanced Root Canal Care</span>
          </h1>
          <p className="mt-6 max-w-xl text-lead text-muted">
            Explore our transparent root canal pricing for basic, intermediate, and advanced
            treatments, along with essential information to help you make an informed decision about
            your dental care.
          </p>
        </>
      }
    >
      <ul className="list-none space-y-4">
        {[
          "Basic, intermediate & advanced tiers: £195 – £395",
          "Most root canals take 45–90 minutes",
          "Local anaesthesia for comfort",
        ].map((t) => (
          <li key={t} className="flex items-center gap-3 text-[17px] text-[#2a2a2c]">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#8a4242] text-white">
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
      <div className="mt-8 flex flex-wrap gap-3">
        <BookButton>Make an Appointment</BookButton>
        <ButtonLink to="/contact-us" variant="outline">
          Contact us
        </ButtonLink>
        <CallButton variant="ghost" />
      </div>
      <div className="t-hero-links mt-7 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
        <a href="#pricing" className="underline underline-offset-4 t-colors hover:text-terracotta">
          Our Root Canal Prices (£195 – £395)
        </a>
        <a href="#consent" className="underline underline-offset-4 t-colors hover:text-terracotta">
          Informed Consent for Root Canal Treatment
        </a>
      </div>
    </ServiceHeroLayout>
  );
}
