import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const SINGLE_TOOTH = [
  { service: "Single Tooth Cap (10k Solid Gold)", price: "from £95" },
  { service: "Single Tooth Cap (14k Solid Gold)", price: "from £145" },
  { service: "Single Tooth Cap (18k Solid Gold)", price: "from £195" },
];

const SPECIAL_STYLES = [
  { service: "Open Face / Window Cut Cap", price: "from £120" },
  { service: "Extended Canine / Vampire Fang", price: "from £110" },
  { service: "Diamond Dust / Stippled Finish", price: "from £130" },
];

const DIAMOND_OPTIONS = [
  { service: "Iced-Out VVS Diamond Pave Cap", price: "from £450" },
  { service: "Full 6-Tooth Set (Top or Bottom, 10k)", price: "from £520" },
  { service: "Full 6-Tooth Set (Top or Bottom, 14k)", price: "from £780" },
];

export function GrillzPricing() {
  return (
    <section id="pricing" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Custom grillz{" "}
            <span className="text-[#754B3D]">price list</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Transparent pricing with zero hidden lab charges. All packages include dentist
            appointment, medical impression, custom cast, and protective case.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="hims-tile-warm h-full rounded-[1.5rem] border border-black/6 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
              <div className="border-b border-black/8 pb-4">
                <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                  Single Tooth Caps
                </h3>
                <p className="mt-1 text-xs font-medium text-[#754B3D]">Solid gold options</p>
              </div>
              <div className="divide-y divide-black/8">
                {SINGLE_TOOTH.map((row) => (
                  <div key={row.service} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="text-sm font-medium text-black/85">{row.service}</span>
                    <span className="font-display text-lg text-[#1B3745] whitespace-nowrap">
                      {row.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="h-full">
            <div className="hims-tile-sage h-full rounded-[1.5rem] border border-black/6 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
              <div className="border-b border-black/8 pb-4">
                <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                  Special Styles
                </h3>
                <p className="mt-1 text-xs font-medium text-[#1B3745]">Custom designs</p>
              </div>
              <div className="divide-y divide-black/8">
                {SPECIAL_STYLES.map((row) => (
                  <div key={row.service} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="text-sm font-medium text-black/85">{row.service}</span>
                    <span className="font-display text-lg text-[#1B3745] whitespace-nowrap">
                      {row.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-4 rounded-[1.5rem] border border-black/6 bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
            <div className="border-b border-black/8 pb-4">
              <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                Diamond &amp; Full Sets
              </h3>
              <p className="mt-1 text-xs font-medium text-[#754B3D]">VVS diamonds &amp; 6-tooth sets</p>
            </div>
            <div className="grid gap-x-10 divide-y divide-black/8 sm:grid-cols-2 sm:divide-y-0">
              {DIAMOND_OPTIONS.map((row) => (
                <div
                  key={row.service}
                  className="flex items-center justify-between gap-4 py-3.5 sm:border-b sm:border-black/8"
                >
                  <span className="text-sm font-medium text-black/85">{row.service}</span>
                  <span className="font-display text-lg text-[#754B3D] whitespace-nowrap">
                    {row.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 text-center">
          <p className="mb-6 text-xs text-black/55">
            *All grillz include in-clinic impression, protective storage box, and 1-year craftsmanship
            guarantee.
          </p>
          <Button asChild size="lg">
            <a href={BOOKING_URL}>
              Book Impression Appointment
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
