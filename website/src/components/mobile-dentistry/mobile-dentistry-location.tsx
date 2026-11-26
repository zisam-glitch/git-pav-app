import { BookButton, ButtonLink, HUB_CARD, Section } from "@/components/hims";

export function MobileDentistryLocation() {
  return (
    <Section id="location" theme="white" space="sm" aria-labelledby="mobile-location-heading">
      <div className={`${HUB_CARD} grid items-center gap-8 p-4 md:p-6 lg:grid-cols-2 lg:gap-14`}>
        <div className="overflow-hidden rounded-[20px]">
          <img
            src="/images/generated/mobile-dentistry-location.jpg"
            alt="Pav Dental Mobile outreach vehicle serving patients across the UK"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div className="px-3 py-4 md:px-6">
          <h2
            id="mobile-location-heading"
            className="text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            Location
          </h2>
          <p className="mt-5 max-w-lg text-[19px] leading-[1.45] text-[#55565a]">
            Pav Dental Mobile visits patients across the UK. Your Smile with Convenient Dental Care
            Right at Your Doorstep.
          </p>
          <p className="mt-4 text-[15px] leading-[1.5] text-[#6b6b70]">
            786 Leeds Road, Bradford, BD3 9TY · Serving patients and care homes across the UK.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
