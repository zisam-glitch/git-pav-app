import { Check, PhoneCall, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const PRICE_ITEMS = [
  { item: "Consultation (Mon–Fri, 9am – 5pm)", price: "£45" },
  { item: "Out-of-Hours Consultation (Weekends 9am–8pm & Weekdays 5pm–8pm)", price: "£90" },
  { item: "Tooth Extraction", price: "from £95" },
  { item: "Filling", price: "from £95" },
  { item: "Antibiotics", price: "£25" },
  { item: "Irrigation / cleaning of gums &/or wisdom tooth", price: "£75" },
  { item: "Dry socket treatment", price: "£60" },
  { item: "Accessing & dressing a tooth", price: "from £170" },
  { item: "Surgical drainage of abscess", price: "£160" },
  { item: "Recement bridge / crown / veneer", price: "from £60" },
  { item: "Re-fixing a tooth loosened by trauma", price: "£195" },
];

export function EmergencyPricing() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Clear &amp; transparent
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              How much does it <span className="text-[#754B3D]">cost?</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/65">
              All patients receive an individual treatment plan with clearly illustrated costs prior
              to undergoing emergency dental treatment. Consultation includes exam, X-rays, and
              diagnosis. Contact us for prices and appointments after 8pm.
            </p>

            <div className="hims-tile-warm mt-8 rounded-[1.5rem] border border-black/6 p-6 sm:p-8">
              <ul className="divide-y divide-black/8">
                {PRICE_ITEMS.map((row) => (
                  <li key={row.item} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-black text-white">
                        <Check className="size-3" />
                      </span>
                      <span className="text-sm font-medium text-black/85">{row.item}</span>
                    </div>
                    <span className="font-display text-base text-[#1B3745] whitespace-nowrap sm:text-lg">
                      {row.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <a href={PRACTICE_PHONE_HREF}>
                  <PhoneCall className="size-4" />
                  Call 0800 1938 786
                </a>
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-black/60">
                <ShieldAlert className="size-4 text-[#1B3745]" />
                Upfront written plan before any treatment begins
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5">
            <div className="rounded-[1.5rem] border border-black/6 bg-white p-3 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem]">
                <img
                  src="/media/hims/card-emergency.jpg"
                  alt="Pav Dental Emergency Team on Duty"
                  className="size-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />

                <div className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-[#1B3745] shadow-md">
                  Open 24/7 · Including Bank Holidays
                </div>

                <div className="absolute inset-x-5 bottom-5 rounded-[1.25rem] bg-white/95 p-5 shadow-lg">
                  <p className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                    Same-day emergency triage
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-black/65">
                    Qualified dentist and dental nurse team ready for urgent pain relief,
                    extractions, and trauma care in Bradford.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
