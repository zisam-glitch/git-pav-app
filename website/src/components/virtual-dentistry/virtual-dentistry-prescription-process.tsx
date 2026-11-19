import { Building2, Calendar, FileText, MessageCircle } from "lucide-react";
import { Heading, Section, Tile } from "@/components/hims";

const STEPS = [
  { icon: Calendar, title: "Book Appointment" },
  { icon: MessageCircle, title: "Speak With Dentist" },
  { icon: FileText, title: "Generate Prescription" },
  { icon: Building2, title: "Get Your Prescription Filled At Your Pharmacy" },
] as const;

export function VirtualDentistryPrescriptionProcess() {
  return (
    <Section theme="cream" space="default">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="Service Works?" tone="terracotta" inline>
          How Online Prescription
        </Heading>
      </div>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <Tile
              key={step.title}
              as="li"
              tone="white"
              lift
              className="flex flex-col justify-between gap-6 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-lg bg-cream text-terracotta">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-caption font-medium text-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-h4 text-fg">{step.title}</h3>
            </Tile>
          );
        })}
      </ol>
    </Section>
  );
}
