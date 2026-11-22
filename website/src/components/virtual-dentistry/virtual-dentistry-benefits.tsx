import { Clock, Leaf, ListChecks, Target, Home } from "lucide-react";
import { BookButton, CallButton } from "@/components/hims";
import { BenefitCards, type BenefitItem } from "@/components/hims/benefit-cards";

const BENEFITS: readonly BenefitItem[] = [
  {
    title: "Speed and Convenience",
    body: "With virtual dental consultations, you can access dental care from the comfort of your own home.",
    icon: Home,
  },
  {
    title: "Time Saving",
    body: "You don't have to take time off work or school to visit a dentist in person. Our Platform provides the quickest and simplest method obtaining your dental e-prescription, saving you time and effort",
    icon: Clock,
  },
  {
    title: "Streamlined Prescription Management",
    body: "Keep all your prescriptions organized and easily accessible in one place, enabling efficient tracking and monitoring",
    icon: ListChecks,
  },
  {
    title: "Enhanced Accuracy",
    body: "E-prescriptions significantly reduce the likelihood of errors, ensuring that you receive the precise medication, proper dosage, and accurate instructions",
    icon: Target,
  },
  {
    title: "Eco-friendly",
    body: "Embracing paperless e-prescriptions contributed to a greener planet by minimizing paper waste and promoting eco-conscious practices.",
    icon: Leaf,
  },
];

export function VirtualDentistryBenefits() {
  return (
    <BenefitCards
      theme="white"
      title="Why you should choose"
      accent="PavDental Virtual Dentist?"
      action={
        <>
          <BookButton>Book Appointment</BookButton>
          <CallButton variant="outline" />
        </>
      }
      items={BENEFITS}
      columns={3}
    />
  );
}
