import { Building2, Calendar, FileText, MessageCircle } from "lucide-react";
import { BookButton, Heading, Section, Tile } from "@/components/hims";

const STEPS = [
  { icon: Calendar, title: "Book Appointment" },
  { icon: MessageCircle, title: "Speak With Dentist" },
  { icon: FileText, title: "Generate Prescription" },
  { icon: Building2, title: "Get Your Prescription Filled At Your Pharmacy" },
] as const;

export function VirtualDentistryPrescriptionProcess() {
  return (
    <Section
      id="prescription-process"
      theme="white"
      space="default"
      aria-labelledby="virtual-prescription-heading"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            4-Step E-Prescription Pathway
          </span>
          <div id="virtual-prescription-heading" className="mt-4">
            <Heading as="h2" size="h2-md" accent="Service Works?" tone="terracotta" inline>
              How Online Prescription
            </Heading>
          </div>
        </div>

        <BookButton size="sm">Book Appointment</BookButton>
      </div>

      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <Tile
              key={step.title}
              as="li"
              tone="white"
              lift
              className="flex flex-col justify-between gap-6 border border-border p-6 md:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-lg bg-cream text-terracotta">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="inline-flex items-center rounded-pill bg-cream px-3 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="border-t border-border pt-4 text-h4 text-fg">{step.title}</h3>
            </Tile>
          );
        })}
      </ol>
    </Section>
  );
}
