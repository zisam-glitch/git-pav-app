import {
  CalendarCheck,
  ClipboardCheck,
  Crown,
  HeartPulse,
  Scissors,
  ShieldCheck,
} from "lucide-react";
import { BookButton } from "@/components/hims";
import { BenefitCards, type BenefitItem } from "@/components/hims/benefit-cards";

const SERVICES: readonly BenefitItem[] = [
  {
    title: "Dental Crowns and Bridges",
    body: "These are used to restore and replace damaged or missing teeth, improving the function and appearance of your smile.",
    icon: Crown,
  },
  {
    title: "Regular Check-ups",
    body: "Routine dental check-ups are essential for maintaining good oral health. These appointments typically include a dental cleaning, X-rays, and an examination by the dentist.",
    icon: CalendarCheck,
  },
  {
    title: "Dental Fillings",
    body: "Dental fillings are used to restore teeth damaged by decay back to their normal function and shape.",
    icon: ClipboardCheck,
  },
  {
    title: "Tooth Extractions",
    body: "Sometimes a tooth may need to be removed due to decay, disease, or crowding. General dentists can perform simple extractions.",
    icon: Scissors,
  },
  {
    title: "Preventative Care",
    body: "General dentistry aims to prevent oral health problems before they become severe. This includes advice on proper brushing techniques, flossing, and diet.",
    icon: ShieldCheck,
  },
  {
    title: "Gum Disease Treatment",
    body: "Treatment for gum diseases like gingivitis and periodontitis is another crucial aspect of general dentistry.",
    icon: HeartPulse,
  },
];

export function GeneralDentistryServices() {
  return (
    <BenefitCards
      id="services"
      theme="white"
      title="Services Offered in"
      accent="General Dentistry"
      action={<BookButton>Book Appointment</BookButton>}
      items={SERVICES}
      columns={3}
    />
  );
}
