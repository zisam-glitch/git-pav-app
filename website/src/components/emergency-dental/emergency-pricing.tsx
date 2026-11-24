import { BookButton, CallButton, SectionHead } from "@/components/hims";
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
    <section aria-labelledby="emergency-fees-heading" className="bg-white pb-16 md:pb-24">
      <div className="mx-auto w-full max-w-[1392px] px-4">
        <SectionHead
          id="emergency-fees-heading"
          title="Consultation (include exam, X-rays and diagnosis) appointment fee:"
          action={<BookButton variant="default">Book Online</BookButton>}
        >
          Contact us for prices and appointments after 8pm
        </SectionHead>

        <ul className="mt-10 grid list-none gap-x-12 md:grid-cols-2">
          {TREATMENT_FEES.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-4 border-b border-border py-5"
            >
              <span className="text-body font-medium text-fg">{`${item.name} `}</span>
              <span className="shrink-0 text-lead font-medium text-fg tabular-nums">
                {`– ${item.price}`}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-2xl text-body text-muted">
          All patients receive an individual treatment plan with clearly illustrated costs prior to
          undergoing emergency dental treatment.
        </p>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[24px] bg-[#f6efe4] p-7 md:flex-row md:items-center md:p-10">
          <p className="max-w-xl text-[clamp(22px,2.2vw,28px)] leading-[1.2] text-fg">
            Anyone can book an appointment online with a dentist 24 hours a day, 7 days a week.
          </p>
          <div className="flex flex-wrap gap-3">
            <CallButton variant="default">Call us Now · {PRACTICE_PHONE}</CallButton>
            <BookButton variant="outline">Book Online</BookButton>
          </div>
        </div>
      </div>
    </section>
  );
}
