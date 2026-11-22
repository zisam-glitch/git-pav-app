import { Building2, Calendar, FileText, MessageCircle } from "lucide-react";
import { BookButton } from "@/components/hims";
import { BenefitCards, type BenefitItem } from "@/components/hims/benefit-cards";

const STEPS: readonly BenefitItem[] = [
  { title: "Book Appointment", body: null, icon: Calendar },
  { title: "Speak With Dentist", body: null, icon: MessageCircle },
  { title: "Generate Prescription", body: null, icon: FileText },
  { title: "Get Your Prescription Filled At Your Pharmacy", body: null, icon: Building2 },
];

export function VirtualDentistryPrescriptionProcess() {
  return (
    <BenefitCards
      id="prescription-process"
      theme="cream"
      title="How Online Prescription"
      accent="Service Works?"
      action={<BookButton>Book Appointment</BookButton>}
      items={STEPS}
      columns={4}
      numbered
    />
  );
}
