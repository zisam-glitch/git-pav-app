import React from "react";
import { ArrowRight, Layers, Gem, Smile, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const PROCEDURES = [
  {
    id: "veneers",
    title: "Porcelain Veneers",
    subtitle: "Flawless smile symmetry & luminosity",
    desc: "Ultra-thin shells of premium medical ceramic permanently bonded to teeth. Ideal for discolouration, gaps, chips, and minor misalignment.",
    duration: "2 Visits",
    longevity: "15–20+ Years",
    icon: Layers,
    accentColor: "#925a27",
    tag: "Most Requested",
    benefits: [
      "Stain-resistant porcelain",
      "Individually hand-shaded",
      "Minimal natural enamel reduction",
    ],
  },
  {
    id: "implants",
    title: "Dental Implants",
    subtitle: "Permanent replacement for missing teeth",
    desc: "Titanium osseointegrated posts topped with precision-milled ceramic crowns that look, feel, and function like healthy natural teeth.",
    duration: "3–6 Months",
    longevity: "Lifetime Durability",
    icon: Gem,
    accentColor: "#cf9448",
    tag: "Permanent Solution",
    benefits: [
      "Preserves jawbone density",
      "Restores 100% bite function",
      "No alteration to adjacent teeth",
    ],
  },
  {
    id: "bonding",
    title: "Composite Bonding",
    subtitle: "Same-day artistic smile contouring",
    desc: "A minimally invasive single-visit procedure where high-grade resin is hand-sculpted onto teeth to close gaps and repair chips without drilling.",
    duration: "1 Single Visit",
    longevity: "5–8 Years",
    icon: Smile,
    accentColor: "#4a7c59",
    tag: "Same Day Result",
    benefits: [
      "Zero enamel removal required",
      "Completely pain-free & reversible",
      "Immediate transformation",
    ],
  },
];

export function CosmeticProcedures() {
  return (
    <section id="procedures" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Popular Cosmetic Dentistry Procedures
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b5848] leading-relaxed">
            Every procedure is personalized to harmonize with your unique facial aesthetics, lip line, and skin tone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROCEDURES.map((proc) => {
            const Icon = proc.icon;
            return (
              <div
                key={proc.id}
                className="rounded-xl   bg-white p-7 shadow-sm flex flex-col justify-between"
              >
                <div>
                

                  <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                    {proc.title}
                  </h3>
                  <p className="text-xs font-bold text-[#925a27]  mt-1 mb-3">
                    {proc.subtitle}
                  </p>

                  <p className="text-sm text-[#6b5848] leading-relaxed mb-6">
                    {proc.desc}
                  </p>

                  <div className="space-y-2 mb-6">
                    {proc.benefits.map((b) => (
                      <div key={b} className="flex items-center gap-2 text-xs font-medium text-[#2a1c12]">
                        <Check className="size-3.5 text-[#925a27] flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4  ">
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#6b5848] mb-5">
                    <div>
                      <span className="block text-[10px] font-bold text-[#6b5848]">Treatment Time</span>
                      <span className="font-bold text-[#2a1c12]">{proc.duration}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-[#6b5848]">Expected Lifespan</span>
                      <span className="font-bold text-[#2a1c12]">{proc.longevity}</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full rounded-full h-11 bg-white hover:bg-[#faf6f0] text-xs font-bold"
                  >
                    <a href={BOOKING_URL} className="flex items-center justify-center gap-2">
                      Book Consultation <ArrowRight className="size-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
