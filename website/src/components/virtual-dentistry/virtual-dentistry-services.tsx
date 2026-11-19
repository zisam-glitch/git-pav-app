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
    <Section id="services" theme="white" space="default">
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
          <Heading as="h2" size="h2-md" accent="of Services" tone="terracotta" inline>
            Choose Type
          </Heading>

          <Tile tone="cream" className="mt-8 p-6 md:p-8">
            <span className="grid size-11 place-items-center rounded-lg bg-white text-terracotta">
              <Clock aria-hidden className="size-5" />
            </span>
            <h3 className="mt-4 text-h4 text-fg">24 x 7 Emergency Dentists</h3>
            <p className="mt-2 text-body text-muted">
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
