import { Anchor, ArrowRight, Gem, Layers, Shield, Sparkles, Wrench } from "lucide-react";

const SOLUTIONS = [
  {
    id: "full-acrylic",
    title: "Full Dentures",
    subtitle: "Complete arch restoration",
    desc: "Complete upper or lower prosthetics crafted to restore facial support, confident eating, and natural speech patterns.",
    benefit: "Full facial support & natural speech",
    icon: Layers,
    tone: "bg-white",
  },
  {
    id: "partial",
    title: "Partial Dentures",
    subtitle: "Selective gap replacement",
    desc: "Precision-designed to fill gaps left by one or multiple missing teeth, anchoring securely around your existing natural teeth.",
    benefit: "Anchors securely to natural teeth",
    icon: Shield,
    tone: "hims-tile-warm",
  },
  {
    id: "implant-retained",
    title: "Implant-Supported Dentures",
    subtitle: "Zero-slipping stability",
    desc: "Overdentures secured onto dental implants for a stable fit that eliminates loose movement or messy adhesives.",
    benefit: "Rock-solid retention",
    icon: Anchor,
    tone: "hims-tile-sage",
  },
  {
    id: "valplast",
    title: "Flexible Dentures",
    subtitle: "Metal-free Valplast comfort",
    desc: "Flexible nylon resin that adapts naturally to gum contours with discreet, gum-toned clasps and zero visible metal.",
    benefit: "Lightweight & metal-free",
    icon: Sparkles,
    tone: "hims-tile-warm",
  },
  {
    id: "cobalt-chrome",
    title: "Cobalt Chromium Dentures",
    subtitle: "Ultra-thin cast metal framework",
    desc: "Engineered with a slim cast-alloy framework that leaves more of the palate uncovered for enhanced comfort and taste.",
    benefit: "Slim, durable & hygienic",
    icon: Gem,
    tone: "bg-white",
  },
  {
    id: "repairs",
    title: "Repairs & Relining",
    subtitle: "Fast adjustment & care",
    desc: "Adjustments, relines, and emergency denture repairs to restore a comfortable fit as gums change over time.",
    benefit: "Prompt clinic support",
    icon: Wrench,
    tone: "hims-tile-sage",
  },
] as const;

export function DenturesSolutions() {
  return (
    <section id="solutions" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                Denture options
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Denture solutions{" "}
                <span className="text-[#754B3D]">tailored to you</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Our team of skilled professionals uses modern scanning, design, and fitting
                techniques so every set of dentures prioritizes both comfort and aesthetics.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SOLUTIONS.map((item) => (
                <article
                  key={item.id}
                  className={`${item.tone} flex flex-col justify-between rounded-[1.5rem] border border-black/6 p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)]`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-[#F2EDE5] text-[#1B3745]">
                        <item.icon className="size-5" />
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-medium text-black/70">
                        {item.subtitle}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-black/65">{item.desc}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/8 pt-4 text-xs font-medium text-[#1B3745]">
                    <span>{item.benefit}</span>
                    <a
                      href="#pricing"
                      className="inline-flex items-center gap-1 text-black hover:text-[#754B3D]"
                    >
                      See prices <ArrowRight className="size-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
