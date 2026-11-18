import React from "react";
import { ArrowRight, Droplets, Sparkle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const TREATMENTS = [
  {
    id: "fillers",
    title: "Dermal Fillers",
    subtitle: "Precision volume restoration & lip shaping",
    desc: "Premium cross-linked hyaluronic acid gels sculpt, define, and replenish lost facial volume with microscopic precision. Tailored for natural lip enhancement, cheekbone definition, and smoothing smile lines.",
    targetAreas: "Lips, Cheeks, Jawline, Marionette Lines",
    longevity: "9–18 Months",
    icon: Droplets,
    accentColor: "#925a27",
    tag: "Subtle Plumping",
  },
  {
    id: "anti-wrinkle",
    title: "Anti-Wrinkle Injections",
    subtitle: "Targeted smoothing of dynamic expression lines",
    desc: "Doctor-prescribed neuromodulators gently relax underlying hyperactive facial muscles to soften forehead creases, frown lines, and crow's feet while preserving genuine facial expressions.",
    targetAreas: "Forehead, Glabella, Eyes, Masseter (Jaw Slimming)",
    longevity: "3–5 Months",
    icon: Sparkle,
    accentColor: "#cf9448",
    tag: "Expression Preserving",
  },
  {
    id: "skin-boosters",
    title: "Skin Boosters & Profhilo",
    subtitle: "Bio-remodeling & cellular hydration",
    desc: "High-concentration ultra-pure hyaluronic acid (Profhilo) stimulated directly into skin layers to trigger intense elastin synthesis, tightening lax skin and imparting luminous vitality.",
    targetAreas: "Face, Neck, Décolletage, Hands",
    longevity: "6–9 Months",
    icon: Shield,
    accentColor: "#4a7c59",
    tag: "Deep Collagen Boost",
  },
];

export function AestheticsTreatments() {
  return (
    <section id="treatments" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Signature Aesthetics Treatments
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b5848] leading-relaxed">
            Every procedure is customized to honor your natural facial anatomy, ensuring balanced, refined, and never overdone results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TREATMENTS.map((item) => {
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
                      <span className="font-bold text-[#925a27]">Target Areas: </span>
                      <span>{item.targetAreas}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#925a27]">Longevity: </span>
                      <span>{item.longevity}</span>
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
