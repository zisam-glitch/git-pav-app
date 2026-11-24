import { BookButton, CallButton, Heading, Section, Tile } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

const TREATMENT_FEES = [
  { name: "Tooth Extraction", price: "from £95" },
  { name: "Filling", price: "from £95" },
  { name: "Antibiotics", price: "£25" },
  { name: "Irrigation/cleaning of gums &/or wisdom tooth", price: "£75" },
  { name: "Dry socket", price: "£60" },
  { name: "Accessing & dressing a tooth", price: "from £170" },
  { name: "Surgical drainage of abscess", price: "£160" },
  { name: "Recement bridge/crown/veneer", price: "from £60" },
  { name: "Re-fixing a tooth loosened by trauma", price: "£195" },
] as const;

export function EmergencyPricing() {
  return (
    <Section id="pricing" theme="white" space="default">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="cost?" tone="terracotta" inline>
          How much does it
        </Heading>
        <p className="mt-4 text-lead text-muted">
          Consultation (include exam, X-rays and diagnosis) appointment fee:
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Tile tone="white" lift className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <span className="inline-flex rounded-pill bg-cream px-3 py-1 text-caption font-medium text-terracotta">
              Standard Hours
            </span>
            <p className="mt-4 text-display text-fg tabular-nums">£45</p>
            <p className="mt-3 border-t border-border pt-3 text-body text-muted">
              Monday to Friday between 9am – 5pm
            </p>
          </div>
          <CallButton variant="default" className="w-full sm:w-auto">
            Call us Now · {PRACTICE_PHONE}
          </CallButton>
        </Tile>

        <Tile
          tone="grey"
          lift
          className="flex flex-col justify-between gap-6 border border-border p-6 md:p-8"
        >
          <div>
            <span className="inline-flex rounded-pill bg-white px-3 py-1 text-caption font-medium text-fg">
              Out of Hours
            </span>
            <p className="mt-4 text-display text-fg tabular-nums">£90</p>
            <p className="mt-3 border-t border-border pt-3 text-body text-muted">
              Out of Hours – Weekends 9am – 8pm and Weekdays 5pm – 8pm
            </p>
          </div>
          <BookButton variant="outline" className="w-full sm:w-auto">
            Book Online
          </BookButton>
        </Tile>
      </div>

      <div className="mt-6 space-y-2 text-body text-muted">
        <p className="font-medium text-fg">Contact us for prices and appointments after 8pm</p>
        <p>
          All patients receive an individual treatment plan with clearly illustrated costs prior to
          undergoing emergency dental treatment.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white">
        <ul className="divide-y divide-border">
          {TREATMENT_FEES.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-4 px-5 py-4 t-colors hover:bg-cream/60 md:px-8 md:py-5"
            >
              <span className="text-body font-medium text-fg">{`${item.name} `}</span>
              <span className="shrink-0 text-lead font-medium text-fg tabular-nums">
                {`– ${item.price}`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-sand p-6 md:flex-row md:items-center md:p-8">
        <p className="max-w-xl text-lead text-fg">
          Anyone can book an appointment online with a dentist 24 hours a day, 7 days a week.
        </p>
        <div className="flex flex-wrap gap-3">
          <CallButton variant="default">Call us Now · {PRACTICE_PHONE}</CallButton>
          <BookButton variant="outline">Book Online</BookButton>
        </div>
      </div>
    </Section>
  );
}
