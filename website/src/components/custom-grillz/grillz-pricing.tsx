import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Custom Grillz Price List
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Transparent pricing with zero hidden lab charges. All packages include dentist appointment, medical impression, custom cast, and protective case.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Table 1: Single Tooth */}
          <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2a1c12]">Single Tooth Caps</h3>
                <p className="text-xs text-[#925a27] font-semibold">Solid gold options</p>
              </div>
              
            </div>

            <div className="divide-y divide-[#e8ddd0]/70">
              {SINGLE_TOOTH.map((row) => (
                <div key={row.service} className="py-3 flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-medium text-[#2a1c12]">{row.service}</span>
                  <span className="text-sm font-bold text-[#925a27] font-display whitespace-nowrap">
                    {row.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Table 2: Special Styles */}
          <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2a1c12]">Special Styles</h3>
                <p className="text-xs text-[#925a27] font-semibold">Custom designs</p>
              </div>
             
            </div>

            <div className="divide-y divide-[#e8ddd0]/70">
              {SPECIAL_STYLES.map((row) => (
                <div key={row.service} className="py-3 flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-medium text-[#2a1c12]">{row.service}</span>
                  <span className="text-sm font-bold text-[#925a27] font-display whitespace-nowrap">
                    {row.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table 3: Diamond Options */}
        <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
            <div>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">Diamond & Full Sets</h3>
              <p className="text-xs text-[#925a27] font-semibold">Premium options</p>
            </div>
           
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 divide-[#e8ddd0]/70">
            {DIAMOND_OPTIONS.map((row) => (
              <div key={row.service} className="py-3 flex items-center justify-between gap-4 border-b border-[#e8ddd0]/50">
                <span className="text-xs sm:text-sm font-medium text-[#2a1c12]">{row.service}</span>
                <span className="text-sm font-bold text-[#925a27] font-display whitespace-nowrap">
                  {row.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-[#6b5848] mb-6">
            *All grillz include free in-clinic impression, luxury storage box, and tight snap-fit guarantee. UK Assay certified gold.
          </p>
          <Button
            asChild
            className="accent-gradient rounded-full px-8 h-12 text-white font-bold shadow-sm hover:opacity-95"
          >
            <a href={BOOKING_URL} className="flex items-center gap-2">
              Book Impression Appointment <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
