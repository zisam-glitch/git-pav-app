import { ArrowRight, Droplets, Layers, Shield, Smile, Sparkle, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";

const TREATMENTS = [
  {
    id: "microneedling",
    title: "Microneedling",
    subtitle: "Skin health & texture",
    desc: "We offer microneedling as a safe and effective treatment to help improve the overall health and appearance of your skin.",
    tone: "hims-tile-warm",
    icon: Sparkle,
  },
  {
    id: "botox",
    title: "Botox",
    subtitle: "Wrinkle & fine line smoothing",
    desc: "Botox is a non-surgical treatment that smooths out wrinkles and fine lines, giving you a more youthful appearance.",
    tone: "hims-tile-sage",
    icon: Shield,
  },
  {
    id: "dermal-fillers",
    title: "Dermal Fillers",
    subtitle: "Volume & facial balance",
    desc: "Dermal fillers are used to add volume and fullness to areas of the face that have lost volume due to aging or other factors.",
    tone: "bg-[#F2EDE5]",
    icon: Droplets,
  },
  {
    id: "chemical-peels",
    title: "Chemical Peels",
    subtitle: "Cellular skin renewal",
    desc: "Chemical peels are an effective way to rejuvenate the skin by removing dead skin cells and promoting the growth of new, healthy skin.",
    tone: "hims-tile-sage",
    icon: Layers,
  },
  {
    id: "lip-enhancement",
    title: "Lip Enhancement",
    subtitle: "Volume & definition",
    desc: "Our lip enhancement treatments are designed to add volume and definition to your lips, giving you a fuller and more youthful appearance.",
    tone: "hims-tile-warm",
    icon: Smile,
  },
  {
    id: "skin-rejuvenation",
    title: "Skin Rejuvenation",
    subtitle: "Restorative skin therapies",
    desc: "Our skin rejuvenation treatments are designed to reduce the appearance of fine lines, wrinkles, and other signs of aging.",
    tone: "bg-[#F2EDE5]",
    icon: Sun,
  },
];

export function AestheticsTreatments() {
  return (
    <section id="treatments" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Aesthetics treatments
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Subtle enhancements,{" "}
            <span className="text-[#754B3D]">clinically delivered</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Every procedure is tailored to your natural facial anatomy for balanced, refreshed
            results.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TREATMENTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={0.04 * index} className="h-full">
                <article
                  className={`${item.tone} flex h-full flex-col justify-between rounded-[1.5rem] border border-black/6 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}
                >
                  <div>
                    <span className="grid size-10 place-items-center rounded-2xl border border-black/6 bg-white text-[#1B3745]">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="mt-5 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#754B3D]">{item.subtitle}</p>
                    <p className="mt-3 text-sm leading-relaxed text-black/65">{item.desc}</p>
                  </div>

                  <div className="mt-6 pt-2">
                    <Button asChild variant="outline" className="w-full">
                      <a href="#pricing">
                        View Pricing
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
