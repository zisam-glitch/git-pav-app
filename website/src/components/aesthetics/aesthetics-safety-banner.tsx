import { CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

const SAFETY_POINTS = [
  {
    title: "Age Limit (18+)",
    description:
      "For the well-being and safety of our patients, all individuals seeking treatment with us MUST be at least 18 years of age.",
    icon: ShieldAlert,
  },
  {
    title: "Things to Know",
    description:
      "Before you embark on your journey, we take time to walk through key clinical details, suitability, and realistic outcomes.",
    icon: CheckCircle2,
  },
  {
    title: "CQC Regulated Clinic",
    description:
      "We adhere to rigorous Care Quality Commission guidelines for cleanliness, sterilisation, staff training, and personal protective equipment.",
    icon: ShieldCheck,
  },
];

export function AestheticsSafetyBanner() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient rounded-[1.5rem] px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Patient safety first
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                How we are keeping you safe
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                At Pav Dental, your safety is paramount. We prioritise your well-being and have
                implemented stringent measures to create a safe and healthy environment. By
                choosing Pav Dental, you can trust that we meet the highest standards of quality
                and safety.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {SAFETY_POINTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/12 bg-white/6 p-6 sm:p-7"
                  >
                    <Icon className="size-6 text-[#ECD880]" />
                    <h3 className="mt-4 font-display text-xl font-normal tracking-[-0.02em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
