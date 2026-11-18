import {
  Activity,
  AlertOctagon,
  Droplets,
  Flame,
  HelpCircle,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/home/reveal";
import { PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const EMERGENCY_CONDITIONS = [
  {
    id: "toothache",
    title: "Toothache",
    desc: "Constant or throbbing tooth pain that prevents sleeping, eating, or daily focus.",
    icon: Zap,
    tag: "Immediate Relief",
    tone: "hims-tile-warm",
  },
  {
    id: "sensitivity",
    title: "Sensitivity",
    desc: "Acute sensitivity to hot, cold, or pressure pointing to deep decay or exposed dentin.",
    icon: Activity,
    tag: "Same-Day Check",
    tone: "hims-tile-sage",
  },
  {
    id: "broken-filling",
    title: "Broken Filling / Tooth",
    desc: "Fractured teeth or damaged fillings leaving sharp edges or exposed sensitive structure.",
    icon: Sparkles,
    tag: "Urgent Repair",
    tone: "bg-white",
  },
  {
    id: "swelling",
    title: "Swelling / Abscess",
    desc: "Gum boils, localised infection, or cheek swelling requiring assessment, antibiotics, or drainage.",
    icon: Flame,
    tag: "Infection Care",
    tone: "hims-tile-warm",
  },
  {
    id: "denture",
    title: "Denture Adjustment",
    desc: "Painful rubbing, fractured acrylic, or sudden loss of denture fit needing urgent adjustment.",
    icon: AlertOctagon,
    tag: "Repair & Relief",
    tone: "bg-white",
  },
  {
    id: "recement",
    title: "Re-cement Crowns",
    desc: "Dislodged crowns, bridges, or veneers that need prompt cleaning and re-cementing.",
    icon: Shield,
    tag: "From £60",
    tone: "hims-tile-sage",
  },
  {
    id: "trauma",
    title: "Dental Trauma",
    desc: "Knocked-out or loosened teeth from accidents or sport — call immediately for guidance.",
    icon: Droplets,
    tag: "Time Critical",
    tone: "hims-tile-warm",
  },
  {
    id: "painful-gums",
    title: "Painful Gums",
    desc: "Acute gum inflammation, pericoronitis around wisdom teeth, or dry socket pain.",
    icon: HelpCircle,
    tag: "Irrigation & Care",
    tone: "hims-tile-sage",
  },
];

export function EmergencyServices() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Urgent triage
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Our emergency dentist can help{" "}
                <span className="text-[#754B3D]">with the following</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Whether it is a chipped tooth, a loose filling, or severe toothache, we aim to
                relieve pain and get you back to normal quickly.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EMERGENCY_CONDITIONS.map((cond, i) => {
                const Icon = cond.icon;
                return (
                  <Reveal key={cond.id} delay={0.03 * i} className="h-full">
                    <article
                      className={`${cond.tone} flex h-full flex-col justify-between rounded-[1.5rem] border border-black/6 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="grid size-10 place-items-center rounded-2xl border border-black/6 bg-white text-[#1B3745]">
                            <Icon className="size-4" />
                          </span>
                          <span className="rounded-full bg-[#1B3745] px-2.5 py-0.5 text-[11px] font-medium text-white">
                            {cond.tag}
                          </span>
                        </div>

                        <h3 className="mt-5 font-display text-xl font-normal tracking-[-0.02em] text-black">
                          {cond.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-black/65">{cond.desc}</p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-black/8 pt-4 text-xs">
                        <span className="text-black/55">Emergency slot</span>
                        <a
                          href={PRACTICE_PHONE_HREF}
                          className="font-medium text-[#1B3745] hover:underline"
                        >
                          Call 0800 1938 786 &rarr;
                        </a>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
