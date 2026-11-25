import { BookButton, ButtonLink, CallButton, HUB_CARD, Section } from "@/components/hims";

export function MobileDentistryService() {
  return (
    <Section id="service" theme="white" space="sm" aria-labelledby="mobile-service-heading">
      <div className={`${HUB_CARD} grid items-center gap-8 p-4 md:p-6 lg:grid-cols-2 lg:gap-14`}>
        <div className="px-3 py-4 md:px-6">
          <h2
            id="mobile-service-heading"
            className="text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            We Come <span className="text-[#8a4242]">to You</span>
          </h2>
          <p className="mt-5 max-w-lg text-[19px] leading-[1.45] text-[#55565a]">
            We have a modern, well-equipped mobile surgery that allows us to visit you in the
            comfort of your own home.
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-[1.5] text-[#6b6b70]">
            Full range of dental services delivered directly to residential homes and care
            facilities with our latest mobile dental equipment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Contact us
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
        </div>
        <div className="overflow-hidden rounded-[20px]">
          <img
            src="/images/generated/mobile-dentistry-service.jpg"
            alt="Modern well-equipped Pav Dental mobile surgery prepared for a home visit"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </div>
    </Section>
  );
}
