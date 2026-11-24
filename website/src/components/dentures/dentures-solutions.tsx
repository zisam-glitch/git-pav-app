import { CheckCircle2, Layers, Shield, Sparkles } from "lucide-react";
import { Section } from "@/components/hims";

const SOLUTIONS = [
  { title: "Full Dentures", icon: Sparkles },
  { title: "Partial Dentures", icon: Layers },
  { title: "Implant-Supported Dentures", icon: Shield },
  { title: "Flexible Dentures", icon: CheckCircle2 },
] as const;

/** Benefits row (Hims product pages: icon + title tiles under the buying panel). */
export function DenturesSolutions() {
  return (
    <Section id="solutions" theme="white" space="sm" aria-label="Denture solutions">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h2 className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]">
          We offer a variety of <span className="text-[#8a4242]">denture solutions</span>
        </h2>
      </div>
      <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SOLUTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <li
              key={s.title}
              className="flex flex-col gap-10 rounded-[24px] bg-[#f4f2ee] p-6 md:p-7"
            >
              <span className="grid size-11 place-items-center rounded-full bg-white text-[#8a4242]">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="text-h4 text-fg">{s.title}</h3>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
