import { ArrowRight, Check, Gem, Layers, Scissors, Smile, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const PROCEDURES = [
  {
    id: "veneers",
    title: "Porcelain Veneers",
    subtitle: "Custom-fitted ceramic shells",
    desc: "These are thin shells of porcelain that are custom-fitted to cover the front surface of a tooth, often used to correct uneven teeth, worn enamel, or discoloration.",
    duration: "2 Visits",
    tone: "hims-tile-warm",
    icon: Layers,
    benefits: [
      "Stain-resistant porcelain finish",
      "Custom-shaded to match your smile",
      "Corrects uneven edges & discoloration",
    ],
  },
  {
    id: "bonding",
    title: "Dental Bonding",
    subtitle: "Tooth-colored resin repair",
    desc: "This involves applying a tooth-colored resin to a tooth and hardening it with a special light. It’s a cost-effective way to repair chipped or cracked teeth.",
    duration: "Single Visit",
    tone: "hims-tile-sage",
    icon: Smile,
    benefits: [
      "Cost-effective chip & crack repair",
      "Light-cured tooth-colored resin",
      "Minimal alteration to natural enamel",
    ],
  },
  {
    id: "implants",
    title: "Dental Implants",
    subtitle: "Long-lasting tooth replacement",
    desc: "Used to replace missing teeth, dental implants offer a long-lasting solution that looks and feels natural.",
    duration: "Multi-Stage",
    tone: "bg-[#F2EDE5]",
    icon: Gem,
    benefits: [
      "Natural look and bite feel",
      "Long-lasting replacement option",
      "Supports surrounding arch stability",
    ],
  },
  {
    id: "whitening",
    title: "Teeth Whitening",
    subtitle: "Brighten in one session or at home",
    desc: "One of the most common and cost-effective cosmetic dentistry treatments, teeth whitening can brighten your smile in just one session.",
    duration: "In-Office / Home",
    tone: "hims-tile-sage",
    icon: Sparkles,
    benefits: [
      "Enamel-safe dentist formulations",
      "Strips, home kits & BEAM in-office",
      "Tailored sensitivity support",
    ],
  },
  {
    id: "contouring",
    title: "Tooth Contouring",
    subtitle: "Subtle enamel reshaping",
    desc: "This procedure involves reshaping the tooth by removing some of its enamel to alter its length, shape, or surface.",
    duration: "Single Visit",
    tone: "hims-tile-warm",
    icon: Scissors,
    benefits: [
      "Refines uneven tooth length",
      "Smooths minor surface irregularities",
      "Fast, conservative shaping",
    ],
  },
];

export function CosmeticProcedures() {
  return (
    <section id="procedures" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Procedures
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Popular cosmetic dentistry{" "}
            <span className="text-[#754B3D]">procedures</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Every treatment plan is tailored to improve color, position, shape, size, and overall
            smile harmony.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROCEDURES.map((proc, index) => {
            const Icon = proc.icon;
            return (
              <Reveal key={proc.id} delay={0.04 * index} className="h-full">
                <article
                  className={`${proc.tone} flex h-full flex-col justify-between rounded-[1.5rem] border border-black/6 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-10 place-items-center rounded-2xl bg-white border border-black/6 text-[#1B3745]">
                        <Icon className="size-4" />
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black/70 border border-black/6">
                        {proc.duration}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                      {proc.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#754B3D]">{proc.subtitle}</p>
                    <p className="mt-3 text-sm leading-relaxed text-black/65">{proc.desc}</p>

                    <ul className="mt-5 space-y-2 border-t border-black/8 pt-4">
                      {proc.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2.5 text-xs text-black/80">
                          <span className="grid size-4 shrink-0 place-items-center rounded-full bg-black text-white">
                            <Check className="size-2.5" />
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-2">
                    <Button asChild variant="outline" className="w-full">
                      <a href={BOOKING_URL}>
                        Book Consultation
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
