import {
  Activity,
  AlertOctagon,
  Sparkles,
  Shield,
  Zap,
  Droplets,
  Flame,
  HelpCircle,
} from "lucide-react";

const EMERGENCY_CONDITIONS = [
  {
    id: "toothache",
    title: "Severe Toothache",
    desc: "Unbearable, throbbing, or sharp pain that prevents sleeping, eating, or concentrating.",
    icon: Zap,
    color: "#d9383a",
    tag: "Immediate Relief",
  },
  {
    id: "swelling",
    title: "Facial Swelling",
    desc: "Visible swelling of the cheek, jawline, or neck requiring urgent antibiotic and drainage care.",
    icon: Flame,
    color: "#cf711f",
    tag: "Urgent",
  },
  {
    id: "broken-tooth",
    title: "Broken / Chipped Tooth",
    desc: "Fractured teeth with sharp exposed edges, causing cuts to tongue or exposing sensitive nerves.",
    icon: Sparkles,
    color: "#925a27",
    tag: "Same-day repair",
  },
  {
    id: "lost-filling",
    title: "Lost Filling or Crown",
    desc: "Dislodged crowns, inlays or large fillings leaving exposed sensitive dentin to food and cold air.",
    icon: Shield,
    color: "#5b7fa6",
    tag: "Re-cementing",
  },
  {
    id: "abscess",
    title: "Dental Abscess",
    desc: "Pus-filled gum boil, bad taste, and localized infection that can spread rapidly if untreated.",
    icon: AlertOctagon,
    color: "#c0392b",
    tag: "Infection Care",
  },
  {
    id: "bleeding",
    title: "Bleeding Gums",
    desc: "Uncontrolled bleeding after trauma or extraction that won't stop with gentle biting pressure.",
    icon: Droplets,
    color: "#b02a1e",
    tag: "Coagulation Care",
  },
  {
    id: "knocked-out",
    title: "Knocked Out Tooth",
    desc: "Dental avulsion from sports or accidents. Keep the tooth in milk and arrive within 60 minutes.",
    icon: Activity,
    color: "#27ae60",
    tag: "Time Critical (60m)",
  },
  {
    id: "wisdom-pain",
    title: "Wisdom Tooth Pain",
    desc: "Pericoronitis, lockjaw, or intense pain radiating to ear and neck from impacted wisdom teeth.",
    icon: HelpCircle,
    color: "#cf9448",
    tag: "Surgical Relief",
  },
];

export function EmergencyServices() {
  return (
    <section className="py-20 sm:py-28 bg-[#fbf8f4]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase text-[#925a27] mb-3">
            Comprehensive Triage
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2a1c12]">
            Our Emergency Dentist Can Help With{" "}
            <span className="accent-text">The Following</span>
          </h2>
          <p className="mt-4 text-[#6b5848] text-base leading-relaxed">
            From sudden accidents to escalating infections, we treat every kind of urgent oral crisis with gentle, pain-free techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EMERGENCY_CONDITIONS.map((cond) => {
            const Icon = cond.icon;
            return (
              <div
                key={cond.id}
                className="group relative rounded-xl bg-white p-7   shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="size-14 rounded-xl bg-[#cf9448]/15 text-[#925a27] flex items-center justify-center transition-transform group-hover:scale-110">
                      <Icon className="size-7" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#925a27] text-white">
                      {cond.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#2a1c12] group-hover:text-[#925a27] transition-colors">
                    {cond.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-[#6b5848] leading-relaxed">
                    {cond.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4   flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#925a27]">Emergency Slot</span>
                  <a
                    href="tel:07311871456"
                    className="font-bold text-[#925a27] hover:underline flex items-center gap-1"
                  >
                    Call Now &rarr;
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
