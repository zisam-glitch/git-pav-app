import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const ANTI_WRINKLE = [
  { service: "1 Area (e.g. Frown Lines or Crow's Feet)", price: "£130" },
  { service: "2 Areas (e.g. Forehead & Glabella)", price: "£180" },
  { service: "3 Areas (Full Upper Face Refresh)", price: "£220" },
  { service: "Masseter Slimming / Bruxism (Teeth Grinding)", price: "£250" },
  { service: "Nefertiti Neck & Jawline Lift", price: "£280" },
  { service: "Hyperhidrosis (Excessive Sweating)", price: "£350" },
];

const DERMAL_FILLERS = [
  { service: "Subtle Lip Enhancement (0.5ml Juvéderm)", price: "£140" },
  { service: "Full Contour Lip Definition (1.0ml)", price: "£210" },
  { service: "Cheekbone Contouring & Lift", price: "£250" },
  { service: "Tear Trough (Under-Eye Hollows)", price: "£290" },
  { service: "Nasolabial Smile Lines / Marionette", price: "£220" },
  { service: "Jawline & Chin Sculpting (per ml)", price: "£240" },
];

const SKIN_REJUVENATION = [
  { service: "Profhilo® Bio-Remodeling (Face or Neck)", price: "£250" },
  { service: "Polynucleotides (Plenhyage / Ameela)", price: "£200" },
  { service: "Seventy Hyal 2000 Skin Booster", price: "£160" },
  { service: "Medical-Grade Microneedling & Serum", price: "£95" },
];

export function AestheticsPricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Transparent Aesthetics Price List
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Premium FDA-approved products administered exclusively by certified dental clinicians. No hidden clinic facility fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Table 1: Anti-Wrinkle */}
          <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2a1c12]">Anti-Wrinkle Injections</h3>
                <p className="text-xs text-[#925a27] font-semibold">Botox® / Bocouture®</p>
              </div>
              
            </div>

            <div className="divide-y divide-[#e8ddd0]/70">
              {ANTI_WRINKLE.map((row) => (
                <div key={row.service} className="py-3 flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-medium text-[#2a1c12]">{row.service}</span>
                  <span className="text-sm font-bold text-[#925a27] font-display whitespace-nowrap">
                    {row.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Table 2: Dermal Fillers */}
          <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2a1c12]">Dermal Fillers</h3>
                <p className="text-xs text-[#925a27] font-semibold">Juvéderm® / Teosyal®</p>
              </div>
             
            </div>

            <div className="divide-y divide-[#e8ddd0]/70">
              {DERMAL_FILLERS.map((row) => (
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

        {/* Table 3: Skin Boosters */}
        <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
            <div>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">Skin Boosters &amp; Bio-Remodeling</h3>
              <p className="text-xs text-[#925a27] font-semibold">Profhilo®, Polynucleotides &amp; Deep Hydration</p>
            </div>
           
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 divide-[#e8ddd0]/70">
            {SKIN_REJUVENATION.map((row) => (
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
            *Consultation fee of £30 is fully redeemable against treatment. All procedures performed by GDC-registered dental clinicians.
          </p>
          <Button
            asChild
            className="accent-gradient rounded-full px-8 h-12 text-white font-bold shadow-sm hover:opacity-95"
          >
            <a href={BOOKING_URL} className="flex items-center gap-2">
              Book Your Aesthetics Assessment <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
