import { Phone } from "lucide-react";
import { BookButton, ButtonLink, CallButton, Heading, Section, Tile } from "@/components/hims";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const POINTS = [
  "Oral hygiene advisory & assessment",
  "Dental public health insurance",
  "Free online appointment booking",
  "Various cosmetic dentistry services",
  "Special care dentistry services",
  "Oral surgery",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Overview() {
  return (
    <Section id="overview" theme="cream" space="default">
      <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div>
          <Heading as="h2" size="h2-md" accent="Insurance Support" tone="terracotta">
            Comprehensive Dental Services: Book Online, Specialized Care, and
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Providing expert oral surgery, comprehensive dental hygiene assessments, cosmetic
            dentistry, special care services, and public health insurance assistance, our clinic
            ensures top-notch care for all your dental needs. Enjoy the convenience of free online
            appointment booking to easily schedule your visits.
          </p>

          <ul className="mt-8 grid max-w-xl gap-3 text-body sm:grid-cols-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="font-medium text-terracotta">+</span> <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <BookButton>Book Now</BookButton>
            <ButtonLink to="/services" variant="outline">
              Explore all services
            </ButtonLink>
            <img
              src="/media/gdc.png"
              alt="General Dental Council registered practice"
              loading="lazy"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>

        <Tile as="aside" tone="white" className="p-6 md:p-8">
          <Heading as="h3" size="h3-md">
            Working Hours
          </Heading>
          <ul className="mt-5 divide-y divide-border text-body">
            {DAYS.map((day) => (
              <li key={day} className="flex items-center justify-between py-3">
                <span className="text-muted">{day}</span>
                <span className="tabular-nums font-medium">00:00 – 24:00</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div className="flex items-start gap-3">
              <Phone aria-hidden className="mt-1 size-5 shrink-0 text-terracotta" />
              <div>
                <p className="text-small text-muted">For private appointments.</p>
                <a
                  href={PRACTICE_PHONE_HREF}
                  className="text-label text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                >
                  {PRACTICE_PHONE}
                </a>
              </div>
            </div>
            <CallButton size="sm" variant="default">
              Call us Now
            </CallButton>
          </div>
        </Tile>
      </div>
    </Section>
  );
}
