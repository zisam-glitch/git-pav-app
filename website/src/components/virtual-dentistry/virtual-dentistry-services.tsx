import { Clock } from "lucide-react";
import {
  BookButton,
  CallButton,
  Heading,
  Media,
  Section,
  SplitFeature,
  Tile,
} from "@/components/hims";

export function VirtualDentistryServices() {
  return (
    <Section
      id="services"
      theme="sand"
      space="default"
      aria-labelledby="virtual-services-heading"
    >
      <SplitFeature
        media={
          <Media
            src="/images/generated/virtual-dentistry-services.jpg"
            ratio="4 / 3"
            tone="cream"
            alt="24/7 emergency and virtual dental care support"
          />
        }
      >
        <div>
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Round-the-Clock Access
          </span>
          <div id="virtual-services-heading" className="mt-4">
            <Heading as="h2" size="h2-md" accent="of Services" tone="terracotta" inline>
              Choose Type
            </Heading>
          </div>

          <Tile tone="white" lift className="mt-8 border border-border p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-lg bg-cream text-terracotta">
                <Clock aria-hidden className="size-5" />
              </span>
              <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3 py-0.5 text-caption font-medium text-copper">
                £35 Consultation · £25 Prescription
              </span>
            </div>
            <h3 className="mt-5 text-h4 text-fg">24 x 7 Emergency Dentists</h3>
            <p className="mt-2 text-body leading-relaxed text-muted">
              Round the clock we help people to connect with Dentists
            </p>
          </Tile>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Appointment</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
