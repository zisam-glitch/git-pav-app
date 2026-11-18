import { Plane, Cpu, GraduationCap, Users } from "lucide-react";

const PERKS = [
  { icon: Plane, label: "Visa Sponsorship" },
  { icon: Cpu, label: "Advanced Tech" },
  { icon: GraduationCap, label: "Mentorship" },
  { icon: Users, label: "Supportive Team" },
] as const;

export function VacanciesHero() {
  return (
    <section className="py-4 sm:py-6">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-[1.5rem] hims-navy-gradient px-6 py-16 text-center text-white sm:px-10 sm:py-24">
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/media/hims/suite-editorial.jpg"
              alt=""
              className="h-full w-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B3745] via-[#1B3745]/85 to-[#2E4F5F]/75" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
              Careers at Pav Dental
            </p>
            <h1 className="mt-4 font-display text-4xl font-normal leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Build Your Future at <span className="text-[#ECD880]">Pav Dental</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              Join a growing practice committed to clinical excellence, mentorship, and supporting
              dental professionals at every stage of their career.
            </p>

            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
              {PERKS.map((perk) => (
                <div
                  key={perk.label}
                  className="rounded-[1.25rem] border border-white/12 bg-white/8 p-4 backdrop-blur-xs"
                >
                  <perk.icon className="mx-auto mb-2.5 size-6 text-[#ECD880]" aria-hidden="true" />
                  <h2 className="font-display text-sm font-normal tracking-[-0.01em] text-white">
                    {perk.label}
                  </h2>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
