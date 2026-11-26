import { BookButton, ButtonLink, CallButton, PhotoHero } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

export function EmergencyHero() {
  return (
    <PhotoHero
      label="Emergency Dentist"
      image="/images/generated/emergency-dental-hero.jpg"
      alt="Pav Dental emergency dental clinic in Bradford ready for 24-hour urgent dental care"
      title="Emergency"
      accent="Dentist"
      lead="Covering Bradford 24 Hours 7 days of the week including National and Bank Holidays"
      actions={
        <>
          <CallButton className="bg-white text-black hover:bg-white/85">
            Call us Now · {PRACTICE_PHONE}
          </CallButton>
          <BookButton
            variant="outline"
            className="border-white/50 bg-transparent text-white hover:bg-white hover:text-black"
          >
            Book Online
          </BookButton>
          <ButtonLink href="#pricing" variant="ghost" className="text-white hover:bg-white/15">
            How much does it cost?
          </ButtonLink>
        </>
      }
      note={
        <p className="flex flex-wrap gap-x-8 gap-y-1 text-[15px] text-white/90">
          <span>£45 consultation</span>
          <span>£90* out-of-hours consultation</span>
        </p>
      }
    />
  );
}
