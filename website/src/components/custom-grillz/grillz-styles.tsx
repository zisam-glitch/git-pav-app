import React from "react";
import { ArrowRight, Sparkles, Gem, Layers, Flame, Crown, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STYLES = [
  {
    id: "classic-gold",
    title: "Classic Solid Gold Caps",
    subtitle: "Timeless elegance",
    desc: "Mirror-polished solid gold caps custom-cast to your teeth. Available in 10k, 14k, and 18k yellow, white, and rose gold with zero gold-plating.",
    benefits: "10k, 14k, 18k options",
    icon: Crown,
    accentColor: "#925a27",
    tag: "Timeless Classic",
  },
  {
    id: "open-face",
    title: "Open Face / Window Cuts",
    subtitle: "Subtle distinction",
    desc: "Frames your natural tooth with an immaculate gold , highlighting your natural enamel while delivering bold luxury contrast.",
    benefits: "Shows natural enamel",
    icon: Layers,
    accentColor: "#cf9448",
    tag: "Subtle Distinction",
  },
  {
    id: "diamond-pave",
    title: "Diamond Pave / Fully Iced-Out",
    subtitle: "VVS diamonds",
    desc: "Master jeweler hand-set VVS1/VVS2 natural diamonds in honeycomb micro-prong settings for blinding light reflection and luxury prestige.",
    benefits: "Hand-set natural diamonds",
    icon: Gem,
    accentColor: "#4a7c59",
    tag: "VVS Diamonds",
  },
  {
    id: "canine-fangs",
    title: "Canine / Vampire Fangs",
    subtitle: "Sharp accent",
    desc: "Extended, contoured canine caps engineered with exact occlusal clearance so your natural biting and speech remains completely unimpeded.",
    benefits: "Bite-safe design",
    icon: Flame,
    accentColor: "#5b7fa6",
    tag: "Sharp Accent",
  },
  {
    id: "perm-look",
    title: "Deep Perm-Look Cuts",
    subtitle: "Individual tooth look",
    desc: "Deep interdental grooves cut between adjacent caps, creating the distinct appearance of individually crowned permanent gold teeth.",
    benefits: "Realistic separation",
    icon: Sparkles,
    accentColor: "#8b5a3c",
    tag: "Individual Tooth Look",
  },
  {
    id: "textured",
    title: "Diamond Dust & Textured Finishes",
    subtitle: "High shimmer",
    desc: "Micro-laser stippling, Florentine engraving, and frosted diamond-dust finishes that glitter from every angle without setting stones.",
    benefits: "Light-scattering textures",
    icon: Wand2,
    accentColor: "#6b5848",
    tag: "High Shimmer",
  },
];

export function GrillzStyles() {
  return (
    <section id="styles" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Grillz Styles
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b5848] leading-relaxed">
            Every grill is 100% custom made to order. Whether you want a discreet single gold canine, an open-face window smile, or an iced-out full set, our dental technicians craft your piece to exact specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STYLES.map((item) => {
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
