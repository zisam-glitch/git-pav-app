import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const ACRYLIC_DENTURES = [
  { service: "Acrylic Partial Denture (1–3 teeth)", price: "from £350" },
  { service: "Full Upper or Lower Acrylic Denture", price: "from £550" },
  { service: "Complete Set (Upper & Lower Dentures)", price: "from £950" },
];

const PREMIUM_DENTURES = [
  { service: "Flexible Valplast® Metal-Free Partial", price: "from £595" },
  { service: "Cobalt Chrome Cast Metal Precision Denture", price: "from £795" },
  { service: "Implant-Retained Snap-On Overdenture", price: "from £1,800" },
];

const REPAIRS_SERVICES = [
  { service: "Same-Day Emergency Denture Repair / Fracture Fix", price: "from £80" },
  { service: "Denture Soft Reline (Per Arch)", price: "from £120" },
  { service: "Denture Hard Reline (Per Arch)", price: "from £150" },
];

export function DenturesPricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Transparent Denture Price List
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Clear, upfront pricing for all denture solutions. NHS Band 3 (£319.10) options available for eligible patients.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Table 1: Acrylic Dentures */}
          <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2a1c12]">Acrylic Dentures</h3>
                <p className="text-xs text-[#925a27] font-semibold">Standard prosthetics</p>
              </div>
              
            </div>

            <div className="divide-y divide-[#e8ddd0]/70">
              {ACRYLIC_DENTURES.map((row) => (
                <div key={row.service} className="py-3 flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-medium text-[#2a1c12]">{row.service}</span>
                  <span className="text-sm font-bold text-[#925a27] font-display whitespace-nowrap">
                    {row.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Table 2: Premium Dentures */}
          <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2a1c12]">Premium Dentures</h3>
                <p className="text-xs text-[#925a27] font-semibold">Advanced materials & techniques</p>
              </div>
             
            </div>

            <div className="divide-y divide-[#e8ddd0]/70">
              {PREMIUM_DENTURES.map((row) => (
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

        {/* Table 3: Repairs & Relines */}
        <div className="rounded-xl bg-white border border-[#e2d4c0] p-6 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e8ddd0]">
            <div>
              <h3 className="font-display text-xl font-bold text-[#2a1c12]">Repairs &amp; Relines</h3>
              <p className="text-xs text-[#925a27] font-semibold">Same-day laboratory services</p>
            </div>
           
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 divide-[#e8ddd0]/70">
            {REPAIRS_SERVICES.map((row) => (
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
            *All new dentures include adjustment visits and 12-month structural warranty. NHS Band 3 patients: £319.10 contribution required.
          </p>
          <Button
            asChild
            className="accent-gradient rounded-full px-8 h-12 text-white font-bold shadow-sm hover:opacity-95"
          >
            <a href={BOOKING_URL} className="flex items-center gap-2">
              Book Denture Assessment <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
