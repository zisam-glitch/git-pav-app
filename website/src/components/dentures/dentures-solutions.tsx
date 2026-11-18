import React from "react";
import { ArrowRight, Layers, Shield, Gem, Anchor, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOLUTIONS = [
  {
    id: "full-acrylic",
    title: "Full Acrylic Dentures",
    subtitle: "Complete arch restoration",
    desc: "Complete upper or lower prosthetics crafted from high-impact polymethyl methacrylate, restoring full facial support and natural speech patterns.",
    benefits: "Full facial support, natural speech",
    icon: Layers,
    accentColor: "#925a27",
    tag: "Complete Arch",
  },
  {
    id: "partial",
    title: "Partial Dentures",
    subtitle: "Selective gap replacement",
    desc: "Precision-designed to fill gaps left by one or multiple missing teeth, anchoring securely around your existing natural dentition for stability.",
    benefits: "Anchors to natural teeth",
    icon: Shield,
    accentColor: "#cf9448",
    tag: "Selective Replacement",
  },
  {
    id: "cobalt-chrome",
    title: "Cobalt Chrome Dentures",
    subtitle: "Ultra-thin metal framework",
    desc: "Engineered with an ultra-thin, medical-grade cast alloy framework that leaves the palate uncovered for enhanced taste and temperature sensation.",
    benefits: "Enhanced taste sensation",
    icon: Gem,
    accentColor: "#4a7c59",
    tag: "Ultra-Thin & Strong",
  },
  {
    id: "implant-retained",
    title: "Implant-Retained Dentures",
    subtitle: "Zero-slipping stability",
    desc: "Overdentures that snap securely onto dental implants (Locator or bar-supported), completely eliminating loose slipping or messy adhesives.",
    benefits: "No adhesives needed",
    icon: Anchor,
    accentColor: "#5b7fa6",
    tag: "Zero Slipping",
  },
  {
    id: "valplast",
    title: "Flexible Valplast® Dentures",
    subtitle: "Metal-free invisible clasps",
    desc: "Unbreakable nylon resin that flexes with oral movement, featuring invisible gum-toned clasps with zero metal visible for a natural look.",
    benefits: "Completely metal-free",
    icon: Wrench,
    accentColor: "#8b5a3c",
    tag: "Metal-Free",
  },
  {
    id: "repairs",
    title: "Same-Day Repairs & Relining",
    subtitle: "Fast laboratory turnaround",
    desc: "Cracked acrylic bases repaired, teeth added to existing dentures, and laboratory soft relines performed within hours at our on-site lab.",
    benefits: "On-site laboratory",
    icon: Wrench,
    accentColor: "#6b5848",
    tag: "Fast Turnaround",
  },
];

export function DenturesSolutions() {
  return (
    <section id="solutions" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Denture Solutions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b5848] leading-relaxed">
            Every mouth has unique ridge contours and gum tissue. Our clinical dental technicians fabricate bespoke prosthetics using multi-stage impressions for optimal retention and lifelike appearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="rounded-xl   bg-white p-7 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold text-[#925a27]  mt-1 mb-3">
                    {item.subtitle}
                  </p>

                  <p className="text-sm text-[#6b5848] leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-[#2a1c12]">
                    <div>
                      <span className="font-bold text-[#925a27]">Key Benefit: </span>
                      <span>{item.benefits}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4  ">
                  <Button
                    asChild
                    className="w-full rounded-full h-11 bg-white hover:bg-[#faf6f0] text-xs font-bold"
                  >
                    <a href="#pricing" className="flex items-center justify-center gap-2">
                      View Pricing <ArrowRight className="size-3.5" />
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
