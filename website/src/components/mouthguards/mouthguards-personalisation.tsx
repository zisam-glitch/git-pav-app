import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const PERSONALISATION_OPTIONS = [
  {
    title: "Name",
    desc: "Add your name for easy identification.",
  },
  {
    title: "Initials",
    desc: "Personalise cleanly with your initials.",
  },
  {
    title: "Team Name",
    desc: "Show your club or school team pride.",
  },
  {
    title: "Number",
    desc: "Include your squad or player number.",
  },
  {
    title: "Custom Logo",
    desc: "Add your team or club emblem if required.",
  },
];

export function MouthguardsPersonalisation() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] hims-navy-gradient px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                  Make it yours
                </p>
                <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                  Add Personalisation
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/75">
                  Personalise your mouthguard with your name, initials, team name, number, or even
                  a custom logo if required.
                </p>
              </div>
              <Button asChild variant="gold" size="lg" className="shrink-0">
                <a href={BOOKING_URL}>
                  Order custom mouthguard <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {PERSONALISATION_OPTIONS.map((option, i) => (
                <div
                  key={option.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/8 p-6 backdrop-blur-sm"
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#ECD880] text-xs font-medium text-[#1B3745]">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-normal tracking-[-0.02em] text-white">
                    {option.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
