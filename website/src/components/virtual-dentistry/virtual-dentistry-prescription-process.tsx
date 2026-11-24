import { Building2, Calendar, FileText, MessageCircle } from "lucide-react";
import { BookButton, ButtonLink, CardRail, Section, SectionHead } from "@/components/hims";

const STEPS = [
  { icon: Calendar, title: "Book Appointment" },
  { icon: MessageCircle, title: "Speak With Dentist" },
  { icon: FileText, title: "Generate Prescription" },
  { icon: Building2, title: "Get Your Prescription Filled At Your Pharmacy" },
] as const;

export function VirtualDentistryPrescriptionProcess() {
  return (
    <Section id="prescription-process" theme="white" aria-labelledby="virtual-prescription-heading">
      <SectionHead
        id="virtual-prescription-heading"
        title="How Online Prescription Service Works?"
        accent=""
        action={<BookButton>Book Appointment</BookButton>}
      />
      <div className="mt-10">
        <CardRail
          tone="beige"
          label="How Online Prescription Service Works?"
          items={STEPS.map((step, i) => {
            const Icon = step.icon;
            return {
              label: `Step ${i + 1}`,
              title: step.title,
              text: "",
              action: (
                <div className="flex items-center justify-between gap-3">
                  <ButtonLink href="#how-it-works" variant="outline" size="sm">
                    View details
                  </ButtonLink>
                  <Icon aria-hidden className="size-6 text-[#8a4242]" strokeWidth={1.5} />
                </div>
              ),
            };
          })}
        />
      </div>
    </Section>
  );
}
