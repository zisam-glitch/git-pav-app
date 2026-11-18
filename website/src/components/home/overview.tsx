import { Phone } from "lucide-react";
import { Reveal } from "./reveal";

const POINTS = [
  "Oral hygiene advisory & assessment",
  "Dental public health insurance",
  "Free online appointment booking",
  "Various cosmetic dentistry services",
  "Special care dentistry services",
  "Oral surgery",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Overview() {
  return (
    <section id="overview" className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-[87rem] gap-10 px-4 sm:px-6 lg:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">Practice</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Comprehensive Dental Services: Book Online, Specialized Care, and{" "}
            <span className="text-[#754B3D]">Insurance Support</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65">
            Providing expert oral surgery, comprehensive dental hygiene assessments, cosmetic
            dentistry, special care services, and public health insurance assistance, our clinic
            ensures top-notch care for all your dental needs. Enjoy the convenience of free online
            appointment booking to easily schedule your visits.
          </p>

          <div className="mt-8 grid max-w-xl gap-6 sm:grid-cols-2">
            <ul className="space-y-3 text-sm text-black/80">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#F2EDE5] text-xs font-medium text-[#1B3745]">
                    +
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center">
              <img src="/media/gdc.png" alt="General Dental Council registered" className="max-h-20 w-auto" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <aside className="hims-tile-warm rounded-[1.5rem] border border-black/6 p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
            <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-[#1B3745]">
              Working Hours
            </h3>
            <ul className="mt-5 divide-y divide-black/6 text-sm">
              {DAYS.map((d) => (
                <li key={d} className="flex items-center justify-between py-3">
                  <span className="text-black/60">{d}</span>
                  <span className="font-medium tabular-nums text-black">00:00 – 24:00</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 border border-black/6">
              <Phone className="mt-0.5 size-5 text-[#1B3745]" aria-hidden />
              <div>
                <p className="text-xs text-black/55">For private appointments</p>
                <a href="tel:08001938786" className="text-base font-medium text-black hover:text-[#1B3745]">
                  0800 1938 786
                </a>
              </div>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
