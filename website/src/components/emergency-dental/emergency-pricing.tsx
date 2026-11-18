import { Check, ShieldAlert, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRICE_ITEMS = [
  { item: "Emergency Consultation & Diagnosis", price: "from £50" },
  { item: "Digital Diagnostic X-rays", price: "Included" },
  { item: "Prescription & Antibiotic Dispensing", price: "from £35" },
  { item: "Pain Relief Dressing / Temporary Filling", price: "from £60" },
  { item: "Simple Tooth Extraction (Same Day)", price: "from £75" },
  { item: "Emergency Abscess Drainage", price: "from £90" },
  { item: "Surgical / Broken Tooth Removal", price: "from £195" },
  { item: "Re-cementing Loose Crown or Bridge", price: "from £60" },
  { item: "Emergency Root Canal Extirpation (Nerve Relief)", price: "from £180" },
];

export function EmergencyPricing() {
  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cf9448]/30 bg-[#cf9448]/10 px-4 py-1.5 mb-4">
              <span className="text-xs font-bold uppercase text-[#925a27]">
                Clear &amp; Transparent
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2a1c12]">
              How much does it <span className="accent-text">cost?</span>
            </h2>

            <p className="mt-4 text-[#6b5848] text-base leading-relaxed">
              We believe emergency healthcare should never come with hidden surprises. Before any treatment begins, our dentist conducts a thorough triage examination, explains your options, and gives you an exact upfront price.
            </p>

            <div className="mt-8 rounded-xl border border-[#e2d4c0] bg-[#faf6f0] p-6 sm:p-8 shadow-sm">
              <ul className="divide-y divide-[#e2d4c0]/70">
                {PRICE_ITEMS.map((row) => (
                  <li key={row.item} className="py-3 sm:py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="size-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <Check className="size-3.5 stroke-[2.5]" />
                      </span>
                      <span className="text-sm font-medium text-[#2a1c12]">{row.item}</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#925a27] font-display whitespace-nowrap">
                      {row.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button
                asChild
                className="accent-gradient text-white rounded-full px-7 h-12 font-semibold shadow-md hover:opacity-95"
              >
                <a href="tel:07311871456">
                  <PhoneCall className="mr-2 size-4" />
                  Call For Immediate Pricing Quote
                </a>
              </Button>
              <span className="text-xs text-[#6b5848] flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-emerald-600" />
                NHS Bands 1 &amp; 2 available for eligible patients
              </span>
            </div>
          </div>

          {/* Right column: Image with "Open 24/7" badge */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=85"
                    alt="Pav Dental Emergency Team on Duty"
                    className="size-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  {/* Top Badge */}
                  <div className="absolute top-5 left-5 right-5 text-center">
                    <div className="inline-block rounded-xl bg-white/95 px-6 py-2.5 shadow-xl border border-white">
                      <p className="font-display text-2xl sm:text-3xl font-black text-red-600">
                        Open 24/7
                      </p>
                      <p className="text-[11px] font-bold uppercase text-[#925a27]">
                        All Smiles Welcome
                      </p>
                    </div>
                  </div>

                  {/* Bottom details banner */}
                  <div className="absolute bottom-5 inset-x-5 glass rounded-xl p-4 text-center">
                    <p className="font-display text-lg font-bold text-[#2a1c12]">
                      Dedicated On-Call Surgical Team
                    </p>
                    <p className="text-xs text-[#6b5848] mt-0.5">
                      Fully equipped for extractions, infections, and trauma relief.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating accent badge */}
              <div className="absolute -bottom-5 -right-5 rounded-xl bg-gradient-to-br from-red-600 to-[#925a27] text-white p-4 shadow-xl hidden sm:block">
                <p className="text-xs font-bold uppercase text-white/80">Typical Wait</p>
                <p className="font-display text-2xl font-black">&lt; 30 Mins</p>
                <p className="text-[10px] text-white/80">From arrival to triage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
