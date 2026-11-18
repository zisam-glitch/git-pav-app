import { ArrowRight, Crown, Flame, Gem, Layers, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";

const STYLES = [
  {
    id: "classic-gold",
    title: "Gold Grillz: Timeless Luxury",
    subtitle: "10k, 14k & 18k solid gold",
    desc: "Our gold grillz exude classic elegance. Whether you prefer yellow, white, or rose gold, we offer a variety of karat options mirror-polished and custom-cast with zero plating.",
    benefit: "Yellow, white, or rose gold",
    tone: "hims-tile-warm",
    icon: Crown,
  },
  {
    id: "open-face",
    title: "Open Face / Window Cuts",
    subtitle: "Subtle distinction",
    desc: "Frames your natural tooth with a refined metal border, highlighting your natural enamel while delivering clean luxury contrast.",
    benefit: "Shows natural enamel",
    tone: "hims-tile-sage",
    icon: Layers,
  },
  {
    id: "diamond-pave",
    title: "Diamond Grillz: Dazzling Brilliance",
    subtitle: "VVS natural diamonds",
    desc: "Elevate your smile with the ultimate statement of luxury. Our diamonds are meticulously hand-set in honeycomb micro-prongs to maximize sparkle and impact.",
    benefit: "Hand-set natural diamonds",
    tone: "bg-[#F2EDE5]",
    icon: Gem,
  },
  {
    id: "canine-fangs",
    title: "Canine / Vampire Fangs",
    subtitle: "Sharp bespoke accent",
    desc: "Extended, contoured canine caps engineered with exact occlusal clearance so your natural biting and speech remain comfortable and unimpeded.",
    benefit: "Bite-safe design",
    tone: "hims-tile-sage",
    icon: Flame,
  },
  {
    id: "perm-look",
    title: "Deep Perm-Look Cuts",
    subtitle: "Individual tooth definition",
    desc: "Deep interdental grooves cut between adjacent caps, creating the distinct appearance of individually crafted teeth with sleek silver or gold finishes.",
    benefit: "Realistic separation",
    tone: "hims-tile-warm",
    icon: Sparkles,
  },
  {
    id: "textured",
    title: "Silver & Diamond Dust Finishes",
    subtitle: "Sleek, modern shimmer",
    desc: "Opt for the sleek appeal of silver grillz or micro-laser stippled diamond-dust finishes that catch light from every angle without setting stones.",
    benefit: "Understated or high-shimmer",
    tone: "bg-[#F2EDE5]",
    icon: Wand2,
  },
];

export function GrillzStyles() {
  return (
    <section id="styles" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Custom grillz procedures
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Tailored elegance in{" "}
            <span className="text-[#754B3D]">gold, silver &amp; diamond</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Mix and match metals and gems for a truly unique creation. From iced-out designs to
            subtle accents, each piece is custom-made to fit your teeth flawlessly.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STYLES.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={0.04 * i} className="h-full">
                <article
                  className={`${item.tone} flex h-full flex-col justify-between rounded-[1.5rem] border border-black/6 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-10 place-items-center rounded-2xl border border-black/6 bg-white text-[#1B3745]">
                        <Icon className="size-4" />
                      </span>
                      <span className="rounded-full border border-black/6 bg-white px-3 py-1 text-xs font-medium text-black/70">
                        {item.benefit}
                      </span>
                    </div>

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
