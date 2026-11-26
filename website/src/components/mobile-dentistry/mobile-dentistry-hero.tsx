import { BookButton, ButtonLink, PhotoHero } from "@/components/hims";

export function MobileDentistryHero() {
  return (
    <PhotoHero
      label="Mobile dental care"
      image="/images/generated/mobile-dentistry-hero.jpg"
      alt="Pav Dental mobile dentistry equipment in warm natural light"
      title="Mobile dental care"
      accent="at Doorstep"
      lead="Experience Convenient Mobile Dental Care with Comprehensive Dentistry Delivered to Your Doorstep :"
      actions={
        <>
          <BookButton className="bg-white text-black hover:bg-white/85">
            Make an Appointment
          </BookButton>
          <ButtonLink
            href="#contact"
            variant="outline"
            className="border-white/50 bg-transparent text-white hover:bg-white hover:text-black"
          >
            Contact us
          </ButtonLink>
        </>
      }
      note={
        <>
          <p className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[13px] font-medium text-white">
            Coming Soon
          </p>
          <p>
            Pav Dental Mobile is a unique dental service that enables our patients to access a full
            range of dental services from the comfort of their own home. With many combined years of
            dental experience in both traditional and mobile dentistry along with the latest
            technology and equipment we guarantee our patients the upmost satisfactory service.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[14px]">
            <a href="#benefits" className="underline underline-offset-4">
              Care Home &amp; Resident Benefits
            </a>
            <a href="#location" className="underline underline-offset-4">
              UK-Wide Location Coverage
            </a>
          </p>
        </>
      }
    />
  );
}
