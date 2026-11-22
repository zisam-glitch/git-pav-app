import { BookButton, CallButton, Section, Tile } from "@/components/hims";
import { PriceList, type PriceRow } from "@/components/hims/price-list";
import { SectionHeader } from "@/components/hims/section-header";
import { PRACTICE_PHONE } from "@/lib/enquiry";

/** The live page writes "Tooth Extraction – from £95": the dash stays in the text for crawlers and readers. */
function Dash({ children }: { children: string }) {
  return (
    <>
      <span className="sr-only">– </span>
      {children}
    </>
  );
}

const TREATMENT_FEES: readonly PriceRow[] = [
  { label: "Tooth Extraction ", price: <Dash>from £95</Dash> },
  { label: "Filling ", price: <Dash>from £95</Dash> },
  { label: "Antibiotics ", price: <Dash>£25</Dash> },
  { label: "Irrigation/cleaning of gums &/or wisdom tooth ", price: <Dash>£75</Dash> },
  { label: "Dry socket ", price: <Dash>£60</Dash> },
  { label: "Accessing & dressing a tooth ", price: <Dash>from £170</Dash> },
  { label: "Surgical drainage of abscess ", price: <Dash>£160</Dash> },
  { label: "Recement bridge/crown/veneer ", price: <Dash>from £60</Dash> },
  { label: "Re-fixing a tooth loosened by trauma ", price: <Dash>£195</Dash> },
];

export function EmergencyPricing() {
  return (
    <Section id="pricing" theme="cream">
      <SectionHeader
        title="How much does it"
        accent="cost?"
        lead="Consultation (include exam, X-rays and diagnosis) appointment fee:"
        action={<CallButton variant="default">Call us Now · {PRACTICE_PHONE}</CallButton>}
      />

      <div className="mt-10 grid gap-2 md:mt-14 md:grid-cols-2 md:gap-4">
        <Tile tone="white" className="p-6 md:p-10">
          <p className="text-display text-fg tabular-nums">£45</p>
          <p className="mt-4 text-lead text-muted">Monday to Friday between 9am – 5pm</p>
        </Tile>
        <Tile tone="sage" className="p-6 md:p-10">
          <p className="text-display text-fg tabular-nums">£90</p>
          <p className="mt-4 text-lead text-muted">
            Out of Hours – Weekends 9am – 8pm and Weekdays 5pm – 8pm
          </p>
        </Tile>
      </div>

      <div className="mt-8 space-y-2 text-body text-muted">
        <p className="font-medium text-fg">Contact us for prices and appointments after 8pm</p>
        <p>
          All patients receive an individual treatment plan with clearly illustrated costs prior to
          undergoing emergency dental treatment.
        </p>
      </div>

      <div className="mt-8 rounded-xl bg-white p-4 md:p-10">
        <PriceList rows={TREATMENT_FEES} />
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-xl text-lead text-fg">
          Anyone can book an appointment online with a dentist 24 hours a day, 7 days a week.
        </p>
        <BookButton variant="outline">Book Online</BookButton>
      </div>
    </Section>
  );
}
