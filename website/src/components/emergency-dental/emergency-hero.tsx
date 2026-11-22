import { Clock, PoundSterling } from "lucide-react";
import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";
import { PRACTICE_PHONE } from "@/lib/enquiry";

export function EmergencyHero() {
  return (
    <TreatmentHero
      label="Emergency Dentist"
      title="Emergency"
      accent="Dentist"
      lead="Covering Bradford 24 Hours 7 days of the week including National and Bank Holidays"
      facts={[
        { icon: PoundSterling, text: "£45 consultation" },
        { icon: Clock, text: "£90* out-of-hours consultation" },
      ]}
      actions={
        <>
          <CallButton variant="default">Call us Now · {PRACTICE_PHONE}</CallButton>
          <BookButton variant="outline">Book Online</BookButton>
        </>
      }
      note={
        <ButtonLink
          href="#pricing"
          variant="ghost"
          className="-ml-6 underline underline-offset-4 hover:text-terracotta"
        >
          How much does it cost?
        </ButtonLink>
      }
      tiles={[
        {
          src: "/images/generated/emergency-dental-hero.jpg",
          alt: "Pav Dental emergency dental clinic in Bradford ready for 24-hour urgent dental care",
          tone: "navy",
        },
      ]}
    />
  );
}
