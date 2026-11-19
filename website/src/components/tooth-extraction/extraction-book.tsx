import { Check, Clock, MapPin, Phone } from "lucide-react";
import { BookButton, CallButton, Heading, Section, Tile } from "@/components/hims";
import { PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const REASONS = [
  "Experienced and Compassionate Team",
  "State-of-the-Art Facilities",
  "Patient-Centric Approach",
  "Affordable and Transparent Pricing",
];

export function ExtractionBook() {
  return (
    <Section theme="white" space="default">
      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <Heading as="h2" size="h2-md" accent="Today" tone="terracotta">
            Book Your Appointment
          </Heading>
          <p className="mt-4 max-w-xl text-lead text-muted">
            Don&rsquo;t let tooth pain hold you back. Contact PavDental now for a consultation and
            experience swift, professional care that puts your needs first
          </p>

          <ul className="mt-8 space-y-3 text-body">
            <li className="flex items-center gap-3">
              <Phone aria-hidden className="size-5 shrink-0 text-terracotta" />
              <a
                href={PRACTICE_PHONE_HREF}
                className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
              >
                {PRACTICE_PHONE}
              </a>
            </li>
            <li className="flex items-center gap-3 text-fg">
              <MapPin aria-hidden className="size-5 shrink-0 text-terracotta" />
              <span>786 Leeds Road, Bradford, BD3 9TY</span>
            </li>
            <li className="flex items-center gap-3 text-fg">
              <Clock aria-hidden className="size-5 shrink-0 text-terracotta" />
              <span>{PRACTICE_HOURS}</span>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>

        <Tile tone="cream" className="p-6 md:p-8">
          <Heading as="h3" size="h3-md">
            Why Choose PavDental?
          </Heading>
          <ul className="mt-6 divide-y divide-border">
            {REASONS.map((reason) => (
              <li key={reason} className="flex items-center gap-3 py-4 text-lead text-fg">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-terracotta">
                  <Check aria-hidden className="size-4" />
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </Tile>
      </div>
    </Section>
  );
}
