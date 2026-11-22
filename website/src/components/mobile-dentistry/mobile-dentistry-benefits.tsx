import { BookButton, ButtonLink } from "@/components/hims";
import { BenefitCards, type BenefitItem } from "@/components/hims/benefit-cards";
import {
  Building2,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  Users,
  UserPlus,
  Smile,
  Hospital,
} from "lucide-react";

const BENEFITS: readonly BenefitItem[] = [
  { title: "Unique mobile dental service", body: null, icon: Stethoscope },
  { title: "Working with care homes", body: null, icon: Building2 },
  { title: "Make your home oral-health CQC-compliant", body: null, icon: ShieldCheck },
  { title: "NHS partners", body: null, icon: Hospital },
  { title: "The very latest mobile dental equipment", body: null, icon: HeartHandshake },
  { title: "Hundreds of satisfied patients", body: null, icon: Smile },
  { title: "Attract more residents", body: null, icon: UserPlus },
  { title: "Engage carers and improve staff retention", body: null, icon: Users },
];

export function MobileDentistryBenefits() {
  return (
    <BenefitCards
      id="benefits"
      theme="white"
      title="Concerned about your residents'"
      accent="dental needs?"
      lead="We Are The Dentists That Come To You."
      action={
        <>
          <BookButton>Make an Appointment</BookButton>
          <ButtonLink href="#contact" variant="outline">
            Contact us
          </ButtonLink>
        </>
      }
      items={BENEFITS}
      columns={4}
    />
  );
}
